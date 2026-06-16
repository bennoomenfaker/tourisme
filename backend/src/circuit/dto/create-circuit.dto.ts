import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCircuitDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_nights?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  base_price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_participants?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  booking_deadline_days?: number;

  @IsOptional()
  @IsString()
  confirmation_mode?: string;

  @IsOptional()
  @IsString()
  inclusions?: string;

  @IsOptional()
  @IsString()
  exclusions?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;
}
