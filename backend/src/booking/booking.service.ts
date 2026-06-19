import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingParticipant } from './entities/booking-participant.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingParticipant)
    private readonly participantRepo: Repository<BookingParticipant>,
    @InjectRepository(OfferItemSession)
    private readonly sessionRepo: Repository<OfferItemSession>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Crée une réservation avec ses participants
   * Génère une référence unique pour le suivi
   */
  async create(travelerId: string, dto: CreateBookingDto): Promise<Booking> {
    if (dto.session_id) {
      const session = await this.sessionRepo.findOne({ where: { id: dto.session_id } });
      if (!session) throw new NotFoundException('Session introuvable');
      if (session.status === 'full') throw new BadRequestException('Cette session est complète');
      if (session.remaining_capacity !== null && session.remaining_capacity <= 0) {
        throw new BadRequestException('Plus de places disponibles pour cette session');
      }
    }

    const offer = await this.offerRepo.findOne({ where: { id: dto.offer_id } });
    if (!offer) throw new NotFoundException('Offre introuvable');

    const existingBooking = await this.bookingRepo.findOne({
      where: { traveler: { id: travelerId } as any, offer: { id: dto.offer_id } as any, status: Not('cancelled') },
    });
    if (existingBooking) {
      throw new BadRequestException('Vous avez déjà réservé cette offre');
    }

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

    const notifType = booking.status === 'confirmed' ? 'booking_confirmed' : 'booking_request';
    const notifTitle = booking.status === 'confirmed' ? 'Réservation confirmée' : 'Demande de réservation';
    const travelerMsg = booking.status === 'confirmed'
      ? `Votre réservation ${saved.booking_ref} pour "${offer.title}" a été confirmée.`
      : `Votre demande de réservation ${saved.booking_ref} pour "${offer.title}" a été envoyée. Le prestataire va la confirmer.`;
    this.notificationService.create(travelerId, notifType, notifTitle, travelerMsg, `/bookings/${saved.id}`).catch(() => {});

    if (offer.author_id && offer.author_id !== travelerId) {
      const providerMsg = booking.status === 'confirmed'
        ? `Nouvelle réservation ${saved.booking_ref} confirmée pour "${offer.title}" par un voyageur.`
        : `Nouvelle demande de réservation ${saved.booking_ref} pour "${offer.title}" en attente de votre confirmation.`;
      this.notificationService.create(offer.author_id, 'new_booking_request', 'Nouvelle réservation', providerMsg, `/dashboard/incoming`).catch(() => {});
    }

    return this.bookingRepo.findOne({
      where: { id: saved.id },
      relations: ['participants', 'offer'],
    }) as Promise<Booking>;
  }

  /** Récupère les réservations d'un voyageur */
  async findByTraveler(travelerId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { traveler: { id: travelerId } },
      relations: ['offer', 'offerItem', 'session', 'participants'],
      order: { created_at: 'DESC' },
    });
  }

  /** Récupère une réservation par son ID */
  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['offer', 'offerItem', 'session', 'participants', 'traveler'],
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
    const saved = await this.bookingRepo.save(booking);
    this.notificationService.create(
      travelerId,
      'booking_cancelled',
      'Réservation annulée',
      `Votre réservation ${saved.booking_ref} a été annulée.${reason ? ` Motif : ${reason}` : ''}`,
      `/bookings/${saved.id}`,
    ).catch(() => {});
    return saved;
  }

  /** Confirme une réservation (par le provider, mode manual) */
  async confirm(id: string, providerId: string): Promise<Booking> {
    const booking = await this.findById(id);
    const offer = await this.offerRepo.findOne({ where: { id: booking.offer.id } });
    if (!offer || offer.author_id !== providerId) {
      throw new ForbiddenException('Vous ne pouvez confirmer que les réservations de vos propres offres');
    }
    if (booking.status !== 'pending') {
      throw new BadRequestException('Cette réservation ne peut plus être confirmée');
    }
    booking.status = 'confirmed';
    const saved = await this.bookingRepo.save(booking);
    this.notificationService.create(
      booking.traveler.id,
      'booking_confirmed',
      'Réservation confirmée',
      `Votre réservation ${saved.booking_ref} pour "${offer.title}" a été confirmée par le prestataire.`,
      `/bookings/${saved.id}`,
    ).catch(() => {});
    return saved;
  }

  /** Récupère les réservations pour les offres d'un provider */
  async findByOfferAuthor(authorId: string): Promise<Booking[]> {
    return this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.offer', 'offer')
      .leftJoinAndSelect('booking.traveler', 'traveler')
      .leftJoinAndSelect('booking.participants', 'participants')
      .where('offer.author_id = :authorId', { authorId })
      .orderBy('booking.created_at', 'DESC')
      .getMany();
  }

  /** Ajoute des participants à une réservation existante */
  async addParticipants(
    bookingId: string,
    travelerId: string,
    participants: { full_name: string; age?: number; document_type?: string; document_number?: string; is_group_leader?: boolean }[],
  ): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (booking.traveler.id !== travelerId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres réservations');
    }
    if (booking.status === 'cancelled') {
      throw new ForbiddenException('Impossible d\'ajouter des participants à une réservation annulée');
    }
    const entities = participants.map((p) =>
      this.participantRepo.create({
        booking: { id: bookingId } as Booking,
        full_name: p.full_name,
        age: p.age ?? null,
        document_type: p.document_type ?? null,
        document_number: p.document_number ?? null,
        is_group_leader: p.is_group_leader ?? false,
      }),
    );
    await this.participantRepo.save(entities);
    return this.findById(bookingId);
  }
}
