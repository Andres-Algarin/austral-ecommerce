import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // 10 intentos por minuto por IP.
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // 10 intentos por minuto por IP.
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.correo,
      loginDto.password,
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(
      refreshTokenDto.refresh_token,
    );
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(
      refreshTokenDto.refresh_token,
    );
  }

  // 5 solicitudes cada 15 minutos por IP.
  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(
      forgotPasswordDto.correo,
    );
  }

  @Post('reset-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 15 * 60_000 } })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request: AuthenticatedRequest) {
    return {
      usuario: request.user,
    };
  }
}
