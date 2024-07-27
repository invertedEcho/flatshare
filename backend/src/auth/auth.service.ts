import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { dbGetUserByEmail } from 'src/db/functions/user';
import { LoginDto } from './auth.controller';

export type User = {
  id: number;
  username: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser({ email, password }: LoginDto): Promise<User> {
    const user = await dbGetUserByEmail(email);
    if (
      user === undefined ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.validateUser({ email, password });
    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
