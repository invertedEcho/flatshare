import 'dart:convert';

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
  final Map<int, double> moneyPerUser = {};

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
        moneyPerUser.update(expensePayer.userId,
            (existingValue) => existingValue + calculatedAmount,
            ifAbsent: () => calculatedAmount);
      }

      for (ExpenseBeneficiary expenseBeneficiary in expenseBeneficiaries) {
        double calculatedAmount =
            expenseItem.amount * expenseBeneficiary.percentageShare / 100;
        moneyPerUser.update(expenseBeneficiary.userId,
            (existingValue) => existingValue - calculatedAmount,
            ifAbsent: () => -calculatedAmount);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
        child: ListView.builder(
            itemCount: moneyPerUser.length,
            itemBuilder: (BuildContext context, int index) {
              final int userId = moneyPerUser.keys.toList()[index];
              final User user = widget.usersInUserGroup
                  .firstWhere((user) => user.userId == userId);
              final double moneyOfUser = moneyPerUser.values.toList()[index];

              return Card(
                child: ListTile(
                  title: Text(user.username),
                  subtitle: Text(
                    stringifyCentAmount(moneyOfUser),
                    style: TextStyle(
                        color: moneyOfUser < 0 ? Colors.red : Colors.green),
                  ),
                ),
              );
            }));
  }
}
