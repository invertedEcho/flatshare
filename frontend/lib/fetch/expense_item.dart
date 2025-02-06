import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/utils/env.dart';

Future<ExpenseItem> postExpenseItem(
    {required ExpenseItem expenseItem,
    required List<ExpenseBeneficiary> expenseBeneficiaries,
    required List<ExpensePayer> expensePayers}) async {
  var apiBaseUrl = getApiBaseUrl();
  print(jsonEncode(expenseBeneficiaries));
  print(jsonEncode(expensePayers));
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/expense-item'),
          body: jsonEncode({
            'expenseItem': expenseItem,
            'expenseBeneficiares': expenseBeneficiaries,
            'expensePayers': expensePayers
          }));
  if (response.statusCode != 201) {
    throw Exception("Failed to create expense item: ${response.statusCode}]");
  }

  dynamic decodedResponseBody = jsonDecode(response.body);
  return ExpenseItem.fromJson(decodedResponseBody);
}

Future<List<ExpenseItem>> fetchAllExpenseItems(int userGroupId) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/expense-item?userGroupId=$userGroupId'));
  if (response.statusCode != 200) {
    throw Exception("Failed to get expense items: ${response.statusCode}]");
  }

  List<dynamic> decodedResponseBody = jsonDecode(response.body);
  print(decodedResponseBody);
  return decodedResponseBody
      .map<ExpenseItem>((expenseItem) => ExpenseItem.fromJson(expenseItem))
      .toList();
}
