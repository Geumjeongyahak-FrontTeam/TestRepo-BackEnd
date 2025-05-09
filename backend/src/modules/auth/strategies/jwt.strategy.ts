import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default-secret',
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: any, payload: any) {
    // 요청 헤더에서 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    
    // 토큰이 유효한지 확인 (블랙리스트 체크 포함)
    if (!token || !this.authService.validateToken(token)) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return { 
      userId: payload.sub, 
      username: payload.username,
      role: payload.role,
      teacher_id: payload.teacher_id
    };
  }
}