import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { OfferService } from './offer.service';
import { CreateOfferDto, OfferSustainabilityDto, UpdateOfferDto } from './dto/offer.dto';
import { Public } from '../common/decorators/public.decorator';
import { GuideMongoService } from '../guide/guide-mongo.service';
import { ProjectOwnerMongoService } from '../project-owner/project-owner-mongo.service';

const GUIDE_AMBASSADOR_BADGE = 'Guide Ambassadeur AFRATIM';
const PROJECT_AMBASSADOR_BADGE = 'Propriétaire Ambassadeur AFRATIM';

@ApiTags('Offers')
@Controller('offers')
export class OfferController {
  constructor(
    private readonly service: OfferService,
    private readonly guideMongoService: GuideMongoService,
    private readonly projectOwnerMongoService: ProjectOwnerMongoService,
  ) {}

  // Guide ou Project Owner crée une offre
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateOfferDto) {
    const userId = req.user.sub;
    const isGuide = req.user.role === Role.GUIDE;
    const authorType = isGuide ? 'guide' : 'project_owner';

    const badgeLabel = isGuide ? GUIDE_AMBASSADOR_BADGE : PROJECT_AMBASSADOR_BADGE;
    const mongoService = isGuide ? this.guideMongoService : this.projectOwnerMongoService;
    const hasAmbassador = await mongoService.hasBadge(userId, badgeLabel);

    return this.service.create(userId, authorType, dto, hasAmbassador ? 'approved' : 'pending');
  }

  // Mes propres offres (dashboard)
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  // Toutes les offres approuvées (page Destinations publique)
  @Public()
  @Get()
  findAllPublic() {
    return this.service.findAllPublic();
  }

  // Offres publiées d'un auteur (page profil publique)
  @Public()
  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string) {
    return this.service.findPublishedByAuthor(authorId);
  }

  // Offres d'un projet spécifique (page profil projet)
  @Public()
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  // Score de durabilité d'une offre
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Patch(':id/sustainability')
  updateSustainability(@Req() req: any, @Param('id') id: string, @Body() dto: OfferSustainabilityDto) {
    return this.service.updateOfferSustainability(req.user.sub, id, dto);
  }

  // Modifier une offre
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.service.update(req.user.sub, id, dto);
  }

  // Supprimer une offre
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }
}