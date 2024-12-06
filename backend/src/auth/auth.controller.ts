import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { db } from 'src/db';
import { userTable } from 'src/db/schema';
import { AuthService } from './auth.service';
import {
  dbAddUserToUserGroup,
  dbGetUserGroupOfUser,
  dbGetUserGroupByInviteCode,
} from 'src/db/functions/user-group';
import { eq } from 'drizzle-orm';
import { dbGetUserById } from 'src/db/functions/user';
import { AuthGuard } from './auth.guard';
import { Public } from './constants';

// TODO: why exactly are classes needed here? seems like we want a type instead.

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

    if (newUser === undefined) {
      throw new Error('Failed creating user');
    }

    if (registerDto.inviteCode !== null) {
      try {
        const maybeGroup = await dbGetUserGroupByInviteCode(
          registerDto.inviteCode,
        );
        if (maybeGroup === undefined) {
          // TODO: this is bad. we will create the user, but the request will fail if invalid invite code included.
          // user will still be on register screen. if he registers again, he is stuck there as user already exists.
          // we need a sql transaction for this.
          // but we should first add message in case register fails because of invalid invite code given, otherwise user could
          // be very confused if he just registers and is not really aware that a invite code was included, e.g. because he
          // clicked on a join group link.
          throw new HttpException(
            'The given invite code is invalid',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          await dbAddUserToUserGroup({
            userId: newUser.id,
            userGroupId: maybeGroup.userGroupId,
          });
        }
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
    if (user === undefined) {
      throw new Error(
        'The access token seemed valid, but the user id included in the jwt token could not be found in the database.',
      );
    }
    const userGroup = await dbGetUserGroupOfUser(req.user.sub);
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
}
