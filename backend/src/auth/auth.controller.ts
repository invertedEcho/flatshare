import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { db } from 'src/db';
import { userGroupTable, userTable } from 'src/db/schema';
import { AuthService, User } from './auth.service';
import { Public } from './public.decorators';
import { dbGetGroupOfUser } from 'src/db/functions/user-group';
import { eq } from 'drizzle-orm';

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
  async login(@Request() req: { user: User }) {
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
  async getProfile(
    @Request() req: { user: { userId: number; username: string } },
  ) {
    const group = await dbGetGroupOfUser(req.user.userId);
    return {
      userId: req.user.userId,
      groupId: group?.user_group.groupId ?? null,
    };
  }

  // TODO: should go into seperate user controller
  @Get('users')
  async getUsers(@Query('groupId') groupId?: number) {
    const users = db
      .select({
        id: userTable.id,
        email: userTable.email,
        username: userTable.username,
        createdAt: userTable.createdAt,
      })
      .from(userTable);

    if (groupId === undefined) {
      return await users;
    }

    return await users
      .innerJoin(userGroupTable, eq(userGroupTable.userId, userTable.id))
      .where(eq(userGroupTable.groupId, groupId));
  }
}
