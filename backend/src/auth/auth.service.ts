import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

export interface TokenPayload {
  sub: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly accessExpirySeconds: number;
  private readonly refreshExpirySeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    const accessExpiry =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';
    this.accessExpirySeconds = this.parseExpiryToSeconds(accessExpiry);
    // Parse refresh expiry to seconds (default 7 days)
    const refreshExpiry =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';
    this.refreshExpirySeconds = this.parseExpiryToSeconds(refreshExpiry);
  }
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60; // Default 7 days
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }

  async signIn(signInDto: SignInDto): Promise<AuthTokens> {
    const user = await this.usersService.findOne(signInDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const checkPassword = await argon2.verify(
      user.password,
      signInDto.password,
    );
    if (!checkPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return this.generateTokens(payload);
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthTokens> {
    const existingUser = await this.usersService.findOne(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(signUpDto.password);
    const user = await this.usersService.create({
      email: signUpDto.email,
      name: signUpDto.name,
      password: hashedPassword,
    });

    const payload = { sub: user.id, email: user.email };
    return this.generateTokens(payload);
  }

  async logout(userId: string): Promise<void> {

  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.accessExpirySeconds,
    });
    const refreshToken = uuidv4();

    // Store refresh token in Redis with user ID
    const redisKey = `refresh:${refreshToken}`;
    await this.redisService.set(
      redisKey,
      JSON.stringify({ userId: payload.sub, email: payload.email }),
      this.refreshExpirySeconds,
    );

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const redisKey = `refresh:${refreshToken}`;
    const storedData = await this.redisService.get(redisKey);

    if (!storedData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete old refresh token (rotation)
    await this.redisService.del(redisKey);

    const { userId, email } = JSON.parse(storedData);

    // Verify user still exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens({ sub: userId, email });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const redisKey = `refresh:${refreshToken}`;
    await this.redisService.del(redisKey);
  }
}
