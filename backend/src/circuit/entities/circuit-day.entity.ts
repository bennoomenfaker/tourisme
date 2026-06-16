import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Circuit } from './circuit.entity';

/**
 * Journée d'un circuit
 * Chaque jour a un numéro, une date (optionnelle), un titre et une description
 * Exemple : "Jour 1 - Arrivée et installation au camp de base"
 */
@Entity('circuit_days')
export class CircuitDay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Circuit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuit_id' })
  circuit!: Circuit;

  @Column()
  day_number!: number;

  @Column({ type: 'date', nullable: true })
  date!: Date | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
