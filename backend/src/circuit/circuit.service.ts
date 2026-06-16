import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from './entities/circuit.entity';
import { CircuitDay } from './entities/circuit-day.entity';
import { CircuitProgramItem } from './entities/circuit-program-item.entity';
import { CircuitOption } from './entities/circuit-option.entity';
import { CircuitReservation } from './entities/circuit-reservation.entity';
import { CircuitReservationOption } from './entities/circuit-reservation-option.entity';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { CreateCircuitDayDto } from './dto/create-circuit-day.dto';
import { CreateCircuitOptionDto } from './dto/create-circuit-option.dto';
import { ReserveCircuitDto } from './dto/reserve-circuit.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CircuitService {
  constructor(
    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,
    @InjectRepository(CircuitDay)
    private readonly dayRepo: Repository<CircuitDay>,
    @InjectRepository(CircuitProgramItem)
    private readonly programItemRepo: Repository<CircuitProgramItem>,
    @InjectRepository(CircuitOption)
    private readonly optionRepo: Repository<CircuitOption>,
    @InjectRepository(CircuitReservation)
    private readonly reservationRepo: Repository<CircuitReservation>,
    @InjectRepository(CircuitReservationOption)
    private readonly reservationOptionRepo: Repository<CircuitReservationOption>,
  ) {}

  // ─── Circuits ──────────────────────────────────────────

  async create(authorId: string, authorType: string, dto: CreateCircuitDto): Promise<Circuit> {
    const circuit = this.circuitRepo.create({
      author_id: authorId,
      author_type: authorType,
      title: dto.title,
      description: dto.description ?? null,
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      duration_days: dto.duration_days ?? null,
      duration_nights: dto.duration_nights ?? null,
      region: dto.region ?? null,
      base_price: dto.base_price ?? null,
      currency: dto.currency ?? 'XAF',
      max_participants: dto.max_participants ?? null,
      booking_deadline_days: dto.booking_deadline_days ?? null,
      confirmation_mode: dto.confirmation_mode ?? null,
      inclusions: dto.inclusions ?? null,
      exclusions: dto.exclusions ?? null,
      project_id: dto.project_id ?? null,
    });
    return this.circuitRepo.save(circuit);
  }

  async findAll(): Promise<Circuit[]> {
    return this.circuitRepo.find({
      where: { status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<Circuit> {
    const circuit = await this.circuitRepo.findOne({
      where: { id },
      relations: ['days', 'days.programItems', 'options'],
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    return circuit;
  }

  async findByAuthor(authorId: string): Promise<Circuit[]> {
    return this.circuitRepo.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, dto: Partial<CreateCircuitDto>): Promise<Circuit> {
    const circuit = await this.findById(id);
    Object.assign(circuit, dto);
    return this.circuitRepo.save(circuit);
  }

  // ─── Jours du circuit ──────────────────────────────────

  async addDay(circuitId: string, dto: CreateCircuitDayDto): Promise<CircuitDay> {
    const circuit = await this.circuitRepo.findOne({ where: { id: circuitId } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    const day = this.dayRepo.create({
      circuit: { id: circuitId } as Circuit,
      day_number: dto.day_number,
      date: dto.date ?? null,
      title: dto.title,
      description: dto.description ?? null,
    });
    return this.dayRepo.save(day);
  }

  // ─── Options du circuit ────────────────────────────────

  async addOption(circuitId: string, dto: CreateCircuitOptionDto): Promise<CircuitOption> {
    const circuit = await this.circuitRepo.findOne({ where: { id: circuitId } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    const option = this.optionRepo.create({
      circuit: { id: circuitId } as Circuit,
      offer_item_id: dto.offer_item_id ?? null,
      option_group: dto.option_group ?? null,
      option_type: dto.option_type,
      is_required: dto.is_required ?? false,
      is_included: dto.is_included ?? false,
      extra_price: dto.extra_price ?? null,
      selection_mode: dto.selection_mode ?? null,
      min_quantity: dto.min_quantity ?? null,
      max_quantity: dto.max_quantity ?? null,
    });
    return this.optionRepo.save(option);
  }

  async findOptions(circuitId: string): Promise<CircuitOption[]> {
    return this.optionRepo.find({
      where: { circuit: { id: circuitId } },
    });
  }

  // ─── Réservation de circuit ────────────────────────────

  async reserve(userId: string, dto: ReserveCircuitDto): Promise<CircuitReservation> {
    const circuit = await this.circuitRepo.findOne({ where: { id: dto.circuit_id } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');

    const reservation = this.reservationRepo.create({
      circuit: { id: dto.circuit_id } as Circuit,
      user: { id: userId } as User,
      participants_count: dto.participants_count ?? 1,
      base_total: dto.base_total ?? circuit.base_price ?? 0,
      options_total: 0,
      final_total: dto.base_total ?? circuit.base_price ?? 0,
    });
    const saved = await this.reservationRepo.save(reservation);

    // Sauvegarde des options choisies
    if (dto.options?.length) {
      let optionsTotal = 0;
      for (const opt of dto.options) {
        const optEntity = await this.optionRepo.findOne({
          where: { id: opt.circuit_option_id },
        });
        if (!optEntity) continue;
        const lineTotal = (opt.unit_price ?? Number(optEntity.extra_price) ?? 0) * (opt.quantity ?? 1);
        optionsTotal += lineTotal;
        await this.reservationOptionRepo.save(
          this.reservationOptionRepo.create({
            circuitReservation: { id: saved.id } as CircuitReservation,
            circuitOption: { id: opt.circuit_option_id } as CircuitOption,
            offer_item_session_id: opt.offer_item_session_id ?? null,
            quantity: opt.quantity ?? 1,
            unit_price: opt.unit_price ?? Number(optEntity.extra_price) ?? 0,
            total_price: lineTotal,
          }),
        );
      }
      saved.options_total = optionsTotal;
      saved.final_total = (dto.base_total ?? Number(circuit.base_price) ?? 0) + optionsTotal;
      return this.reservationRepo.save(saved);
    }

    return saved;
  }

  async findReservationsByUser(userId: string): Promise<CircuitReservation[]> {
    return this.reservationRepo.find({
      where: { user: { id: userId } },
      relations: ['circuit'],
      order: { created_at: 'DESC' },
    });
  }
}
