import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingParticipant } from './entities/booking-participant.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingParticipant)
    private readonly participantRepo: Repository<BookingParticipant>,
  ) {}

  /**
   * Crée une réservation avec ses participants
   * Génère une référence unique pour le suivi
   */
  async create(travelerId: string, dto: CreateBookingDto): Promise<Booking> {
    const refSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const booking = this.bookingRepo.create({
      booking_ref: `BK-${refSuffix}`,
      traveler: { id: travelerId } as User,
      offer: { id: dto.offer_id } as Offer,
      offerItem: dto.offer_item_id ? ({ id: dto.offer_item_id } as OfferItem) : null,
      session: dto.session_id ? ({ id: dto.session_id } as OfferItemSession) : null,
      total_price: dto.total_price,
      currency: dto.currency ?? 'XAF',
      special_requests: dto.special_requests ?? null,
      confirmation_mode: dto.confirmation_mode ?? 'automatic',
      status: dto.confirmation_mode === 'manual' ? 'pending' : 'confirmed',
    });
    const saved = await this.bookingRepo.save(booking);

    // Création des participants si fournis
    if (dto.participants?.length) {
      const participants = dto.participants.map((p) =>
        this.participantRepo.create({
          booking: { id: saved.id } as Booking,
          full_name: p.full_name,
          age: p.age ?? null,
          document_type: p.document_type ?? null,
          document_number: p.document_number ?? null,
          is_group_leader: p.is_group_leader ?? false,
        }),
      );
      await this.participantRepo.save(participants);
    }

    return this.bookingRepo.findOne({
      where: { id: saved.id },
      relations: ['participants'],
    }) as Promise<Booking>;
  }

  /** Récupère les réservations d'un voyageur */
  async findByTraveler(travelerId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { traveler: { id: travelerId } },
      relations: ['offer', 'offerItem', 'session'],
      order: { created_at: 'DESC' },
    });
  }

  /** Récupère une réservation par son ID */
  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['offer', 'offerItem', 'session', 'participants'],
    });
    if (!booking) throw new NotFoundException('Réservation introuvable');
    return booking;
  }

  /** Annule une réservation (par le voyageur) */
  async cancel(id: string, travelerId: string, reason?: string): Promise<Booking> {
    const booking = await this.findById(id);
    if (booking.traveler.id !== travelerId) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres réservations');
    }
    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    booking.cancel_reason = reason ?? null;
    return this.bookingRepo.save(booking);
  }

  /** Confirme une réservation (par le provider, mode manual) */
  async confirm(id: string): Promise<Booking> {
    const booking = await this.findById(id);
    booking.status = 'confirmed';
    return this.bookingRepo.save(booking);
  }

  /** Récupère les réservations pour les offres d'un provider */
  async findByOfferAuthor(authorId: string): Promise<Booking[]> {
    return this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.offer', 'offer')
      .leftJoinAndSelect('booking.traveler', 'traveler')
      .where('offer.author_id = :authorId', { authorId })
      .orderBy('booking.created_at', 'DESC')
      .getMany();
  }
}
