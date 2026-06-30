import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideOffering } from './entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from './entities/guide-offering-availability-rule.entity';
import {
  CreateGuideOfferingDto,
  UpdateGuideOfferingDto,
  CreateGuideOfferingAvailabilityRuleDto,
} from './dto/guide-offering.dto';

@Injectable()
export class GuideOfferingService {
  constructor(
    @InjectRepository(GuideOffering)
    private readonly repo: Repository<GuideOffering>,
    @InjectRepository(GuideOfferingAvailabilityRule)
    private readonly ruleRepo: Repository<GuideOfferingAvailabilityRule>,
  ) {}

  async create(guideId: string, dto: CreateGuideOfferingDto): Promise<GuideOffering> {
    const offering = this.repo.create({
      guide_id: guideId,
      title: dto.title,
      description: dto.description ?? null,
      languages: dto.languages ?? null,
      price: dto.price,
      pricing_unit: dto.pricing_unit ?? 'hour',
      min_travelers: dto.min_travelers ?? null,
      max_travelers: dto.max_travelers ?? null,
      service_zone_type: dto.service_zone_type ?? 'point',
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      radius_km: dto.radius_km ?? null,
      zone_governorate: dto.zone_governorate ?? null,
      zone_municipality: dto.zone_municipality ?? null,
      displacement_allowed: dto.displacement_allowed ?? false,
      displacement_max_km: dto.displacement_max_km ?? null,
      displacement_type: dto.displacement_type ?? null,
    });
    return this.repo.save(offering);
  }

  async findByGuide(guideId: string): Promise<GuideOffering[]> {
    return this.repo.find({
      where: { guide_id: guideId },
      relations: ['availabilityRules'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<GuideOffering> {
    const offering = await this.repo.findOne({
      where: { id },
      relations: ['availabilityRules'],
    });
    if (!offering) throw new NotFoundException('Offre de guidage introuvable.');
    return offering;
  }

  async findAllPublic(): Promise<GuideOffering[]> {
    return this.repo.find({
      where: { status: 'active' },
      relations: ['availabilityRules'],
      order: { created_at: 'DESC' },
    });
  }

  async update(guideId: string, id: string, dto: UpdateGuideOfferingDto): Promise<GuideOffering> {
    const offering = await this.findById(id);
    if (offering.guide_id !== guideId) throw new ForbiddenException('Accès refusé.');
    Object.assign(offering, dto);
    return this.repo.save(offering);
  }

  async remove(guideId: string, id: string): Promise<{ message: string }> {
    const offering = await this.findById(id);
    if (offering.guide_id !== guideId) throw new ForbiddenException('Accès refusé.');
    await this.repo.remove(offering);
    return { message: 'Offre de guidage supprimée.' };
  }

  async addAvailabilityRule(offeringId: string, dto: CreateGuideOfferingAvailabilityRuleDto): Promise<GuideOfferingAvailabilityRule> {
    await this.findById(offeringId);
    const rule = this.ruleRepo.create({
      guideOffering: { id: offeringId } as GuideOffering,
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

  async findAvailabilityRules(offeringId: string): Promise<GuideOfferingAvailabilityRule[]> {
    await this.findById(offeringId);
    return this.ruleRepo.find({
      where: { guideOffering: { id: offeringId }, is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  async removeAvailabilityRule(ruleId: string): Promise<{ message: string }> {
    const rule = await this.ruleRepo.findOne({ where: { id: ruleId } });
    if (!rule) throw new NotFoundException('Règle de disponibilité introuvable.');
    await this.ruleRepo.remove(rule);
    return { message: 'Règle supprimée.' };
  }
}
