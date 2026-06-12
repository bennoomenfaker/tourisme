import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Project } from '../project-owner/entities/project.entity';
import { CreateOfferDto, OfferSustainabilityDto, UpdateOfferDto } from './dto/offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly repo: Repository<Offer>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async create(authorId: string, authorType: string, dto: CreateOfferDto, initialStatus: string = 'pending'): Promise<Offer> {
    if (dto.project_id) {
      const project = await this.projectRepo.findOne({ where: { id: dto.project_id } });
      if (!project) throw new NotFoundException('Projet introuvable.');
      if (project.status !== 'active') {
        throw new BadRequestException('Impossible de lier une offre à un projet non encore validé par l\'administrateur.');
      }
    }

    const offer = this.repo.create({
      author_id: authorId,
      author_type: authorType,
      title: dto.title,
      description: dto.description ?? null,
      price: dto.price ?? null,
      duration: dto.duration ?? null,
      offer_type: dto.offer_type ?? null,
      images:              dto.images?.length ? dto.images : null,
      inclusions:          dto.inclusions ?? null,
      region:              dto.region ?? null,
      meeting_point:       dto.meeting_point ?? null,
      meeting_lat:         dto.meeting_lat ?? null,
      meeting_lng:         dto.meeting_lng ?? null,
      min_group_size:      dto.min_group_size ?? null,
      max_group_size:      dto.max_group_size ?? null,
      min_age:             dto.min_age ?? null,
      cancellation_policy: dto.cancellation_policy ?? null,
      project_id:          dto.project_id ?? null,
      status: initialStatus,
    });
    return this.repo.save(offer);
  }

  // Toutes les offres d'un auteur (son propre dashboard)
  async findByAuthor(authorId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
    });
  }

  // Offres publiques d'un auteur (page profil vue par d'autres) — approuvées uniquement
  async findPublishedByAuthor(authorId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { author_id: authorId, status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  // Toutes les offres approuvées (page publique Destinations)
  async findAllPublic(): Promise<Offer[]> {
    return this.repo.find({
      where: { status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  // Offres rattachées à un projet spécifique — approuvées uniquement
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
    if (dto.images !== undefined) offer.images = dto.images.length ? dto.images : null;
    if (dto.inclusions          !== undefined) offer.inclusions          = dto.inclusions;
    if (dto.region              !== undefined) offer.region              = dto.region;
    if (dto.meeting_point       !== undefined) offer.meeting_point       = dto.meeting_point;
    if (dto.meeting_lat         !== undefined) offer.meeting_lat         = dto.meeting_lat ?? null;
    if (dto.meeting_lng         !== undefined) offer.meeting_lng         = dto.meeting_lng ?? null;
    if (dto.min_group_size      !== undefined) offer.min_group_size      = dto.min_group_size;
    if (dto.max_group_size      !== undefined) offer.max_group_size      = dto.max_group_size;
    if (dto.min_age             !== undefined) offer.min_age             = dto.min_age;
    if (dto.cancellation_policy !== undefined) offer.cancellation_policy = dto.cancellation_policy;
    if (dto.status              !== undefined) offer.status              = dto.status;

    return this.repo.save(offer);
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
    return { message: 'Offre supprimée.' };
  }

  private async findOrFail(id: string): Promise<Offer> {
    const offer = await this.repo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    return offer;
  }
}