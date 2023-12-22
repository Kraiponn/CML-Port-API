import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserUpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  current_password: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  new_password: string;
}
