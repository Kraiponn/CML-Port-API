import { IsDate, IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  sex: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsDate()
  date_of_birth: Date;
}
