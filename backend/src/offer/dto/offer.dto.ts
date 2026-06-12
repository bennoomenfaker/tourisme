import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  offer_type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  inclusions?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  meeting_point?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_age?: number;

  @IsOptional()
  @IsString()
  cancellation_policy?: string;

  // Seulement pour project_owner
  @IsOptional()
  @IsUUID()
  project_id?: string;
}

export class OfferSustainabilityDto {
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  offer_type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  inclusions?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  meeting_point?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_age?: number;

  @IsOptional()
  @IsString()
  cancellation_policy?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
