import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Project } from '../project-owner/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Publication)
    private readonly pubRepo: Repository<Publication>,

    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(EcoTraveler)
    private readonly ecoRepo: Repository<EcoTraveler>,

    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,

    @InjectRepository(ProjectOwner)
    private readonly ownerRepo: Repository<ProjectOwner>,

    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Publications ─────────────────────────────────────────────────────────

  getPendingPublications() {
    return this.pubRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approvePublication(id: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'approved';
    pub.rejection_reason = null;
    const saved = await this.pubRepo.save(pub);
    if (pub.author_id) {
      this.notificationService.create(
        pub.author_id,
        'admin_approved',
        'Publication approuvée',
        `Votre publication "${pub.title}" a été approuvée par l'administration.`,
        `/publications/${pub.id}`,
      ).catch(() => {});
    }
    return saved;
  }

  async rejectPublication(id: string, reason: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'rejected';
    pub.rejection_reason = reason;
    const saved = await this.pubRepo.save(pub);
    if (pub.author_id) {
      this.notificationService.create(
        pub.author_id,
        'admin_rejected',
        'Publication rejetée',
        `Votre publication "${pub.title}" a été rejetée. Motif : ${reason}`,
        `/publications/${pub.id}`,
      ).catch(() => {});
    }
    return saved;
  }

  // ─── Offers ───────────────────────────────────────────────────────────────

  getPendingOffers() {
    return this.offerRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveOffer(id: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'approved';
    offer.rejection_reason = null;
    const saved = await this.offerRepo.save(offer);
    if (offer.author_id) {
      this.notificationService.create(
        offer.author_id,
        'admin_approved',
        'Offre approuvée',
        `Votre offre "${offer.title}" a été approuvée par l'administration.`,
        `/offers/${offer.id}`,
      ).catch(() => {});
    }
    return saved;
  }

  async rejectOffer(id: string, reason: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'rejected';
    offer.rejection_reason = reason;
    const saved = await this.offerRepo.save(offer);
    if (offer.author_id) {
      this.notificationService.create(
        offer.author_id,
        'admin_rejected',
        'Offre rejetée',
        `Votre offre "${offer.title}" a été rejetée. Motif : ${reason}`,
        `/offers/${offer.id}`,
      ).catch(() => {});
    }
    return saved;
  }

  // ─── Projects ─────────────────────────────────────────────────────────────

  getPendingProjects() {
    return this.projectRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveProject(id: string) {
    const project = await this.findProjectOrFail(id);
    project.status = 'active';
    project.rejection_reason = null;
    const saved = await this.projectRepo.save(project);
    if (project.owner_id) {
      this.notificationService.create(
        project.owner_id,
        'admin_approved',
        'Projet approuvé',
        `Votre projet "${project.name}" a été approuvé par l'administration.`,
        `/projects/${project.id}`,
      ).catch(() => {});
    }
    return saved;
  }

  async rejectProject(id: string, reason: string) {
    const project = await this.findProjectOrFail(id);
    project.status = 'rejected';
    project.rejection_reason = reason;
    const saved = await this.projectRepo.save(project);
    if (project.owner_id) {
      this.notificationService.create(
        project.owner_id,
        'admin_rejected',
        'Projet rejeté',
        `Votre projet "${project.name}" a été rejeté. Motif : ${reason}`,
        `/projects/${project.id}`,
      ).catch(() => {});
    }
    return saved;
  }

  // ─── Ban management ───────────────────────────────────────────────────────

  async getBannedUsers() {
    const users = await this.userRepo.find({ where: { status: 'banned' as any } });
    return Promise.all(users.map(async (u) => {
      let profile: any = null;
      if (u.role === 'eco_traveler') profile = await this.ecoRepo.findOne({ where: { user_id: u.id } });
      else if (u.role === 'guide') profile = await this.guideRepo.findOne({ where: { user_id: u.id } });
      else if (u.role === 'project') profile = await this.ownerRepo.findOne({ where: { user_id: u.id } });
      return {
        user_id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        ban_until: u.ban_until,
        banned_at: u.updated_at,
        full_name: profile?.full_name ?? null,
        photo: profile?.photo ?? null,
      };
    }));
  }

  async updateBan(userId: string, banDays?: number, note?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    user.status = 'banned' as any;
    if (banDays && banDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + banDays);
      d.setHours(23, 59, 59, 999);
      user.ban_until = d;
    } else {
      user.ban_until = null;
    }
    user.refresh_token = null;
    user.refresh_token_expires_at = null;
    await this.userRepo.save(user);
    await this.mailService.sendAccountBanned(user.email, null, note ?? '', banDays ?? 0);
    return { message: 'Ban mis à jour.', ban_until: user.ban_until };
  }

  async unbanUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    user.status = 'active' as any;
    user.ban_until = null;
    await this.userRepo.save(user);
    await this.mailService.sendUnban(user.email);
    return { message: 'Utilisateur débanni.' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findPubOrFail(id: string) {
    const pub = await this.pubRepo.findOne({ where: { id } });
    if (!pub) throw new NotFoundException('Publication introuvable.');
    return pub;
  }

  private async findOfferOrFail(id: string) {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    return offer;
  }

  private async findProjectOrFail(id: string) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Projet introuvable.');
    return project;
  }
}
