import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { findUserByName } from 'src/db/functions/user';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await findUserByName(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // TODO: fix typing
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
