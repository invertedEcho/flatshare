import 'package:collection/collection.dart';
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

  @override
  void initState() {
    super.initState();
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
            expenseItem.amount * expensePayer.percentagePaid / 100;
        print("expensepayer: calculatedamount: $calculatedAmount");
        moneyInCentPerUser.update(expensePayer.userId,
            (existingValue) => existingValue + calculatedAmount,
            ifAbsent: () => calculatedAmount);
      }

      for (ExpenseBeneficiary expenseBeneficiary in expenseBeneficiaries) {
        double calculatedAmount =
            expenseItem.amount * expenseBeneficiary.percentageShare / 100;
        print("expensebeneficiary: calculatedAmount: $calculatedAmount");
        moneyInCentPerUser.update(expenseBeneficiary.userId,
            (existingValue) => existingValue - calculatedAmount,
            ifAbsent: () => -calculatedAmount);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
        child: ListView.builder(
            itemCount: moneyInCentPerUser.length,
            itemBuilder: (BuildContext context, int index) {
              final int userId = moneyInCentPerUser.keys.toList()[index];
              final User? user =
                  widget.usersInUserGroup.firstWhereOrNull((user) {
                return user.userId == userId;
              });

              // TODO: this should not be possible happen
              if (user == null) {
                print(
                    "COULD NOT FIND userId: $userId in usersInUserGroup: ${widget.usersInUserGroup}");
                return Text(
                    "COULD NOT FIND userId: $userId in usersInUserGroup: ${widget.usersInUserGroup}");
              }

              final double moneyOfUserCent =
                  moneyInCentPerUser.values.toList()[index];
              print(moneyOfUserCent);

              return Card(
                child: ListTile(
                  title: Text(user.username),
                  subtitle: Text(
                    stringifyCentAmount(moneyOfUserCent),
                    style: TextStyle(
                        color: moneyOfUserCent < 0 ? Colors.red : Colors.green),
                  ),
                ),
              );
            }));
  }
}
