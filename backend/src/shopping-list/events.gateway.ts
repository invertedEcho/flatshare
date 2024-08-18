import { HttpException, HttpStatus } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  dbAddShoppingListItem,
  dbUpdateShoppingListItem,
} from 'src/db/functions/shopping-list';
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
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('shopping-list-item')
  async receiveNewShoppingListItems(@MessageBody() data: unknown) {
    const safeParsed = createShoppingListItemSchema.safeParse(data);

    if (!safeParsed.success) {
      console.error({ safeParsed: safeParsed.error });
      // TODO: do you even do httpexception in websockets?
      throw new HttpException('Invalid schema', HttpStatus.BAD_REQUEST);
    }

    const { text, userGroupId } = safeParsed.data;

    const shoppingListItem = await dbAddShoppingListItem({ text, userGroupId });

    this.server.emit('shopping-list-item', shoppingListItem);
  }

  @SubscribeMessage('update-shopping-list-item')
  async updateShoppingListItem(@MessageBody() data: unknown) {
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
    this.server.emit('update-shopping-list-item', updatedShoppingListItem);
  }
}
