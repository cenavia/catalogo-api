import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: User })
  @ApiConflictResponse({ description: 'Email ya registrado' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // login no crea un recurso: 200, no 201
  @ApiOkResponse({ type: TokenDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Ruta protegida mínima para comprobar el token.
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
