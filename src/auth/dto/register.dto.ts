import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// Solo email y password: un "role" en el body se rechaza (forbidNonWhitelisted).
export class RegisterDto {
  @ApiProperty({ example: 'ana@demo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secreta123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt solo usa los primeros 72 bytes
  password: string;
}
