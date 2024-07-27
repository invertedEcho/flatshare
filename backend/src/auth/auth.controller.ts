import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { db } from 'src/db';
import { userUserGroupTable, userTable } from 'src/db/schema';
import { AuthService } from './auth.service';
import {
  dbAddUserToGroup,
  dbGetGroupOfUser,
  dbGetInviteCode,
} from 'src/db/functions/user-group';
import { eq } from 'drizzle-orm';
import { dbGetUserById } from 'src/db/functions/user';
import { AuthGuard } from './auth.guard';
import { Public } from './constants';

class RegisterDto {
  username: string;
  email: string;
  password: string;
  inviteCode: string | null;
}

export class LoginDto {
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const maybeExistingUser = await db
      .select({ id: userTable })
      .from(userTable)
      .where(eq(userTable.email, email));
    if (maybeExistingUser.length > 0) {
      throw new HttpException('User already exists.', HttpStatus.CONFLICT);
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = (
      await db
        .insert(userTable)
        .values({ email, username, password: hash })
        .returning()
    )[0];
    if (registerDto.inviteCode !== null) {
      try {
        const maybeGroup = await dbGetInviteCode(registerDto.inviteCode);
        await dbAddUserToGroup({
          userId: newUser.id,
          groupId: maybeGroup.groupId,
        });
      } catch (error) {
        console.error({ error });
      }
    }
    return { username: newUser.username, email: newUser.email };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(
    @Request() req: { user: { sub: number; username: string } },
  ) {
    const user = await dbGetUserById(req.user.sub);
    const userGroup = await dbGetGroupOfUser(req.user.sub);
    return {
      userId: req.user.sub,
      userGroup: {
        id: userGroup?.user_group.name,
        name: userGroup?.user_group.name,
      },
      email: user.email,
      username: user.username,
    };
  }

  // TODO: should go into seperate user controller
  @Get('users')
  async getUsers(@Query('groupId') groupId?: number) {
    const query = db
      .select({
        userId: userTable.id,
        email: userTable.email,
        username: userTable.username,
        createdAt: userTable.createdAt,
      })
      .from(userTable);

    if (groupId === undefined) {
      return await query;
    }

    return await query
      .innerJoin(
        userUserGroupTable,
        eq(userUserGroupTable.userId, userTable.id),
      )
      .where(eq(userUserGroupTable.groupId, groupId));
  }
}
