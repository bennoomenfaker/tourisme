import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../project-owner/entities/project.entity';
import { OfferCategory } from './offer-category.entity';
import { OfferItem } from './offer-item.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Qui a créé cette offre (polymorphisme guide / project_owner)
  @Column('uuid')
  author_id!: string;

  @Column({ type: 'varchar' })
  author_type!: string; // 'guide' | 'project_owner'

  // FK vers le projet (nullable : les guides n'ont pas de projet)
  @Column({ type: 'uuid', nullable: true })
  project_id!: string | null;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'project_id' })
  project!: Project | null;

  // Catégorie (remplace progressivement offer_type)
  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => OfferCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category!: OfferCategory | null;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  // Prix indicatif (auto-calculé depuis les prix des items si null)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  // Durée en texte libre : "2h", "1 journée", "3 jours"
  @Column({ type: 'varchar', nullable: true })
  duration!: string | null;

  // Type d'offre (déprécié, migrer vers category_id)
  @Column({ type: 'varchar', nullable: true })
  offer_type!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  images!: string[] | null;

  @Column({ type: 'text', nullable: true })
  inclusions!: string | null;

  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  // Adresse postale complète (distincte du point de rendez-vous)
  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  // Coordonnées GPS de l'adresse (vs meeting_lat/lng pour le point de rendez-vous)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', nullable: true })
  meeting_point!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  meeting_lat!: number | null;

  @Column({ type: 'varchar', default: 'fixed' })
  location_type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  meeting_lng!: number | null;

  @Column({ type: 'int', nullable: true })
  min_group_size!: number | null;

  @Column({ type: 'int', nullable: true })
  max_group_size!: number | null;

  @Column({ type: 'int', nullable: true })
  min_age!: number | null;

  @Column({ type: 'text', nullable: true })
  cancellation_policy!: string | null;

  @Column({ type: 'int', nullable: true })
  sustainability_score!: number | null;

  // 'automatic' = confirmation instantanée, 'manual' = le provider valide
  @Column({ type: 'varchar', default: 'automatic' })
  confirmation_mode!: string;

  // pending = en attente / approved = visible / rejected = refusé
  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  @OneToMany(() => OfferItem, (item) => item.offer)
  items!: OfferItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}