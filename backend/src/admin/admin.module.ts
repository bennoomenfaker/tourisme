import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { Project } from '../project-owner/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { ModerationLog } from './entities/moderation-log.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ReportsModule } from '../reports/reports.module';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Publication,
      Offer,
      Circuit,
      GuideOffering,
      Project,
      User,
      EcoTraveler,
      Guide,
      ProjectOwner,
      ModerationLog,
    ]),
    ReportsModule,
    MailModule,
    NotificationModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
