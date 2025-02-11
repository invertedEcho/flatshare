import 'dart:convert';

import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/utils/money.dart';
import 'package:flutter/material.dart';
import 'package:collection/collection.dart';

class ExpenseItemList extends StatelessWidget {
  const ExpenseItemList(
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
  Widget build(BuildContext context) {
    print("Current expensepayers: ${jsonEncode(expensePayers)}");
    print("Current expense beneficiares: ${jsonEncode(expenseBeneficiaries)}");
    return Expanded(
        child: ListView.builder(
            itemCount: expenseItems.length,
            itemBuilder: (BuildContext context, int index) {
              var expenseItem = expenseItems[index];
              if (expenseItems.isEmpty) {
                return const Text("No expense items found!");
              }

              final expensePayersOfExpenseItem = expensePayers
                  .where((expensePayer) =>
                      expensePayer.expenseItemId == expenseItem.id)
                  .toList();
              final expenseBeneficiaresOfExpenseItem = expenseBeneficiaries
                  .where((expenseBeneficiary) =>
                      expenseBeneficiary.expenseItemId == expenseItem.id)
                  .toList();

              final expensePayerNames = expensePayersOfExpenseItem
                  .map((expensePayer) => usersInUserGroup
                      .firstWhereOrNull(
                          (user) => user.userId == expensePayer.userId)
                      ?.username)
                  .toList();

              final expenseBeneficiaryNames = expenseBeneficiaresOfExpenseItem
                  .map((expenseBeneficiary) => usersInUserGroup
                      .firstWhereOrNull(
                          (user) => user.userId == expenseBeneficiary.userId)
                      ?.username)
                  .toList();

              String trailingText =
                  "${stringifyCentAmount(double.parse(expenseItem.amount.toString()))}\nPaid by: ${expensePayerNames.join(", ")}";

              return Card(
                  child: ListTile(
                title: Text(expenseItem.title),
                subtitle: Text("For: ${expenseBeneficiaryNames.join(", ")}"),
                trailing: Text(trailingText),
              ));
            }));
  }
}
