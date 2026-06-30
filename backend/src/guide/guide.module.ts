import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Guide } from './entities/guide.entity';
import { GuideOffering } from './entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from './entities/guide-offering-availability-rule.entity';
import { GuideService } from './guide.service';
import { GuideOfferingService } from './guide-offering.service';
import { GuideSearchService } from './guide-search.service';
import { GuideController } from './guide.controller';
import { GuideOfferingController } from './guide-offering.controller';
import { GuideMongoService } from './guide-mongo.service';
import { GuideSkills, GuideSkillsSchema } from './schemas/guide-skills.schema';
import { GuideEngagement, GuideEngagementSchema } from './schemas/guide-engagement.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guide, GuideOffering, GuideOfferingAvailabilityRule]),
    MongooseModule.forFeature([
      { name: GuideSkills.name, schema: GuideSkillsSchema },
      { name: GuideEngagement.name, schema: GuideEngagementSchema },
    ]),
  ],
  providers: [GuideService, GuideOfferingService, GuideSearchService, GuideMongoService],
  controllers: [GuideController, GuideOfferingController],
  exports: [GuideService, GuideOfferingService, GuideSearchService, GuideMongoService],
})
export class GuideModule {}
