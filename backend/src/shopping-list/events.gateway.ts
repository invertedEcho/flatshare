import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JWT_SECRET } from 'src/auth/constants';
import { extractTokenFromAuthHeader } from 'src/auth/utils';
import {
  dbAddShoppingListItem,
  dbUpdateShoppingListItem,
} from 'src/db/functions/shopping-list';
import { dbGetUserGroupOfUser } from 'src/db/functions/user-group';
import { shoppingListItemState } from 'src/db/schema';
import { z } from 'zod';

const createShoppingListItemSchema = z.object({
  text: z.string(),
  userGroupId: z.number(),
});

const updateShoppingListItemSchema = z.object({
  id: z.number(),
  state: shoppingListItemState,
});

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  constructor(private jwtService: JwtService) {}
  @WebSocketServer()
  server: Server;

  /**
   * Verifies whether a client is authorized to join a specific user group.
   *
   * Returns the userGroup of the client if it is authorized, otherwise returns null.
   */
  async verifyUserGroupOfClient(client: Socket): Promise<number | null> {
    const authorizationHeader = client.handshake.headers.authorization;
    if (authorizationHeader === undefined) {
      throw new Error('Could not find the authorization header.');
    }

    const token = extractTokenFromAuthHeader(authorizationHeader);
    if (token === undefined) {
      throw new Error(
        'Could not extract the token from the authorization header.',
      );
    }

    const userGroupId = client.handshake.query['userGroupId'];
    const parsedUserGroupId = z.coerce.number().parse(userGroupId);

    const res = await this.jwtService.verifyAsync(token, {
      secret: JWT_SECRET,
    });

    const userGroup = await dbGetUserGroupOfUser(res.sub);

    if (userGroup === undefined) {
      throw new Error(
        `Could not retrieve userGroup of user with id: '${res.sub}'`,
      );
    }

    if (userGroup.user_group.id !== parsedUserGroupId) {
      throw new Error(
        'This client is not allowed to join a room by the user-group-id included in the header.',
      );
    }

    return parsedUserGroupId;
  }

  async handleConnection(client: Socket) {
    const maybeUserGroupId = await this.verifyUserGroupOfClient(client);
    if (maybeUserGroupId !== null) {
      console.log(`Joining client to userGroup: ${maybeUserGroupId}`);
      client.join(`room-user-group-${maybeUserGroupId}`);
    } else {
      client.disconnect();
    }
  }

  @SubscribeMessage('shopping-list-item')
  async receiveNewShoppingListItems(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const maybeUserGroupId = await this.verifyUserGroupOfClient(client);
    if (maybeUserGroupId === null) {
      throw new UnauthorizedException('Unauthorized.');
    }
    const safeParsed = createShoppingListItemSchema.safeParse(data);

    if (!safeParsed.success) {
      console.error({ safeParsed: safeParsed.error });
      // TODO: do you even do httpexception in websockets?
      throw new HttpException(safeParsed.error, HttpStatus.BAD_REQUEST);
    }

    const { text, userGroupId } = safeParsed.data;

    const shoppingListItem = await dbAddShoppingListItem({ text, userGroupId });

    this.server
      .to(`room-user-group-${maybeUserGroupId}`)
      .emit('shopping-list-item', shoppingListItem);
  }

  @SubscribeMessage('update-shopping-list-item')
  async updateShoppingListItem(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const maybeUserGroupId = await this.verifyUserGroupOfClient(client);
    if (maybeUserGroupId === null) {
      throw new UnauthorizedException('Unauthorized.');
    }
    const safeParsed = updateShoppingListItemSchema.safeParse(data);

    if (!safeParsed.success) {
      console.error({ safeParsed: safeParsed.error });
      // TODO: do you even do httpexception in websockets?
      throw new HttpException('Invalid schema', HttpStatus.BAD_REQUEST);
    }
    const { id, state: newState } = safeParsed.data;
    const updatedShoppingListItem = await dbUpdateShoppingListItem({
      id,
      newState,
    });
    this.server
      .to(`room-user-group-${maybeUserGroupId}`)
      .emit('update-shopping-list-item', updatedShoppingListItem);
  }
}