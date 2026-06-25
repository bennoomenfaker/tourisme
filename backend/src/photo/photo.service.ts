import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly repo: Repository<Photo>,
  ) {}

  async create(data: { url: string; entity_type: string; entity_id: string; uploaded_by: string; is_hero?: boolean }): Promise<Photo> {
    if (data.is_hero) {
      await this.repo.update({ entity_type: data.entity_type, entity_id: data.entity_id, is_hero: true }, { is_hero: false });
    }
    return this.repo.save(this.repo.create(data));
  }

  async findByEntity(entityType: string, entityId: string): Promise<Photo[]> {
    return this.repo.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { is_hero: 'DESC', score: 'DESC', created_at: 'DESC' },
    });
  }

  async setHero(photoId: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    await this.repo.update({ entity_type: photo.entity_type, entity_id: photo.entity_id, is_hero: true }, { is_hero: false });
    photo.is_hero = true;
    return this.repo.save(photo);
  }

  async upvote(photoId: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    photo.score += 1;
    return this.repo.save(photo);
  }

  async downvote(photoId: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    photo.score -= 1;
    return this.repo.save(photo);
  }

  async remove(photoId: string): Promise<void> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    await this.repo.remove(photo);
  }

  async getHero(entityType: string, entityId: string): Promise<Photo | null> {
    return this.repo.findOne({ where: { entity_type: entityType, entity_id: entityId, is_hero: true } });
  }
}
