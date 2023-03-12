import { Preference } from '../../../models/preferences.model';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SwipeDto {
  user?: string;

  @IsString()
  @IsNotEmpty()
  profile: string;

  @IsEnum(Preference)
  @IsNotEmpty()
  preference: Preference;
}
