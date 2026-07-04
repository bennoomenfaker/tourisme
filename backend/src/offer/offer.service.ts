import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { OfferCategory } from './entities/offer-category.entity';
import { OfferItem } from './entities/offer-item.entity';
import { OfferItemPrice } from './entities/offer-item-price.entity';
import { OfferItemCapacity } from './entities/offer-item-capacity.entity';
import { OfferItemAvailabilityRule } from './entities/offer-item-availability-rule.entity';
import { OfferItemSession } from './entities/offer-item-session.entity';
import { Project } from '../project-owner/entities/project.entity';
import { RedisService } from '../redis/redis.service';
import {
  CreateOfferDto,
  OfferSustainabilityDto,
  UpdateOfferDto,
  CreateOfferItemDto,
  UpdateOfferItemDto,
  CreateOfferItemPriceDto,
  UpdateOfferItemPriceDto,
  CreateAvailabilityRuleDto,
  CreateOfferItemSessionDto,
  UpdateOfferItemSessionDto,
} from './dto/offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly repo: Repository<Offer>,
    @InjectRepository(OfferCategory)
    private readonly categoryRepo: Repository<OfferCategory>,
    @InjectRepository(OfferItem)
    private readonly itemRepo: Repository<OfferItem>,
    @InjectRepository(OfferItemPrice)
    private readonly priceRepo: Repository<OfferItemPrice>,
    @InjectRepository(OfferItemAvailabilityRule)
    private readonly ruleRepo: Repository<OfferItemAvailabilityRule>,
    @InjectRepository(OfferItemSession)
    private readonly sessionRepo: Repository<OfferItemSession>,
    @InjectRepository(OfferItemCapacity)
    private readonly capacityRepo: Repository<OfferItemCapacity>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly redis: RedisService,
  ) {}

  private readonly OFFER_CACHE_PREFIX = 'offer:';

  private invalidateOfferCache(): Promise<void> {
    return this.redis.delByPattern(`${this.OFFER_CACHE_PREFIX}*`);
  }

  // ─── Offer CRUD ────────────────────────────────────────

  async create(authorId: string, authorType: string, dto: CreateOfferDto, initialStatus: string = 'pending'): Promise<Offer> {
    if (authorType === 'project_owner') {
      if (!dto.project_id) {
        throw new BadRequestException('Les offres doivent être liées à un projet.');
      }
    }

    let projectLat: number | null = null;
    let projectLng: number | null = null;
    let projectRegion: string | null = null;
    let projectAddress: string | null = null;

    if (dto.project_id) {
      const project = await this.projectRepo.findOne({ where: { id: dto.project_id } });
      if (!project) throw new NotFoundException('Projet introuvable.');
      if (project.status !== 'active') {
        throw new BadRequestException('Impossible de lier une offre à un projet non encore validé par l\'administrateur.');
      }
      projectLat = project.lat;
      projectLng = project.lng;
      projectRegion = project.region;
      projectAddress = project.address;
    }

    const locationType = dto.location_type ?? 'fixed';
    const isFixed = locationType === 'fixed';

    const offer = this.repo.create({
      author_id: authorId,
      author_type: authorType,
      title: dto.title,
      description: dto.description ?? null,
      price: dto.price ?? null,
      duration: dto.duration ?? null,
      offer_type: dto.offer_type ?? null,
      category: dto.category_id ? ({ id: dto.category_id } as OfferCategory) : null,
      images: dto.images?.length ? dto.images : null,
      inclusions: dto.inclusions ?? null,
      region: isFixed ? projectRegion : (dto.region ?? null),
      address: isFixed ? projectAddress : (dto.address ?? null),
      latitude: isFixed ? projectLat : (dto.latitude ?? null),
      longitude: isFixed ? projectLng : (dto.longitude ?? null),
      meeting_point: dto.meeting_point ?? null,
      meeting_lat: dto.meeting_lat ?? null,
      meeting_lng: dto.meeting_lng ?? null,
      min_group_size: dto.min_group_size ?? null,
      max_group_size: dto.max_group_size ?? null,
      min_age: dto.min_age ?? null,
      cancellation_policy: dto.cancellation_policy ?? null,
      confirmation_mode: dto.confirmation_mode ?? 'automatic',
      deposit_percentage: dto.deposit_percentage ?? 0,
      production_delay_days: dto.production_delay_days ?? null,
      fulfillment_mode: dto.fulfillment_mode ?? null,
      project_id: dto.project_id ?? null,
      location_type: locationType,
      status: initialStatus,
    });
    const saved = await this.repo.save(offer);
    await this.invalidateOfferCache();
    return saved;
  }

  async findByAuthor(authorId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { author_id: authorId },
      relations: ['items', 'items.prices', 'project'],
      order: { created_at: 'DESC' },
    });
  }

  async findPublishedByAuthor(authorId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { author_id: authorId, status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  async findPublic(
    category?: string,
    excludeAuthor?: string,
    region?: string,
    geo?: { lat?: number; lng?: number; radiusKm?: number; itemType?: string },
  ): Promise<Offer[]> {
    const qb = this.repo.createQueryBuilder('offer')
      .leftJoinAndSelect('offer.items', 'items')
      .leftJoinAndSelect('items.prices', 'prices')
      .leftJoinAndSelect('offer.project', 'project')
      .where('offer.status = :status', { status: 'approved' });

    if (category) qb.andWhere('offer.offer_type = :category', { category });
    if (excludeAuthor) qb.andWhere('offer.author_id != :ex', { ex: excludeAuthor });
    if (region) qb.andWhere('offer.region = :region', { region });
    if (geo?.itemType) qb.andWhere('items.item_type = :itemType', { itemType: geo.itemType });

    if (geo?.lat !== undefined && geo?.lng !== undefined && geo?.radiusKm !== undefined) {
      const radiusMeters = geo.radiusKm * 1000;
      qb.andWhere(
        `ST_DWithin(
          ST_MakePoint(offer.longitude, offer.latitude)::geography,
          ST_MakePoint(:lng, :lat)::geography,
          :radius
        )`,
        { lng: geo.lng, lat: geo.lat, radius: radiusMeters },
      );
    }

    return qb.orderBy('offer.created_at', 'DESC').getMany();
  }

  async findAllPublic(region?: string): Promise<Offer[]> {
    const cacheKey = region
      ? `${this.OFFER_CACHE_PREFIX}list:region:${region}`
      : `${this.OFFER_CACHE_PREFIX}list:all`;
    const cached = await this.redis.get<Offer[]>(cacheKey);
    if (cached) return cached;

    const where: any = { status: 'approved' };
    if (region) where.region = region;
    const offers = await this.repo.find({
      where,
      order: { created_at: 'DESC' },
      relations: ['items', 'items.prices', 'project'],
    });

    await this.redis.set(cacheKey, offers);
    return offers;
  }

  async findById(id: string): Promise<Offer> {
    const cacheKey = `${this.OFFER_CACHE_PREFIX}detail:${id}`;
    const cached = await this.redis.get<Offer>(cacheKey);
    if (cached) return cached;

    const offer = await this.repo.findOne({
      where: { id },
      relations: ['items', 'items.prices', 'items.sessions', 'items.capacity', 'category', 'project'],
    });
    if (!offer) throw new NotFoundException('Offre introuvable.');

    await this.redis.set(cacheKey, offer);
    return offer;
  }

  async findByProject(projectId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { project_id: projectId, status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  async update(authorId: string, offerId: string, dto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');

    if (dto.title !== undefined) offer.title = dto.title;
    if (dto.description !== undefined) offer.description = dto.description;
    if (dto.price !== undefined) offer.price = dto.price;
    if (dto.duration !== undefined) offer.duration = dto.duration;
    if (dto.offer_type !== undefined) offer.offer_type = dto.offer_type;
    if (dto.category_id !== undefined) offer.category = { id: dto.category_id } as OfferCategory;
    if (dto.images !== undefined) offer.images = dto.images.length ? dto.images : null;
    if (dto.inclusions !== undefined) offer.inclusions = dto.inclusions;
    if (dto.region !== undefined) offer.region = dto.region;
    if (dto.address !== undefined) offer.address = dto.address;
    if (dto.latitude !== undefined) offer.latitude = dto.latitude ?? null;
    if (dto.longitude !== undefined) offer.longitude = dto.longitude ?? null;
    if (dto.meeting_point !== undefined) offer.meeting_point = dto.meeting_point;
    if (dto.meeting_lat !== undefined) offer.meeting_lat = dto.meeting_lat ?? null;
    if (dto.meeting_lng !== undefined) offer.meeting_lng = dto.meeting_lng ?? null;
    if (dto.min_group_size !== undefined) offer.min_group_size = dto.min_group_size;
    if (dto.max_group_size !== undefined) offer.max_group_size = dto.max_group_size;
    if (dto.min_age !== undefined) offer.min_age = dto.min_age;
    if (dto.cancellation_policy !== undefined) offer.cancellation_policy = dto.cancellation_policy;
    if (dto.confirmation_mode !== undefined) offer.confirmation_mode = dto.confirmation_mode;
    if (dto.status !== undefined) offer.status = dto.status;
    if (dto.location_type !== undefined) offer.location_type = dto.location_type;
    if (dto.deposit_percentage !== undefined) offer.deposit_percentage = dto.deposit_percentage;
    if (dto.production_delay_days !== undefined) offer.production_delay_days = dto.production_delay_days;
    if (dto.fulfillment_mode !== undefined) offer.fulfillment_mode = dto.fulfillment_mode;

    await this.repo.save(offer);
    await this.invalidateOfferCache();
    return this.findById(offerId);
  }

  async updateOfferSustainability(authorId: string, offerId: string, dto: OfferSustainabilityDto): Promise<Offer> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    offer.sustainability_score = dto.score;
    return this.repo.save(offer);
  }

  async remove(authorId: string, offerId: string): Promise<{ message: string }> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    await this.repo.remove(offer);
    await this.invalidateOfferCache();
    return { message: 'Offre supprimée.' };
  }

  private async findOrFail(id: string): Promise<Offer> {
    const offer = await this.repo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    return offer;
  }

  // ─── OfferItem ─────────────────────────────────────────

  async createItem(offerId: string, dto: CreateOfferItemDto): Promise<OfferItem> {
    await this.findOrFail(offerId);
    const item = this.itemRepo.create({
      offer: { id: offerId } as Offer,
      name: dto.name,
      description: dto.description ?? null,
      item_type: dto.item_type ?? null,
      details_json: dto.details_json ?? null,
      requires_confirmation: dto.requires_confirmation ?? false,
      confirmation_mode: dto.confirmation_mode ?? null,
      booking_deadline_days: dto.booking_deadline_days ?? null,
      cancellation_deadline_days: dto.cancellation_deadline_days ?? null,
      production_delay_days: dto.production_delay_days ?? null,
    });
    return this.itemRepo.save(item);
  }

  async findItems(offerId: string): Promise<OfferItem[]> {
    return this.itemRepo.find({
      where: { offer: { id: offerId } },
      relations: ['prices', 'sessions'],
      order: { created_at: 'DESC' },
    });
  }

  async findItemById(itemId: string): Promise<OfferItem> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['prices', 'sessions', 'capacity'],
    });
    if (!item) throw new NotFoundException('Élément d\'offre introuvable.');
    return item;
  }

  async updateItem(itemId: string, dto: UpdateOfferItemDto): Promise<OfferItem> {
    const item = await this.findItemById(itemId);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async removeItem(itemId: string): Promise<{ message: string }> {
    const item = await this.findItemById(itemId);
    await this.itemRepo.remove(item);
    return { message: 'Élément supprimé.' };
  }

  // ─── OfferItem Prices ──────────────────────────────────

  async addPrice(itemId: string, dto: CreateOfferItemPriceDto): Promise<OfferItemPrice> {
    await this.findItemById(itemId);
    const price = this.priceRepo.create({
      offerItem: { id: itemId } as OfferItem,
      label: dto.label,
      price: dto.price,
      currency: dto.currency ?? 'TND',
      pricing_unit: dto.pricing_unit ?? 'per_person',
      min_quantity: dto.min_quantity ?? null,
      max_quantity: dto.max_quantity ?? null,
      is_default: dto.is_default ?? false,
    });
    return this.priceRepo.save(price);
  }

  async updatePrice(priceId: string, dto: UpdateOfferItemPriceDto): Promise<OfferItemPrice> {
    const price = await this.priceRepo.findOne({ where: { id: priceId } });
    if (!price) throw new NotFoundException('Prix introuvable.');
    Object.assign(price, dto);
    return this.priceRepo.save(price);
  }

  async removePrice(priceId: string): Promise<{ message: string }> {
    const price = await this.priceRepo.findOne({ where: { id: priceId } });
    if (!price) throw new NotFoundException('Prix introuvable.');
    await this.priceRepo.remove(price);
    return { message: 'Prix supprimé.' };
  }

  // ─── OfferItem Capacity ────────────────────────────────

  async setCapacity(itemId: string, dto: { capacity_type: string; total_quantity: number }): Promise<OfferItemCapacity> {
    await this.findItemById(itemId);
    // Remove existing capacity for this item
    const existing = await this.capacityRepo.find({ where: { offerItem: { id: itemId } } });
    if (existing.length) await this.capacityRepo.remove(existing);

    const cap = this.capacityRepo.create({
      offerItem: { id: itemId } as OfferItem,
      capacity_type: dto.capacity_type,
      total_quantity: dto.total_quantity,
      remaining_quantity: dto.total_quantity,
    });
    return this.capacityRepo.save(cap);
  }

  async getCapacity(itemId: string): Promise<OfferItemCapacity | null> {
    const caps = await this.capacityRepo.find({
      where: { offerItem: { id: itemId } },
    });
    return caps[0] ?? null;
  }

  async removeCapacity(capacityId: string): Promise<{ message: string }> {
    const cap = await this.capacityRepo.findOne({ where: { id: capacityId } });
    if (!cap) throw new NotFoundException('Capacité introuvable.');
    await this.capacityRepo.remove(cap);
    return { message: 'Capacité supprimée.' };
  }

  // ─── OfferItem Availability Rules ──────────────────────

  async addAvailabilityRule(itemId: string, dto: CreateAvailabilityRuleDto): Promise<OfferItemAvailabilityRule> {
    await this.findItemById(itemId);
    const rule = this.ruleRepo.create({
      offerItem: { id: itemId } as OfferItem,
      availability_type: dto.availability_type,
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      weekdays: dto.weekdays ?? null,
      start_time: dto.start_time ?? null,
      end_time: dto.end_time ?? null,
      recurrence_rule: dto.recurrence_rule ?? null,
    });
    return this.ruleRepo.save(rule);
  }

  async findAvailabilityRules(itemId: string): Promise<OfferItemAvailabilityRule[]> {
    await this.findItemById(itemId);
    return this.ruleRepo.find({
      where: { offerItem: { id: itemId }, is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  async removeAvailabilityRule(ruleId: string): Promise<{ message: string }> {
    const rule = await this.ruleRepo.findOne({ where: { id: ruleId } });
    if (!rule) throw new NotFoundException('Règle de disponibilité introuvable.');
    await this.ruleRepo.remove(rule);
    return { message: 'Règle supprimée.' };
  }

  async removeAllAvailabilityRules(itemId: string): Promise<void> {
    const rules = await this.ruleRepo.find({ where: { offerItem: { id: itemId } } });
    if (rules.length) {
      await this.ruleRepo.remove(rules);
    }
  }

  // ─── Session Generator ────────────────────────────────

  async generateSessions(itemId: string, daysAhead: number = 90): Promise<OfferItemSession[]> {
    const rules = await this.ruleRepo.find({
      where: { offerItem: { id: itemId }, is_active: true },
    });
    if (!rules.length) throw new BadRequestException('Aucune règle de disponibilité trouvée. Créez d\'abord une règle.');

    const item = await this.findItemById(itemId);
    const capacity = item.capacity?.[0]?.total_quantity ?? null;

    // Remove future sessions that have NO active bookings before regenerating
    const bookedSessionIds = await this.sessionRepo
      .createQueryBuilder('session')
      .select('session.id')
      .innerJoin('bookings', 'booking', 'booking.session_id = session.id AND booking.status != :cancelled', { cancelled: 'cancelled' })
      .where('session.offer_item_id = :itemId', { itemId })
      .getRawMany()
      .then((rows) => new Set(rows.map((r) => r.session_id)));

    const existing = await this.sessionRepo.find({
      where: { offerItem: { id: itemId } },
    });
    const deletable = existing.filter((s) => !bookedSessionIds.has(s.id));
    if (deletable.length) {
      await this.sessionRepo.remove(deletable);
    }

    const sessions: OfferItemSession[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + daysAhead);

    for (const rule of rules) {
      const startTime = rule.start_time ?? '09:00';
      const endTime = rule.end_time ?? '17:00';

      switch (rule.availability_type) {
        case 'date_range': {
          if (rule.start_date && rule.end_date) {
            const start = new Date(rule.start_date);
            const end = new Date(rule.end_date);
            const weekdays = rule.weekdays;

            for (let d = new Date(start); d <= end && d <= maxDate; d.setDate(d.getDate() + 1)) {
              if (d < today) continue;
              if (weekdays?.length && !weekdays.includes(d.getDay())) continue;
              sessions.push(this.sessionRepo.create({
                offerItem: { id: itemId } as OfferItem,
                date: d.toISOString().split('T')[0],
                start_time: startTime,
                end_time: endTime,
                total_capacity: capacity,
                remaining_capacity: capacity,
              }));
            }
          }
          break;
        }

        case 'weekly': {
          const weekdays = rule.weekdays ?? [1, 2, 3, 4, 5];
          for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
            if (weekdays.includes(d.getDay())) {
              sessions.push(this.sessionRepo.create({
                offerItem: { id: itemId } as OfferItem,
                date: d.toISOString().split('T')[0],
                start_time: startTime,
                end_time: endTime,
                total_capacity: capacity,
                remaining_capacity: capacity,
              }));
            }
          }
          break;
        }

        case 'daily': {
          for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
            sessions.push(this.sessionRepo.create({
              offerItem: { id: itemId } as OfferItem,
              date: d.toISOString().split('T')[0],
              start_time: startTime,
              end_time: endTime,
              total_capacity: capacity,
              remaining_capacity: capacity,
            }));
          }
          break;
        }

        case 'weekend_only': {
          for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
            const day = d.getDay();
            if (day === 0 || day === 6) {
              sessions.push(this.sessionRepo.create({
                offerItem: { id: itemId } as OfferItem,
                date: d.toISOString().split('T')[0],
                start_time: startTime,
                end_time: endTime,
                total_capacity: capacity,
                remaining_capacity: capacity,
              }));
            }
          }
          break;
        }

        case 'custom': {
          // RRULE support
          if (rule.recurrence_rule) {
            const rruleStr = rule.recurrence_rule;
            const freq = rruleStr.match(/FREQ=(\w+)/)?.[1];
            const byDay = rruleStr.match(/BYDAY=([\w,]+)/)?.[1]?.split(',');
            const byMonth = rruleStr.match(/BYMONTH=(\d+)/)?.[1];

            const dayMap: Record<string, number> = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };
            const targetDays = byDay?.map((d) => dayMap[d]).filter((d) => d !== undefined) ?? [];
            const targetMonth = byMonth ? parseInt(byMonth) - 1 : null;

            for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
              let match = false;
              if (freq === 'WEEKLY' && targetDays.length) {
                match = targetDays.includes(d.getDay());
              } else if (freq === 'YEARLY' && targetMonth !== null) {
                match = d.getMonth() === targetMonth && targetDays.includes(d.getDay());
              }
              if (match) {
                sessions.push(this.sessionRepo.create({
                  offerItem: { id: itemId } as OfferItem,
                  date: d.toISOString().split('T')[0],
                  start_time: startTime,
                  end_time: endTime,
                  total_capacity: capacity,
                  remaining_capacity: capacity,
                }));
              }
            }
          }
          break;
        }
      }
    }

    return this.sessionRepo.save(sessions);
  }

  // ─── OfferItem Sessions ────────────────────────────────

  async createSession(itemId: string, dto: CreateOfferItemSessionDto): Promise<OfferItemSession> {
    await this.findItemById(itemId);
    const session = this.sessionRepo.create({
      offerItem: { id: itemId } as OfferItem,
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      total_capacity: dto.total_capacity ?? null,
      remaining_capacity: dto.remaining_capacity ?? dto.total_capacity ?? null,
      price_override: dto.price_override ?? null,
    });
    return this.sessionRepo.save(session);
  }

  async updateSession(sessionId: string, dto: UpdateOfferItemSessionDto): Promise<OfferItemSession> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session introuvable.');
    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async removeSession(sessionId: string): Promise<{ message: string }> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session introuvable.');
    await this.sessionRepo.remove(session);
    return { message: 'Session supprimée.' };
  }

  async findMyItems(authorId: string): Promise<{ id: string; name: string; item_type: string | null; offer_id: string; offer_title: string }[]> {
    const offers = await this.findByAuthor(authorId);
    const items: { id: string; name: string; item_type: string | null; offer_id: string; offer_title: string }[] = [];
    for (const offer of offers) {
      for (const item of offer.items || []) {
        items.push({ id: item.id, name: item.name, item_type: item.item_type, offer_id: offer.id, offer_title: offer.title });
      }
    }
    return items;
  }

  async findSessions(itemId: string): Promise<OfferItemSession[]> {
    return this.sessionRepo.find({
      where: { offerItem: { id: itemId } },
      order: { date: 'ASC', start_time: 'ASC' },
    });
  }

  async getPopularLocations(): Promise<{ lat: number; lng: number; weight: number; label: string; type: string }[]> {
    const cacheKey = `${this.OFFER_CACHE_PREFIX}popular-locations`;
    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) return cached;

    const items = await this.itemRepo.find({
      where: { status: 'active' },
      relations: ['prices'],
    });

    const locations: { lat: number; lng: number; weight: number; label: string; type: string }[] = [];

    for (const item of items) {
      const details = item.details_json || {};
      const lat = details.lat || (item as any).lat;
      const lng = details.lng || (item as any).lng;
      if (lat != null && lng != null) {
        const priceCount = item.prices?.length || 1;
        const weight = Math.min(1 + priceCount * 0.3, 3);
        locations.push({ lat: Number(lat), lng: Number(lng), weight, label: item.name, type: 'offer' });
      }
    }

    await this.redis.set(cacheKey, locations, 600);
    return locations;
  }
}
