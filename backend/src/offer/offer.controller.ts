import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { OfferService } from './offer.service';
import {
  CreateOfferDto,
  OfferSustainabilityDto,
  UpdateOfferDto,
  CreateOfferItemDto,
  UpdateOfferItemDto,
  CreateOfferItemPriceDto,
  UpdateOfferItemPriceDto,
  CreateAvailabilityRuleDto,
  CreateOfferItemSessionDto,
  UpdateOfferItemSessionDto,
} from './dto/offer.dto';
import { Public } from '../common/decorators/public.decorator';
import { ProjectOwnerMongoService } from '../project-owner/project-owner-mongo.service';

const PROJECT_AMBASSADOR_BADGE = 'Propriétaire Ambassadeur AFRATIM';

@ApiTags('Offers')
@Controller('offers')
export class OfferController {
  constructor(
    private readonly service: OfferService,
    private readonly projectOwnerMongoService: ProjectOwnerMongoService,
  ) {}

  // ─── Offer ─────────────────────────────────────────

  /** Project Owner crée une offre (les guides utilisent guide-offerings) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateOfferDto) {
    const userId = req.user.sub;
    const mongoService = this.projectOwnerMongoService;
    const hasAmbassador = await mongoService.hasBadge(userId, PROJECT_AMBASSADOR_BADGE);
    return this.service.create(userId, 'project_owner', dto, hasAmbassador ? 'approved' : 'pending');
  }

  /** Mes propres offres (dashboard) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  /** Mes propres items d'offres */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Get('items/mine')
  findMyItems(@Req() req: any) {
    return this.service.findMyItems(req.user.sub);
  }

  /** Toutes les offres approuvées (page Destinations) */
  @Public()
  @Get()
  findAllPublic(@Query('region') region?: string) {
    return this.service.findAllPublic(region);
  }

  /** Offres publiées d'un auteur (page profil) */
  @Public()
  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string) {
    return this.service.findPublishedByAuthor(authorId);
  }

  /** Offres d'un projet spécifique */
  @Public()
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  /** Lieux populaires pour la heatmap */
  @Public()
  @Get('popular-locations')
  getPopularLocations() {
    return this.service.getPopularLocations();
  }

  /** Détail d'une offre (public) */
  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** Score de durabilité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Patch(':id/sustainability')
  updateSustainability(@Req() req: any, @Param('id') id: string, @Body() dto: OfferSustainabilityDto) {
    return this.service.updateOfferSustainability(req.user.sub, id, dto);
  }

  /** Modifier une offre */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.service.update(req.user.sub, id, dto);
  }

  /** Supprimer une offre */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }

  // ─── OfferItems ────────────────────────────────────

  /** Liste des items d'une offre (public) */
  @Public()
  @Get(':offerId/items')
  findItems(@Param('offerId') offerId: string) {
    return this.service.findItems(offerId);
  }

  /** Crée un item (variante) pour une offre */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post(':offerId/items')
  createItem(@Param('offerId') offerId: string, @Body() dto: CreateOfferItemDto) {
    return this.service.createItem(offerId, dto);
  }

  /** Détail d'un item */
  @Public()
  @Get('items/:itemId')
  findItemById(@Param('itemId') itemId: string) {
    return this.service.findItemById(itemId);
  }

  /** Modifier un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Patch('items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateOfferItemDto) {
    return this.service.updateItem(itemId, dto);
  }

  /** Supprimer un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(itemId);
  }

  // ─── OfferItem Prices ──────────────────────────────

  /** Ajoute un prix à un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post('items/:itemId/prices')
  addPrice(@Param('itemId') itemId: string, @Body() dto: CreateOfferItemPriceDto) {
    return this.service.addPrice(itemId, dto);
  }

  /** Modifier un prix */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Patch('items/prices/:priceId')
  updatePrice(@Param('priceId') priceId: string, @Body() dto: UpdateOfferItemPriceDto) {
    return this.service.updatePrice(priceId, dto);
  }

  /** Supprimer un prix */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete('items/prices/:priceId')
  removePrice(@Param('priceId') priceId: string) {
    return this.service.removePrice(priceId);
  }

  // ─── Availability Rules ────────────────────────────

  /** Ajoute une règle de disponibilité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post('items/:itemId/availability')
  addAvailabilityRule(@Param('itemId') itemId: string, @Body() dto: CreateAvailabilityRuleDto) {
    return this.service.addAvailabilityRule(itemId, dto);
  }

  /** Liste les règles de disponibilité */
  @Public()
  @Get('items/:itemId/availability')
  findAvailabilityRules(@Param('itemId') itemId: string) {
    return this.service.findAvailabilityRules(itemId);
  }

  /** Supprime une règle de disponibilité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete('availability/:ruleId')
  removeAvailabilityRule(@Param('ruleId') ruleId: string) {
    return this.service.removeAvailabilityRule(ruleId);
  }

  /** Supprime toutes les règles de disponibilité d'un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete('items/:itemId/availability/delete-all')
  removeAllAvailabilityRules(@Param('itemId') itemId: string) {
    return this.service.removeAllAvailabilityRules(itemId);
  }

  /** Génère les sessions automatiquement depuis les règles */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post('items/:itemId/availability/generate')
  generateSessions(@Param('itemId') itemId: string) {
    return this.service.generateSessions(itemId);
  }

  // ─── Capacity ──────────────────────────────────────

  /** Définit la capacité d'un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post('items/:itemId/capacity')
  setCapacity(@Param('itemId') itemId: string, @Body() dto: { capacity_type: string; total_quantity: number }) {
    return this.service.setCapacity(itemId, dto);
  }

  /** Récupère la capacité d'un item */
  @Public()
  @Get('items/:itemId/capacity')
  getCapacity(@Param('itemId') itemId: string) {
    return this.service.getCapacity(itemId);
  }

  /** Supprime la capacité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete('capacity/:capacityId')
  removeCapacity(@Param('capacityId') capacityId: string) {
    return this.service.removeCapacity(capacityId);
  }

  // ─── Sessions ──────────────────────────────────────

  /** Crée une session (créneau concret) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Post('items/:itemId/sessions')
  createSession(@Param('itemId') itemId: string, @Body() dto: CreateOfferItemSessionDto) {
    return this.service.createSession(itemId, dto);
  }

  /** Modifier une session */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Patch('items/sessions/:sessionId')
  updateSession(@Param('sessionId') sessionId: string, @Body() dto: UpdateOfferItemSessionDto) {
    return this.service.updateSession(sessionId, dto);
  }

  /** Supprimer une session */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROJECT)
  @Delete('items/sessions/:sessionId')
  removeSession(@Param('sessionId') sessionId: string) {
    return this.service.removeSession(sessionId);
  }

  /** Sessions disponibles pour un item */
  @Public()
  @Get('items/:itemId/sessions')
  findSessions(@Param('itemId') itemId: string) {
    return this.service.findSessions(itemId);
  }
}