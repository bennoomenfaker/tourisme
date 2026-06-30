import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { GuideOffering } from './entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from './entities/guide-offering-availability-rule.entity';

@Injectable()
export class GuideSearchService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
    @InjectRepository(GuideOffering)
    private readonly offeringRepo: Repository<GuideOffering>,
    @InjectRepository(GuideOfferingAvailabilityRule)
    private readonly ruleRepo: Repository<GuideOfferingAvailabilityRule>,
  ) {}

  async search(params: {
    date?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    language?: string;
    max_price?: number;
    min_capacity?: number;
    displacement_allowed?: boolean;
    query?: string;
  }) {
    const qb = this.guideRepo.createQueryBuilder('guide')
      .where('guide.status = :status', { status: 'active' });

    if (params.query) {
      qb.andWhere('LOWER(guide.full_name) LIKE :q', { q: `%${params.query.toLowerCase()}%` });
    }

    const guides = await qb.getMany();
    const guideIds = guides.map((g) => g.user_id);

    if (!guideIds.length) return [];

    const offeringsQb = this.offeringRepo.createQueryBuilder('offering')
      .where('offering.guide_id IN (:...guideIds)', { guideIds });

    if (params.max_price !== undefined) {
      offeringsQb.andWhere('offering.price <= :maxPrice', { maxPrice: params.max_price });
    }

    if (params.language) {
      offeringsQb.andWhere('offering.languages LIKE :lang', { lang: `%${params.language}%` });
    }

    if (params.displacement_allowed !== undefined) {
      offeringsQb.andWhere('offering.displacement_allowed = :disp', { disp: params.displacement_allowed });
    }

    const offerings = await offeringsQb.getMany();

    if (!offerings.length) return [];

    const offeringMap = new Map<string, GuideOffering[]>();
    for (const o of offerings) {
      if (!offeringMap.has(o.guide_id)) offeringMap.set(o.guide_id, []);
      offeringMap.get(o.guide_id)!.push(o);
    }

    const matchedGuideIds = new Set(offerings.map((o) => o.guide_id));

    if (params.lat !== undefined && params.lng !== undefined) {
      for (const offering of offerings) {
        if (offering.service_zone_type === 'all_tunisia') continue;
        if (offering.lat !== null && offering.lng !== null && offering.radius_km !== null) {
          const distance = this.haversine(
            params.lat, params.lng,
            Number(offering.lat), Number(offering.lng),
          );
          if (distance <= Number(offering.radius_km)) continue;
          if (offering.displacement_allowed && offering.displacement_max_km !== null && distance <= Number(offering.displacement_max_km)) continue;
          matchedGuideIds.delete(offering.guide_id);
        }
      }
    }

    if (params.date) {
      const targetDate = new Date(params.date);
      const targetDay = targetDate.getDay();

      for (const offering of offerings) {
        if (!matchedGuideIds.has(offering.guide_id)) continue;

        const rules = await this.ruleRepo.find({
          where: {
            guideOffering: { id: offering.id },
            is_active: true,
          },
        });

        const isAvailable = rules.some((rule) => {
          if (rule.availability_type === 'on_demand') return true;
          if (rule.availability_type === 'date_range' || rule.availability_type === 'weekly') {
            if (rule.start_date && targetDate < new Date(rule.start_date)) return false;
            if (rule.end_date && targetDate > new Date(rule.end_date)) return false;
            if (rule.weekdays?.length && !rule.weekdays.includes(targetDay)) return false;
            return true;
          }
          if (rule.availability_type === 'daily') return true;
          return false;
        });

        if (!isAvailable) matchedGuideIds.delete(offering.guide_id);
      }
    }

    const result = guides.filter((g) => matchedGuideIds.has(g.user_id));

    return result.map((g) => ({
      ...g,
      offerings: offeringMap.get(g.user_id) || [],
    }));
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
