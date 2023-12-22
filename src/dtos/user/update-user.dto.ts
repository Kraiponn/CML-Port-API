import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

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
  @IsString()
  @Length(7, 20)
  phone_no: string;

  @IsOptional()
  @IsDateString()
  date_of_birth: Date;
}
