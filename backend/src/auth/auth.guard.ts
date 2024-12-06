import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, JWT_SECRET } from './constants';
import { Reflector } from '@nestjs/core';
import { extractTokenFromAuthHeader } from './utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  // The function returns true if the auth header in the incoming request is valid.
  // The request gets added a 'user' field, which contains the decoded data from the jwt secret.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // For endpoints that use the @Public annotation, we directly return true and skip checking the access token
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromAuthHeader(request.headers.authorization);

    if (token === undefined) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET,
      });
      // We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
