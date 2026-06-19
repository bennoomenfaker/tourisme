import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateCircuitProgramItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'start_time doit être au format HH:MM ou HH:MM:SS' })
  start_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'end_time doit être au format HH:MM ou HH:MM:SS' })
  end_time?: string;

  @IsOptional()
  @IsBoolean()
  is_included?: boolean;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsUUID()
  linked_offer_item_id?: string;

  @IsOptional()
  @IsUUID()
  linked_location_id?: string;
}
