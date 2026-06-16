import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Project } from '../project-owner/entities/project.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { GuideModule } from '../guide/guide.module';
import { ProjectOwnerModule } from '../project-owner/project-owner.module';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Project]), GuideModule, ProjectOwnerModule],
  providers: [OfferService],
  controllers: [OfferController],
  exports: [OfferService],
})
export class OfferModule {}