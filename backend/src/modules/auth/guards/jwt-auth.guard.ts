import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { Observable } from 'rxjs';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    // AuthGuard('jwt')는 내부적으로 JwtStrategy를 찾아 실행합니다.
    // JwtStrategy의 validate 메서드에서 토큰 검증 및 블랙리스트 확인 로직이 이미 처리됩니다.
    // 따라서 기본적인 JWT 인증/인가 확인을 위해서는 canActivate를 오버라이드할 필요가
    // 없는 경우가 많습니다.
  
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      // super.canActivate(context)는 JwtStrategy의 validate 로직을 트리거하고,
      // validate가 성공적으로 사용자 객체를 반환하면 true를,
      // 예외를 던지거나 null/false를 반환하면 false(또는 예외 발생)를 반환합니다.
      return super.canActivate(context);
    }
  
    // handleRequest는 validate 메서드가 성공적으로 실행된 후 호출됩니다.
    // 여기서는 validate가 반환한 user 객체를 받거나, 에러가 발생한 경우 에러를 받습니다.
    // 기본 동작은 에러가 있거나 user가 없으면 UnauthorizedException을 던지는 것입니다.
    // 특별한 에러 처리나 로깅이 필요하지 않다면 오버라이드하지 않아도 됩니다.
    handleRequest(err: any, user: any, info: any) {
      if (err || !user) {
        // info 객체에는 JWT 검증 실패 이유(예: 'No auth token', 'jwt expired')가 포함될 수 있습니다.
        // console.error('JWT Authentication Error:', info?.message || err?.message);
        throw err || new UnauthorizedException('유효한 인증 자격 증명이 필요합니다.');
      }
      // validate 메서드가 성공적으로 반환한 사용자 객체 (보통 payload)
      return user;
    }
  }