import 'package:flatshare/fetch/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ExpenseItemProvider extends ChangeNotifier {
  List<ExpenseItem> _expenseItems = [];
  List<ExpenseItem> get expenseItems => _expenseItems;

  List<ExpensePayer> _expensePayers = [];
  List<ExpensePayer> get expensePayers => _expensePayers;

  List<ExpenseBeneficiary> _expenseBeneficiares = [];
  List<ExpenseBeneficiary> get expenseBeneficiares => _expenseBeneficiares;

  void addExpenseItem(
      {required BuildContext context,
      required ExpenseItem expenseItem,
      required List<ExpenseBeneficiary> expenseBeneficiaries,
      required List<ExpensePayer> expensePayers}) async {
    final createdExpenseItem = await postExpenseItem(
        expenseItem: expenseItem,
        expensePayers: expensePayers,
        expenseBeneficiaries: expenseBeneficiaries);
    _expenseItems.add(createdExpenseItem);
    notifyListeners();
  }

  Future<void> initExpenseItems(BuildContext context) async {
    // TODO: I am not really happy with accessing another provider inside a provider.
    final userGroup =
        Provider.of<UserProvider>(context, listen: false).userGroup;
    if (userGroup == null) {
      throw Exception(
          "Cannot fetch expense items while the userGroup is not set");
    }

    final expenseItems = await fetchAllExpenseItems(userGroup.id);
    _expenseItems = expenseItems;
    final expensePayers = await fetchAllExpensePayers(userGroup.id);
    _expensePayers = expensePayers;
    final expenseBeneficiaries =
        await fetchAllExpenseBeneficiares(userGroup.id);
    _expenseBeneficiares = expenseBeneficiaries;
    notifyListeners();
  }
}
