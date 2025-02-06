import { eq } from 'drizzle-orm';
import { db } from '..';
import {
  InsertExpenseBeneficiaryMapping,
  InsertExpenseItem,
  InsertExpensePayerMapping,
  expenseBeneficiaryMappingTable,
  expenseItemTable,
  expensePayerMappingTable,
} from '../schema';

export async function dbGetAllExpenseItemsByUserGroupId(userGroupId: number) {
  return await db
    .select()
    .from(expenseItemTable)
    .where(eq(expenseItemTable.userGroupId, userGroupId));
}

export async function dbAddExpenseItem(expenseItem: InsertExpenseItem) {
  return (await db.insert(expenseItemTable).values(expenseItem).returning())[0];
}

export async function dbAddExpensePayers(
  expensePayers: InsertExpensePayerMapping[],
) {
  await db.insert(expensePayerMappingTable).values(expensePayers);
}

export async function dbAddExpenseBeneficiares(
  expenseBeneficiares: InsertExpenseBeneficiaryMapping[],
) {
  await db.insert(expenseBeneficiaryMappingTable).values(expenseBeneficiares);
}
