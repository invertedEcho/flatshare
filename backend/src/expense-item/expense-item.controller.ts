import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  dbAddExpenseBeneficiares,
  dbAddExpenseItem,
  dbAddExpensePayers,
  dbGetAllExpenseItemsByUserGroupId,
} from 'src/db/functions/expense-item';
import {
  InsertExpenseBeneficiaryMapping,
  InsertExpenseItem,
  InsertExpensePayerMapping,
} from 'src/db/schema';

type CreateExpenseItemBody = {
  expenseItem: InsertExpenseItem;
  expensePayers: Omit<InsertExpensePayerMapping, 'expenseItemId'>[];
  expenseBeneficiares: Omit<InsertExpenseBeneficiaryMapping, 'expenseItemId'>[];
};

@Controller('expense-item')
export class ExpenseItemController {
  @Get()
  async getAllExpenseItems(@Query('userGroupId') userGroupId: number) {
    return await dbGetAllExpenseItemsByUserGroupId(userGroupId);
  }

  @Post()
  async createExpenseItem(
    @Body()
    { expenseItem, expensePayers, expenseBeneficiares }: CreateExpenseItemBody,
  ) {
    const expenseItemDb = await dbAddExpenseItem(expenseItem);

    if (expenseItemDb === undefined) {
      throw new HttpException(
        'Failed to create the base expense item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hydratedExpensePayers = expensePayers.map((expensePayer) => {
      return {
        ...expensePayer,
        expenseItemId: expenseItemDb.id,
      };
    });
    const hydratedExpenseBeneficiares = expenseBeneficiares.map(
      (expenseBeneficiary) => {
        return {
          ...expenseBeneficiary,
          expenseItemId: expenseItemDb.id,
        };
      },
    );

    await dbAddExpensePayers(hydratedExpensePayers);
    await dbAddExpenseBeneficiares(hydratedExpenseBeneficiares);
  }
}
