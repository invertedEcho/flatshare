import 'package:flatshare/const.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/expense_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/money.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:collection/collection.dart';

class ExpenseTrackerWidget extends StatefulWidget {
  const ExpenseTrackerWidget({super.key});

  @override
  State<StatefulWidget> createState() => ExpenseTrackerWidgetState();
}

class ExpenseTrackerWidgetState extends State<ExpenseTrackerWidget> {
  // TODO: get rid of this by storing them in a provider too
  List<User> usersInUserGroup = [];

  @override
  void initState() {
    super.initState();
    Provider.of<ExpenseItemProvider>(context, listen: false)
        .initExpenseItems(context);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final userGroupId = userGroup?.id;

    if (userGroupId != null) {
      fetchUsersInUserGroup(userGroupId: userGroupId).then((result) {
        setState(() {
          usersInUserGroup = result;
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    List<ExpenseItem> expenseItems =
        Provider.of<ExpenseItemProvider>(context).expenseItems;
    List<ExpensePayer> expensePayers =
        Provider.of<ExpenseItemProvider>(context).expensePayers;
    List<ExpenseBeneficiary> expenseBeneficiares =
        Provider.of<ExpenseItemProvider>(context).expenseBeneficiares;

    return Padding(
      padding: const EdgeInsets.all(generalRootPadding),
      child: Column(
        children: [
          Expanded(
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
                    final expenseBeneficiaresOfExpenseItem = expenseBeneficiares
                        .where((expenseBeneficiary) =>
                            expenseBeneficiary.expenseItemId == expenseItem.id)
                        .toList();

                    final expensePayerNames = expensePayersOfExpenseItem
                        .map((expensePayer) => usersInUserGroup
                            .firstWhereOrNull(
                                (user) => user.userId == expensePayer.userId)
                            ?.username)
                        .toList();

                    final expenseBeneficiaryNames =
                        expenseBeneficiaresOfExpenseItem
                            .map((expenseBeneficiary) => usersInUserGroup
                                .firstWhereOrNull((user) =>
                                    user.userId == expenseBeneficiary.userId)
                                ?.username)
                            .toList();

                    String trailingText =
                        "${stringifyCentAmount(expenseItem.amount)}\nPaid by: ${expensePayerNames.join(", ")}";

                    return Card(
                        child: ListTile(
                      title: Text(expenseItem.title),
                      subtitle:
                          Text("For: ${expenseBeneficiaryNames.join(", ")}"),
                      trailing: Text(trailingText),
                    ));
                  }))
        ],
      ),
    );
  }
}
