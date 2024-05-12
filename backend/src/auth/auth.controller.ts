import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { db } from 'src/db';
import { userTable } from 'src/db/schema';
import { AuthService } from './auth.service';
import { Public } from './public.decorators';

class RegisterDto {
  username: string;
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  //TODO: Fix typing
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await db.insert(userTable).values({ email, username, password: hash });
    return { username, email };
  }

  @Get('profile')
  getProfile(@Request() req: { user: any }) {
    return req.user;
  }
}
