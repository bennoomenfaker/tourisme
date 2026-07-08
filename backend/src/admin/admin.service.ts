import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { Project } from '../project-owner/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { ModerationLog } from './entities/moderation-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Publication)
    private readonly pubRepo: Repository<Publication>,

    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    @InjectRepository(GuideOffering)
    private readonly guideOfferingRepo: Repository<GuideOffering>,

    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,

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

    @InjectRepository(ModerationLog)
    private readonly logRepo: Repository<ModerationLog>,

    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Publications ─────────────────────────────────────────────────────────

  getPendingPublications() {
    return this.pubRepo.find({
      where: { status: 'pending' },
      order: { created_at: 'DESC' },
    });
  }

  async approvePublication(id: string, adminId: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'approved';
    pub.rejection_reason = null;
    const saved = await this.pubRepo.save(pub);
    if (pub.author_id) {
      this.notificationService
        .create(
          pub.author_id,
          'admin_approved',
          'Publication approuvée',
          `Votre publication "${pub.title}" a été approuvée par l'administration.`,
          `/publications/${pub.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'publication', id, 'approve');
    return saved;
  }

  async rejectPublication(id: string, reason: string, adminId: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'rejected';
    pub.rejection_reason = reason;
    const saved = await this.pubRepo.save(pub);
    if (pub.author_id) {
      this.notificationService
        .create(
          pub.author_id,
          'admin_rejected',
          'Publication rejetée',
          `Votre publication "${pub.title}" a été rejetée. Motif : ${reason}`,
          `/publications/${pub.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'publication', id, 'reject', reason);
    return saved;
  }

  // ─── Offers ───────────────────────────────────────────────────────────────

  getPendingOffers() {
    return this.offerRepo.find({
      where: [{ status: 'pending' }, { status: 'draft' }],
      order: { created_at: 'DESC' },
    });
  }

  async approveOffer(id: string, adminId: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'approved';
    offer.rejection_reason = null;
    const saved = await this.offerRepo.save(offer);
    if (offer.author_id) {
      this.notificationService
        .create(
          offer.author_id,
          'admin_approved',
          'Offre approuvée',
          `Votre offre "${offer.title}" a été approuvée par l'administration.`,
          `/offers/${offer.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'offer', id, 'approve');
    return saved;
  }

  async rejectOffer(id: string, reason: string, adminId: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'rejected';
    offer.rejection_reason = reason;
    const saved = await this.offerRepo.save(offer);
    if (offer.author_id) {
      this.notificationService
        .create(
          offer.author_id,
          'admin_rejected',
          'Offre rejetée',
          `Votre offre "${offer.title}" a été rejetée. Motif : ${reason}`,
          `/offers/${offer.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'offer', id, 'reject', reason);
    return saved;
  }

  // ─── Projects ─────────────────────────────────────────────────────────────

  getPendingProjects() {
    return this.projectRepo.find({
      where: { status: 'pending' },
      order: { created_at: 'DESC' },
    });
  }

  async approveProject(id: string, adminId: string) {
    const project = await this.findProjectOrFail(id);
    project.status = 'active';
    project.rejection_reason = null;
    const saved = await this.projectRepo.save(project);
    if (project.owner_id) {
      this.notificationService
        .create(
          project.owner_id,
          'admin_approved',
          'Projet approuvé',
          `Votre projet "${project.name}" a été approuvé par l'administration.`,
          `/projects/${project.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'project', id, 'approve');
    return saved;
  }

  async rejectProject(id: string, reason: string, adminId: string) {
    const project = await this.findProjectOrFail(id);
    project.status = 'rejected';
    project.rejection_reason = reason;
    const saved = await this.projectRepo.save(project);
    if (project.owner_id) {
      this.notificationService
        .create(
          project.owner_id,
          'admin_rejected',
          'Projet rejeté',
          `Votre projet "${project.name}" a été rejeté. Motif : ${reason}`,
          `/projects/${project.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'project', id, 'reject', reason);
    return saved;
  }

  // ─── Circuits ──────────────────────────────────────────────────────────────

  getPendingCircuits() {
    return this.circuitRepo.find({
      where: { status: 'pending' },
      order: { created_at: 'DESC' },
    });
  }

  isValidCircuitTransition(current: string, next: string): boolean {
    const allowed: Record<string, string[]> = {
      draft: ['pending', 'archived'],
      pending: ['approved', 'rejected', 'archived'],
      approved: ['archived'],
      rejected: ['draft', 'archived'],
      archived: [],
    };
    if (current === next) return true;
    return allowed[current]?.includes(next) ?? false;
  }

  async approveCircuit(id: string, adminId: string) {
    const circuit = await this.findCircuitOrFail(id);
    if (!this.isValidCircuitTransition(circuit.status, 'approved')) {
      throw new BadRequestException(
        `Transition de statut interdite : ${circuit.status} → approved`,
      );
    }
    circuit.status = 'approved';
    circuit.rejection_reason = null;
    const saved = await this.circuitRepo.save(circuit);
    if (circuit.author_id) {
      this.notificationService
        .create(
          circuit.author_id,
          'admin_approved',
          'Circuit approuvé',
          `Votre circuit "${circuit.title}" a été approuvé par l'administration.`,
          `/circuits/${circuit.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'circuit', id, 'approve');
    return saved;
  }

  async rejectCircuit(id: string, reason: string, adminId: string) {
    const circuit = await this.findCircuitOrFail(id);
    if (!this.isValidCircuitTransition(circuit.status, 'rejected')) {
      throw new BadRequestException(
        `Transition de statut interdite : ${circuit.status} → rejected`,
      );
    }
    circuit.status = 'rejected';
    circuit.rejection_reason = reason;
    const saved = await this.circuitRepo.save(circuit);
    if (circuit.author_id) {
      this.notificationService
        .create(
          circuit.author_id,
          'admin_rejected',
          'Circuit rejeté',
          `Votre circuit "${circuit.title}" a été rejeté. Motif : ${reason}`,
          `/circuits/${circuit.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'circuit', id, 'reject', reason);
    return saved;
  }

  async archiveCircuit(id: string, adminId: string) {
    const circuit = await this.findCircuitOrFail(id);
    if (!this.isValidCircuitTransition(circuit.status, 'archived')) {
      throw new BadRequestException(
        `Transition de statut interdite : ${circuit.status} → archived`,
      );
    }
    circuit.status = 'archived';
    const saved = await this.circuitRepo.save(circuit);
    if (circuit.author_id) {
      this.notificationService
        .create(
          circuit.author_id,
          'admin_approved',
          'Circuit archivé',
          `Votre circuit "${circuit.title}" a été archivé.`,
          `/circuits/${circuit.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'circuit', id, 'archive');
    return saved;
  }

  // ─── Guide Offerings ───────────────────────────────────────────────────────

  getPendingGuideOfferings() {
    return this.guideOfferingRepo.find({
      where: { status: 'pending' },
      order: { created_at: 'DESC' },
    });
  }

  async approveGuideOffering(id: string, adminId: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    offering.status = 'active';
    const saved = await this.guideOfferingRepo.save(offering);
    if (offering.guide_id) {
      this.notificationService
        .create(
          offering.guide_id,
          'admin_approved',
          'Service de guidage approuvé',
          `Votre offre de guidage "${offering.title}" a été approuvée par l'administration.`,
          `/guide-offerings/${offering.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'guide-offering', id, 'approve');
    return saved;
  }

  async rejectGuideOffering(id: string, reason: string, adminId: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    offering.status = 'rejected';
    const saved = await this.guideOfferingRepo.save(offering);
    if (offering.guide_id) {
      this.notificationService
        .create(
          offering.guide_id,
          'admin_rejected',
          'Service de guidage rejeté',
          `Votre offre de guidage "${offering.title}" a été rejetée. Motif : ${reason}`,
          `/guide-offerings/${offering.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'guide-offering', id, 'reject', reason);
    return saved;
  }

  async archiveGuideOffering(id: string, adminId: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    offering.status = 'archived';
    const saved = await this.guideOfferingRepo.save(offering);
    if (offering.guide_id) {
      this.notificationService
        .create(
          offering.guide_id,
          'admin_approved',
          'Service de guidage archivé',
          `Votre offre de guidage "${offering.title}" a été archivée.`,
          `/guide-offerings/${offering.id}`,
        )
        .catch(() => {});
    }
    await this.logAction(adminId, 'guide-offering', id, 'archive');
    return saved;
  }

  // ─── Ban management ───────────────────────────────────────────────────────

  async getBannedUsers() {
    const users = await this.userRepo.find({
      where: { status: 'banned' as any },
    });
    return Promise.all(
      users.map(async (u) => {
        let profile: any = null;
        if (u.role === 'eco_traveler')
          profile = await this.ecoRepo.findOne({ where: { user_id: u.id } });
        else if (u.role === 'guide')
          profile = await this.guideRepo.findOne({ where: { user_id: u.id } });
        else if (u.role === 'project')
          profile = await this.ownerRepo.findOne({ where: { user_id: u.id } });
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
      }),
    );
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
    await this.mailService.sendAccountBanned(
      user.email,
      null,
      note ?? '',
      banDays ?? 0,
    );
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

  private async findCircuitOrFail(id: string) {
    const circuit = await this.circuitRepo.findOne({ where: { id } });
    if (!circuit) throw new NotFoundException('Circuit introuvable.');
    return circuit;
  }

  private async findGuideOfferingOrFail(id: string) {
    const offering = await this.guideOfferingRepo.findOne({ where: { id } });
    if (!offering) throw new NotFoundException('Offre de guidage introuvable.');
    return offering;
  }

  private async logAction(
    adminId: string,
    entityType: string,
    entityId: string,
    action: string,
    reason?: string,
  ) {
    await this.logRepo.save({
      admin_id: adminId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      reason: reason ?? null,
    });
  }
}
