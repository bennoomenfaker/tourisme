import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { CircuitService } from './circuit.service';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { CreateCircuitDayDto } from './dto/create-circuit-day.dto';
import { CreateCircuitOptionDto } from './dto/create-circuit-option.dto';
import { ReserveCircuitDto } from './dto/reserve-circuit.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Circuits')
@Controller('circuits')
export class CircuitController {
  constructor(private readonly service: CircuitService) {}

  /**
   * Crée un nouveau circuit (guide ou project owner)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCircuitDto) {
    const isGuide = req.user.role === Role.GUIDE;
    return this.service.create(req.user.sub, isGuide ? 'guide' : 'project_owner', dto);
  }

  /**
   * Liste publique des circuits approuvés
   */
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * Détail d'un circuit avec jours, programme et options
   */
  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /**
   * Circuits de l'auteur connecté
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  /**
   * Ajoute un jour au circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Post(':circuitId/days')
  addDay(@Param('circuitId') circuitId: string, @Body() dto: CreateCircuitDayDto) {
    return this.service.addDay(circuitId, dto);
  }

  /**
   * Ajoute une option au circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Post(':circuitId/options')
  addOption(@Param('circuitId') circuitId: string, @Body() dto: CreateCircuitOptionDto) {
    return this.service.addOption(circuitId, dto);
  }

  /**
   * Options disponibles pour un circuit
   */
  @Public()
  @Get(':circuitId/options')
  findOptions(@Param('circuitId') circuitId: string) {
    return this.service.findOptions(circuitId);
  }

  /**
   * Réserve un circuit (éco-voyageur)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Post(':circuitId/reserve')
  reserve(@Req() req: any, @Param('circuitId') circuitId: string, @Body() dto: ReserveCircuitDto) {
    return this.service.reserve(req.user.sub, { ...dto, circuit_id: circuitId });
  }

  /**
   * Réservations de circuits du voyageur
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Get('reservations/mine')
  myReservations(@Req() req: any) {
    return this.service.findReservationsByUser(req.user.sub);
  }
}
