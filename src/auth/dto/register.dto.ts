import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// Solo email y password: un "role" en el body se rechaza (forbidNonWhitelisted).
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt solo usa los primeros 72 bytes
  password: string;
}
