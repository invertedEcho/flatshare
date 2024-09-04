import { eq } from 'drizzle-orm';
import { db } from '..';
import { ShoppingListItemState, shoppingListItemTable } from '../schema';

export async function dbGetAllShoppingListItems(userGroupId: number) {
  return await db
    .select()
    .from(shoppingListItemTable)
    .where(eq(shoppingListItemTable.userGroupId, userGroupId));
}

export async function dbAddShoppingListItem({
  text,
  userGroupId,
}: {
  text: string;
  userGroupId: number;
}) {
  return (
    await db
      .insert(shoppingListItemTable)
      .values({ text, userGroupId })
      .returning()
  )[0];
}

export async function dbUpdateShoppingListItem({
  id,
  newState,
}: {
  id: number;
  newState: ShoppingListItemState;
}) {
  return (
    await db
      .update(shoppingListItemTable)
      .set({ state: newState })
      .where(eq(shoppingListItemTable.id, id))
      .returning()
  )[0];
}
