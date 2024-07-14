import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { db } from 'src/db';
import { userUserGroupTable, userTable } from 'src/db/schema';
import { AuthService, User } from './auth.service';
import { Public } from './public.decorators';
import {
  dbAddUserToGroup,
  dbGetGroupOfUser,
  dbGetInviteCode,
} from 'src/db/functions/user-group';
import { eq } from 'drizzle-orm';
import { dbGetUserById } from 'src/db/functions/user';

class RegisterDto {
  username: string;
  email: string;
  password: string;
  inviteCode?: string;
}

const SALT_ROUNDS = 10;

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: { user: User }) {
    const result = await this.authService.login(req.user);
    const maybeUserGroup = await dbGetGroupOfUser(result.userId);
    return { ...result, groupId: maybeUserGroup?.user_group.id ?? null };
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
    if (registerDto.inviteCode !== undefined) {
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
    // TODO: Should we return the data from our incoming request, or what actually got inserted into the database?
    return { username, email };
  }

  // TODO: This endpoint doesnt seem right...
  @Get('profile')
  async getProfile(
    @Request() req: { user: { userId: number; username: string } },
  ) {
    const user = await dbGetUserById(req.user.userId);
    const userGroup = await dbGetGroupOfUser(req.user.userId);
    return {
      userId: req.user.userId,
      groupId: userGroup?.user_group.id ?? null,
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
