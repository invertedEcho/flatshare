import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const JWT_SECRET = process.env.JWT_SECRET;
export const IS_PUBLIC_KEY = 'isPublic';
export const JWT_EXPIRATION = '2592000s';
