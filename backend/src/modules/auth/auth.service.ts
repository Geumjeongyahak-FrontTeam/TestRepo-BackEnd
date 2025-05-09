import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../../entities/user.entity';
import { TeacherEntity } from '../../entities/person.entity';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string> = new Set();
  private tokenStorage: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TeacherEntity)
    private teachersRepository: Repository<TeacherEntity>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ 
      where: { username },
      relations: ['teacher']
    });
    
    if (!user) {
      return null;
    }
    
    // We are not using encryption now
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;
    
    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    const user = await this.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('Incorrect ID or Password.');
    }
    
    let teacherDetails = null;
    
    if (user.teacher_id) {
      teacherDetails = await this.teachersRepository.findOne({
        where: { id: user.teacher_id },
        relations: [
          'class_schedules',
          'attendances',
          'calendarEventTeachers',
          'classCancellationTeachers',
          'classExchangeTeachers',
          'calendarSpecialEventTeachers'
        ]
      });
    }
    
    // Generate JWT token
    const payload = { 
      sub: user.id, 
      username: user.username,
      role: user.role,
      teacher_id: user.teacher_id
    };
    
    const token = this.jwtService.sign(payload);
    
    // Store the token on the server (실제 구현에서는 Redis 등을 사용하는 것이 좋음)
    this.tokenStorage.add(token);
    
    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      teacher: teacherDetails // 교사 정보 포함
    };
  }

  // 토큰 검증 메서드
  validateToken(token: string): boolean {
    try {
      // 블랙리스트에 있는지 확인
      if (this.tokenBlacklist.has(token)) {
        return false;
      }
      
      // 토큰 검증
      const payload = this.jwtService.verify(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 로그아웃 시 토큰을 블랙리스트에 추가
  invalidateToken(token: string): void {
    this.tokenBlacklist.add(token);
  }
}