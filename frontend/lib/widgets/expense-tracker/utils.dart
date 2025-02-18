import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';

/// This function calculates a Map that you can use to find out what person needs to pay what person.
/// It returns a Map where the keys are userIds that are owed money.
/// The values of each key is an array of people, e.g. MapEntries, where the key is the userId that needs to pay, and the value is how much the userId needs to pay.
/// Note: This function should be used in conjunction of the `calculateBalancePerUser` function.
Map<int, List<MapEntry<int, double>>> getSettlePayment(
    Map<int, double> balancePerUser) {
  Map<int, List<MapEntry<int, double>>> finalWhoOwesWho = {};

  List<MapEntry<int, double>> usersThatAreOwed = [];
  List<MapEntry<int, double>> usersThatNeedToPay = [];

  balancePerUser.forEach((userId, balance) {
    if (balance > 0) {
      usersThatAreOwed.add(MapEntry(userId, balance));
    } else {
      usersThatNeedToPay.add(MapEntry(userId, balance));
    }
  });

  for (var positiveUser in usersThatAreOwed) {
    final int userIdPositive = positiveUser.key;
    final double howMuchOwed = positiveUser.value;

    for (final userThatNeedsToPay in usersThatNeedToPay) {
      final int userThatNeedsToPayUserId = userThatNeedsToPay.key;
      final double howMuchNeedToPay = userThatNeedsToPay.value;

      if (howMuchOwed > howMuchNeedToPay) {
        finalWhoOwesWho.update(userIdPositive, (previousPeople) {
          return [
            ...previousPeople,
            MapEntry(userThatNeedsToPayUserId, howMuchNeedToPay)
          ];
        },
            ifAbsent: () =>
                [MapEntry(userThatNeedsToPayUserId, howMuchNeedToPay)]);
        // else means the user needs to pay more than the user is owed.
        // we should still use up the balance, but this person needs to be revisited later so the rest of his balance gets also used up
      } else {
        print("would this even ever happen?");
      }
    }
  }

  return finalWhoOwesWho;
}

Map<int, double> calculateBalancePerUser(
    {required List<ExpenseItem> expenseItems,
    required List<ExpensePayer> expensePayers,
    required List<ExpenseBeneficiary> expenseBeneficiares}) {
  Map<int, double> moneyInCentPerUser = {};
  for (ExpenseItem expenseItem in expenseItems) {
    List<ExpensePayer> expensePayersOfExpenseItem = expensePayers
        .where((expensePayer) => expensePayer.expenseItemId == expenseItem.id)
        .toList();
    List<ExpenseBeneficiary> expenseBeneficiariesOfExpenseItem =
        expenseBeneficiares
            .where((expenseBeneficiary) =>
                expenseBeneficiary.expenseItemId == expenseItem.id)
            .toList();

    for (ExpensePayer expensePayer in expensePayersOfExpenseItem) {
      double calculatedAmount =
          (expenseItem.amount * expensePayer.percentagePaid / 100);
      moneyInCentPerUser.update(expensePayer.userId,
          (existingValue) => existingValue + calculatedAmount,
          ifAbsent: () => calculatedAmount);
    }

    for (ExpenseBeneficiary expenseBeneficiary
        in expenseBeneficiariesOfExpenseItem) {
      double calculatedAmount =
          (expenseItem.amount * expenseBeneficiary.percentageShare / 100);
      moneyInCentPerUser.update(expenseBeneficiary.userId,
          (existingValue) => existingValue - calculatedAmount,
          ifAbsent: () => -calculatedAmount);
    }
  }
  return moneyInCentPerUser;
}
