import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { AdminService } from './admin.service';
import { RejectDto } from './dto/admin.dto';
import { ReportsService } from '../reports/reports.service';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string; role: string };
}

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly service: AdminService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get('publications/pending')
  getPendingPublications() {
    return this.service.getPendingPublications();
  }

  @Patch('publications/:id/approve')
  approvePublication(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.service.approvePublication(id, req.user.sub);
  }

  @Patch('publications/:id/reject')
  rejectPublication(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.service.rejectPublication(id, dto.reason, req.user.sub);
  }

  @Get('offers/pending')
  getPendingOffers() {
    return this.service.getPendingOffers();
  }

  @Patch('offers/:id/approve')
  approveOffer(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveOffer(id, req.user.sub);
  }

  @Patch('offers/:id/reject')
  rejectOffer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.service.rejectOffer(id, dto.reason, req.user.sub);
  }

  @Get('projects/pending')
  getPendingProjects() {
    return this.service.getPendingProjects();
  }

  @Patch('projects/:id/approve')
  approveProject(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveProject(id, req.user.sub);
  }

  @Patch('projects/:id/reject')
  rejectProject(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.service.rejectProject(id, dto.reason, req.user.sub);
  }

  @Get('circuits/pending')
  getPendingCircuits() {
    return this.service.getPendingCircuits();
  }

  @Patch('circuits/:id/approve')
  approveCircuit(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveCircuit(id, req.user.sub);
  }

  @Patch('circuits/:id/reject')
  rejectCircuit(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.service.rejectCircuit(id, dto.reason, req.user.sub);
  }

  @Patch('circuits/:id/archive')
  archiveCircuit(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.archiveCircuit(id, req.user.sub);
  }

  @Get('guide-offerings/pending')
  getPendingGuideOfferings() {
    return this.service.getPendingGuideOfferings();
  }

  @Patch('guide-offerings/:id/approve')
  approveGuideOffering(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.service.approveGuideOffering(id, req.user.sub);
  }

  @Patch('guide-offerings/:id/reject')
  rejectGuideOffering(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.service.rejectGuideOffering(id, dto.reason, req.user.sub);
  }

  @Patch('guide-offerings/:id/archive')
  archiveGuideOffering(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.service.archiveGuideOffering(id, req.user.sub);
  }

  @Get('reports')
  getReports() {
    return this.reportsService.getAllReports();
  }

  @Patch('reports/:id/resolve')
  resolveReport(
    @Param('id') id: string,
    @Body() body: { action: string; note?: string; ban_days?: number },
  ) {
    return this.reportsService.resolveReport(
      id,
      body.action,
      body.note ?? '',
      body.ban_days,
    );
  }

  @Get('users/banned')
  getBannedUsers() {
    return this.service.getBannedUsers();
  }

  @Patch('users/:id/ban')
  updateBan(
    @Param('id') id: string,
    @Body() body: { ban_days?: number; note?: string },
  ) {
    return this.service.updateBan(id, body.ban_days, body.note);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.service.unbanUser(id);
  }
}
