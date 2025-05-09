import { Body, Controller, Post, HttpCode, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃 (토큰 무효화)' })
  logout(@Request() req: ExpressRequest) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      this.authService.invalidateToken(token);
    }
    return { message: '로그아웃 되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiOperation({ summary: '토큰 유효성 확인' })
  verifyToken() {
    return { authenticated: true };
  }
}