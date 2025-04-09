import { IsString } from 'class-validator';

export class FileChangeDto {
  @IsString()
  filename: string;

  @IsString()
  content: string;
}
