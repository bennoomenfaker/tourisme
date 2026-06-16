import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCircuitDayDto {
  @IsInt()
  @Min(1)
  day_number!: number;

  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
