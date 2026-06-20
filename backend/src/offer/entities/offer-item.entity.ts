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
import { Offer } from './offer.entity';
import { OfferItemPrice } from './offer-item-price.entity';
import { OfferItemSession } from './offer-item-session.entity';
import { OfferItemCapacity } from './offer-item-capacity.entity';

/**
 * Élément réellement vendable dans une offre
 * Exemples : "Couscous", "Tente 2 places", "Vélo VTT", "Atelier poterie"
 * Un OfferItem est l'unité de réservation : on réserve un item, pas une offre entière
 */
@Entity('offer_items')
export class OfferItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer;

  @Column()
  name!: string;
  // "Couscous", "Tente 2 places", "Vélo VTT"

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  item_type!: string | null;
  // 'room' | 'bed' | 'camping_space' | 'dish' | 'menu'
  // | 'equipment' | 'activity' | 'workshop' | 'transport_service'
  // | 'dormitory' | 'private_room' | 'tent_space' | 'kayak' | 'restaurant'

  @Column({ type: 'int', nullable: true })
  bed_count!: number | null;
  // Nombre de lits pour un hébergement

  @Column({ type: 'int', nullable: true })
  nights!: number | null;
  // Nombre de nuits pour un séjour

  @Column({ type: 'int', nullable: true })
  tent_capacity!: number | null;
  // Capacité en personnes pour un espace tente

  @Column({ type: 'varchar', nullable: true })
  room_type!: string | null;
  // 'shared_dormitory' | 'private' | 'double' | 'family' | 'tent'

  @Column({ type: 'json', nullable: true })
  details_json!: Record<string, any> | null;
  // Infos complémentaires libres (matériel fourni, prérequis, etc.)

  @Column({ default: false })
  requires_confirmation!: boolean;

  @Column({ type: 'varchar', nullable: true })
  confirmation_mode!: string | null;
  // 'automatic' | 'manual'

  @Column({ type: 'int', nullable: true })
  booking_deadline_days!: number | null;
  // Réservation au plus tard X jours avant la date

  @Column({ type: 'int', nullable: true })
  cancellation_deadline_days!: number | null;
  // Annulation gratuite jusqu'à X jours avant

  @Column({ type: 'int', nullable: true })
  production_delay_days!: number | null;
  // Délai de préparation après confirmation (ex: 2 jours pour un plat)

  @Column({ default: 'active' })
  status!: string;
  // 'active' | 'inactive'

  @OneToMany(() => OfferItemPrice, (p) => p.offerItem)
  prices!: OfferItemPrice[];

  @OneToMany(() => OfferItemSession, (s) => s.offerItem)
  sessions!: OfferItemSession[];

  @OneToMany(() => OfferItemCapacity, (c) => c.offerItem)
  capacity!: OfferItemCapacity[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
