import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { GuideOfferingService } from './guide-offering.service';
import {
  CreateGuideOfferingDto,
  UpdateGuideOfferingDto,
  CreateGuideOfferingAvailabilityRuleDto,
} from './dto/guide-offering.dto';

@ApiTags('Guide Offerings')
@Controller('guide-offerings')
export class GuideOfferingController {
  constructor(private readonly service: GuideOfferingService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post()
  create(@Req() req: any, @Body() dto: CreateGuideOfferingDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByGuide(req.user.sub);
  }

  @Public()
  @Get()
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateGuideOfferingDto) {
    return this.service.update(req.user.sub, id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post(':id/availability')
  addAvailabilityRule(@Param('id') id: string, @Body() dto: CreateGuideOfferingAvailabilityRuleDto) {
    return this.service.addAvailabilityRule(id, dto);
  }

  @Public()
  @Get(':id/availability')
  findAvailabilityRules(@Param('id') id: string) {
    return this.service.findAvailabilityRules(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete('availability/:ruleId')
  removeAvailabilityRule(@Param('ruleId') ruleId: string) {
    return this.service.removeAvailabilityRule(ruleId);
  }
}
