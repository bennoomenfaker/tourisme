import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Circuit / Package multi-jours organisé par un guide ou project owner
 * Différence avec Offer : un Circuit est un assemblage structuré
 * avec programme jour par jour, options, et prix global
 *
 * Exemples : trek, festival, séjour organisé, circuit culturel
 */
@Entity('circuits')
export class Circuit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  author_id!: string;

  @Column()
  author_type!: string;
  // 'guide' | 'project_owner'

  @Column({ type: 'uuid', nullable: true })
  project_id!: string | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'date', nullable: true })
  start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({ type: 'int', nullable: true })
  duration_days!: number | null;

  @Column({ type: 'int', nullable: true })
  duration_nights!: number | null;

  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_price!: number | null;

  @Column({ default: 'XAF' })
  currency!: string;

  @Column({ type: 'int', nullable: true })
  max_participants!: number | null;

  @Column({ type: 'int', nullable: true })
  booking_deadline_days!: number | null;

  @Column({ type: 'varchar', nullable: true })
  confirmation_mode!: string | null;

  @Column({ type: 'text', nullable: true })
  inclusions!: string | null;

  @Column({ type: 'text', nullable: true })
  exclusions!: string | null;

  @Column({ default: 'pending' })
  status!: string;
  // 'pending' | 'approved' | 'rejected' | 'archived'

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
