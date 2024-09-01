import { Controller, Get, Param } from '@nestjs/common';
import { dbGetAllShoppingListItems } from 'src/db/functions/shopping-list';

@Controller('shopping-list')
export class ShoppingListController {
  @Get(':userGroupId')
  async getAll(@Param('userGroupId') userGroupId: number) {
    const shoppingListItems = await dbGetAllShoppingListItems(userGroupId);
    return shoppingListItems.sort((a, b) => a.id - b.id);
  }
}
