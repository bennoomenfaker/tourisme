import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { TripPlan } from './entities/trip-plan.entity';
import { TripPlanItem } from './entities/trip-plan-item.entity';
import { CreateTripPlanDto } from './dto/create-trip-plan.dto';
import { UpdateTripPlanDto } from './dto/update-trip-plan.dto';
import { AddTripPlanItemDto, UpdateTripPlanItemDto } from './dto/add-trip-plan-item.dto';
import { BookTripPlanDto } from './dto/book-trip-plan.dto';
import { User } from '../users/entities/user.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Booking } from '../booking/entities/booking.entity';
import { BookingParticipant } from '../booking/entities/booking-participant.entity';
import { NotificationService } from '../notification/notification.service';
import { EcoTravelerMongoService } from '../eco-traveler/eco-traveler-mongo.service';

@Injectable()
export class TripPlanService {
  constructor(
    @InjectRepository(TripPlan)
    private readonly tripPlanRepo: Repository<TripPlan>,
    @InjectRepository(TripPlanItem)
    private readonly itemRepo: Repository<TripPlanItem>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingParticipant)
    private readonly participantRepo: Repository<BookingParticipant>,
    @InjectRepository(OfferItemSession)
    private readonly sessionRepo: Repository<OfferItemSession>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource,
    private readonly mongoService: EcoTravelerMongoService,
  ) {}

  // ─── TripPlan CRUD ───────────────────────────────────

  async create(ecoTravelerId: string, dto: CreateTripPlanDto): Promise<TripPlan> {
    const plan = this.tripPlanRepo.create({
      ecoTraveler: { id: ecoTravelerId } as User,
      title: dto.title,
      description: dto.description ?? null,
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
    });
    const saved = await this.tripPlanRepo.save(plan);

    this.mongoService.incrementStat(ecoTravelerId, 'plans_shared').catch(() => {});

    return saved;
  }

  async findByTraveler(ecoTravelerId: string): Promise<TripPlan[]> {
    return this.tripPlanRepo.find({
      where: { ecoTraveler: { id: ecoTravelerId } },
      relations: ['items', 'items.offerItem', 'items.offerItem.offer'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<TripPlan> {
    const plan = await this.tripPlanRepo.findOne({
      where: { id },
      relations: ['items', 'items.offerItem', 'items.offerItem.offer', 'items.offerItem.prices', 'ecoTraveler'],
    });
    if (!plan) throw new NotFoundException('Plan de voyage introuvable');
    return plan;
  }

  async findByIdForOwner(id: string, ecoTravelerId: string): Promise<TripPlan> {
    const plan = await this.findById(id);
    if (plan.ecoTraveler.id !== ecoTravelerId) {
      throw new ForbiddenException('Ce plan ne vous appartient pas');
    }
    return plan;
  }

  async update(id: string, ecoTravelerId: string, dto: UpdateTripPlanDto): Promise<TripPlan> {
    const plan = await this.findByIdForOwner(id, ecoTravelerId);
    Object.assign(plan, {
      ...dto,
      start_date: dto.start_date ? new Date(dto.start_date) : plan.start_date,
      end_date: dto.end_date ? new Date(dto.end_date) : plan.end_date,
    });
    return this.tripPlanRepo.save(plan);
  }

  async remove(id: string, ecoTravelerId: string): Promise<void> {
    const plan = await this.findByIdForOwner(id, ecoTravelerId);
    await this.tripPlanRepo.remove(plan);
  }

  // ─── TripPlan Items ──────────────────────────────────

  async addItem(tripPlanId: string, ecoTravelerId: string, dto: AddTripPlanItemDto): Promise<TripPlanItem> {
    await this.findByIdForOwner(tripPlanId, ecoTravelerId);

    const item = this.itemRepo.create({
      tripPlan: { id: tripPlanId } as TripPlan,
      offerItem: { id: dto.offer_item_id } as OfferItem,
      day_number: dto.day_number ?? null,
      sort_order: dto.sort_order ?? 0,
      notes: dto.notes ?? null,
    });
    return this.itemRepo.save(item);
  }

  async updateItem(
    tripPlanId: string,
    itemId: string,
    ecoTravelerId: string,
    dto: UpdateTripPlanItemDto,
  ): Promise<TripPlanItem> {
    await this.findByIdForOwner(tripPlanId, ecoTravelerId);

    const item = await this.itemRepo.findOne({
      where: { id: itemId, tripPlan: { id: tripPlanId } },
    });
    if (!item) throw new NotFoundException('Élément introuvable dans ce plan');

    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async removeItem(tripPlanId: string, itemId: string, ecoTravelerId: string): Promise<void> {
    await this.findByIdForOwner(tripPlanId, ecoTravelerId);

    const item = await this.itemRepo.findOne({
      where: { id: itemId, tripPlan: { id: tripPlanId } },
    });
    if (!item) throw new NotFoundException('Élément introuvable dans ce plan');

    await this.itemRepo.remove(item);
  }

  // ─── Booking from TripPlan ───────────────────────────

  async book(tripPlanId: string, ecoTravelerId: string, dto: BookTripPlanDto): Promise<Booking[]> {
    await this.findByIdForOwner(tripPlanId, ecoTravelerId);
    const fullPlan = await this.tripPlanRepo.findOne({
      where: { id: tripPlanId },
      relations: ['items', 'items.offerItem', 'items.offerItem.offer', 'items.offerItem.prices'],
    });
    if (!fullPlan?.items?.length) {
      throw new BadRequestException('Ce plan ne contient aucun élément à réserver');
    }

    const participantCount = dto.participants?.filter(p => p.full_name?.trim())?.length ?? 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookings: Booking[] = [];

      for (const item of fullPlan.items) {
        const offerItem = item.offerItem;
        if (!offerItem) continue;

        const offer = offerItem.offer;
        if (!offer) continue;

        if (offer.max_group_size && participantCount > offer.max_group_size) {
          throw new BadRequestException(
            `Le nombre de participants (${participantCount}) dépasse la limite autorisée pour "${offer.title}" (${offer.max_group_size} max)`
          );
        }

        if (offer.min_age != null && dto.participants?.some(p => p.age != null && p.age < offer.min_age!)) {
          throw new BadRequestException(
            `Un participant est trop jeune pour "${offer.title}" (âge minimum: ${offer.min_age} ans)`
          );
        }

        const defaultPrice = offerItem.prices?.find((p) => p.is_default) ?? offerItem.prices?.[0];
        const totalPrice = defaultPrice ? Number(defaultPrice.price) * participantCount : 0;

        const refSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const booking = queryRunner.manager.create(Booking, {
          booking_ref: `BK-${refSuffix}`,
          traveler: { id: ecoTravelerId } as User,
          offer: { id: offer.id } as any,
          offerItem: { id: offerItem.id } as OfferItem,
          total_price: totalPrice,
          special_requests: dto.special_requests ?? null,
          confirmation_mode: offer.confirmation_mode ?? 'automatic',
          status: offer.confirmation_mode === 'manual' ? 'pending' : 'confirmed',
        });

        const saved = await queryRunner.manager.save(Booking, booking);

        if (dto.participants?.length) {
          const participants = dto.participants.map((p) =>
            queryRunner.manager.create(BookingParticipant, {
              booking: { id: saved.id } as Booking,
              full_name: p.full_name,
              age: p.age ?? null,
              document_type: p.document_type ?? null,
              document_number: p.document_number ?? null,
              is_group_leader: p.is_group_leader ?? false,
            }),
          );
          await queryRunner.manager.save(BookingParticipant, participants);
        }

        bookings.push(saved);

        if (offer.confirmation_mode === 'manual' && offer.author_id) {
          const notifType = 'booking_request';
          const notifTitle = 'Demande de réservation Trip Plan';
          const notifBody = `Un voyageur réserve "${offer.title}" via un Trip Plan. ${participantCount} participant(s). En attente de votre confirmation.`;
          const notifLink = `/dashboard/incoming`;
          this.notificationService.create(offer.author_id, notifType, notifTitle, notifBody, notifLink).catch(() => {});
        }
      }

      await queryRunner.commitTransaction();

      this.mongoService.incrementStat(ecoTravelerId, 'reservations_made').catch(() => {});

      const count = bookings.length;
      this.notificationService.create(
        ecoTravelerId,
        'booking_request',
        'Réservation Trip Plan',
        `${count} élément${count > 1 ? 's' : ''} réservé${count > 1 ? 's' : ''} depuis votre Trip Plan.`,
        `/trip-plans/${tripPlanId}`,
      ).catch(() => {});

      return this.bookingRepo.find({
        where: { id: In(bookings.map((b) => b.id)) },
        relations: ['offer', 'offerItem', 'participants'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Erreur lors de la réservation : ' + (err.message || 'erreur inconnu'));
    } finally {
      await queryRunner.release();
    }
  }
}
