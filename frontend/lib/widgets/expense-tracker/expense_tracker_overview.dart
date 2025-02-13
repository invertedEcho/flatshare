import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/utils/money.dart';
import 'package:flutter/material.dart';

class ExpenseTrackerOverview extends StatefulWidget {
  const ExpenseTrackerOverview(
      {super.key,
      required this.expenseItems,
      required this.expensePayers,
      required this.expenseBeneficiaries,
      required this.usersInUserGroup});

  final List<ExpenseItem> expenseItems;
  final List<ExpensePayer> expensePayers;
  final List<ExpenseBeneficiary> expenseBeneficiaries;
  final List<User> usersInUserGroup;

  @override
  State<StatefulWidget> createState() {
    return ExpenseTrackerOverviewState();
  }
}

class ExpenseTrackerOverviewState extends State<ExpenseTrackerOverview> {
  final Map<int, double> moneyInCentPerUser = {};

  Color getColorForMoneyOfUserInCent(double amountInCent) {
    double inEur = (amountInCent / 100).roundToDouble();

    if (inEur == -0.0) {
      return Colors.white;
    }

    if (amountInCent > 0) {
      return Colors.green;
    }
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    moneyInCentPerUser.clear();
    for (ExpenseItem expenseItem in widget.expenseItems) {
      List<ExpensePayer> expensePayers = widget.expensePayers
          .where((expensePayer) => expensePayer.expenseItemId == expenseItem.id)
          .toList();
      List<ExpenseBeneficiary> expenseBeneficiaries = widget
          .expenseBeneficiaries
          .where((expenseBeneficiary) =>
              expenseBeneficiary.expenseItemId == expenseItem.id)
          .toList();

      for (ExpensePayer expensePayer in expensePayers) {
        double calculatedAmount =
            (expenseItem.amount * expensePayer.percentagePaid / 100);
        moneyInCentPerUser.update(expensePayer.userId,
            (existingValue) => existingValue + calculatedAmount,
            ifAbsent: () => calculatedAmount);
      }

      for (ExpenseBeneficiary expenseBeneficiary in expenseBeneficiaries) {
        double calculatedAmount =
            (expenseItem.amount * expenseBeneficiary.percentageShare / 100);
        moneyInCentPerUser.update(expenseBeneficiary.userId,
            (existingValue) => existingValue - calculatedAmount,
            ifAbsent: () => -calculatedAmount);
      }
    }

    return Expanded(
        child: ListView.builder(
            itemCount: moneyInCentPerUser.length,
            itemBuilder: (BuildContext context, int index) {
              final int userId = moneyInCentPerUser.keys.toList()[index];
              final User user = widget.usersInUserGroup.firstWhere((user) {
                return user.userId == userId;
              });

              final double moneyOfUserInCent =
                  moneyInCentPerUser.values.toList()[index];
              Color color = getColorForMoneyOfUserInCent(moneyOfUserInCent);

              return Card(
                child: ListTile(
                  title: Text(user.username),
                  subtitle: Text(
                    stringifyCentAmount(moneyOfUserInCent),
                    style: TextStyle(color: color),
                  ),
                ),
              );
            }));
  }
}
