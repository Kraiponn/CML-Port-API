import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class UserUpdateImagesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  profile_images: string[];
}
