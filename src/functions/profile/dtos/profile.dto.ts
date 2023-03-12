import { Gender } from '../../../models/user.model';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class ProfileDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  minAge?: number;

  @IsOptional()
  @IsNumber()
  maxAge?: number;

  @IsOptional()
  @IsNumber()
  maxDistance?: number;
}
