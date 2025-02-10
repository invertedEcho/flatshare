import 'dart:convert';

import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/expense_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class AddExpenseItem extends StatefulWidget {
  const AddExpenseItem({super.key});

  @override
  State<StatefulWidget> createState() {
    return AddExpenseItemState();
  }
}

class AddExpenseItemState extends State<AddExpenseItem> {
  final _formKey = GlobalKey<FormState>();
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final amountController = TextEditingController();

  Map<int, double> selectedPayers = {};
  Map<int, double> selectedBeneficiares = {};

  final multiSelectUserController = MultiSelectController<User>([]);

  // TODO: get rid of this by storing them in a provider too
  List<User> usersInUserGroup = [];

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

  void handleAddExpenseItem() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    ExpenseItemProvider expenseItemProvider =
        Provider.of<ExpenseItemProvider>(context, listen: false);
    UserProvider userProvider =
        Provider.of<UserProvider>(context, listen: false);

    UserGroup? userGroup = userProvider.userGroup;
    if (userGroup == null) {
      throw Exception(
          "userGroup was null while trying to add a new expense item");
    }

    ExpenseItem expenseItem = ExpenseItem(
        userGroupId: userGroup.id,
        title: titleController.text,
        description: descriptionController.text,
        // we show euro in frontend, but we store it as cent in database
        amount: int.parse(amountController.text) * 100);

    List<ExpenseBeneficiary> expenseBeneficiares = [];

    for (var selectedBeneficiary in selectedBeneficiares.entries) {
      expenseBeneficiares.add(ExpenseBeneficiary(
          userId: selectedBeneficiary.key,
          percentageShare: selectedBeneficiary.value));
    }

    List<ExpensePayer> expensePayers = [];

    for (var selectedPayer in selectedPayers.entries) {
      expensePayers.add(ExpensePayer(
          userId: selectedPayer.key, percentagePaid: selectedPayer.value));
    }
    expenseItemProvider.addExpenseItem(
        context: context,
        expenseItem: expenseItem,
        expenseBeneficiaries: expenseBeneficiares,
        expensePayers: expensePayers);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Add Expense")),
        body: Form(
            key: _formKey,
            child: Padding(
                padding: const EdgeInsets.all(30),
                child: Column(
                  children: [
                    TextFormField(
                      controller: titleController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a title';
                        }
                        return null;
                      },
                      decoration: const InputDecoration(
                        labelText: "Title",
                      ),
                    ),
                    TextFormField(
                      decoration: const InputDecoration(
                          labelText: "Amount", suffixText: "€"),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter an amount';
                        }
                        return null;
                      },
                      controller: amountController,
                      keyboardType: const TextInputType.numberWithOptions(
                          signed: false, decimal: true),
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                    const Text("Select payer(s)"),
                    Expanded(
                        child: ListView.builder(
                            itemCount: usersInUserGroup.length,
                            itemBuilder: (BuildContext context, int index) {
                              var user = usersInUserGroup[index];
                              var isUserSelected = selectedPayers.keys
                                  .any((userId) => userId == user.userId);
                              double equalDistributed = selectedPayers.isEmpty
                                  ? 0
                                  : 100 / selectedPayers.length;
                              return Row(children: [
                                Checkbox(
                                    value: isUserSelected,
                                    onChanged: (value) {
                                      if (value == null) return;
                                      setState(() {
                                        if (value) {
                                          // we have to recalculate equalDistributed as its missing the newly added payer (yet)
                                          equalDistributed =
                                              100 / (selectedPayers.length + 1);
                                          selectedPayers.addAll(
                                              {user.userId: equalDistributed});
                                          selectedPayers.updateAll(
                                              (key, value) => equalDistributed);
                                        } else {
                                          selectedPayers.removeWhere(
                                              (userId, percentagePaid) =>
                                                  userId == user.userId);
                                        }
                                      });
                                    }),
                                Text(user.username),
                                const Spacer(),
                                SizedBox(
                                  width: 70,
                                  child: TextFormField(
                                    key: Key(equalDistributed.toString()),
                                    onChanged: (value) {
                                      double newValue = double.parse(value);
                                      selectedPayers.update(user.userId,
                                          (oldValue) {
                                        return newValue;
                                      });
                                    },
                                    initialValue: isUserSelected
                                        ? equalDistributed.toString()
                                        : null,
                                    decoration:
                                        const InputDecoration(suffixText: "%"),
                                    readOnly: !isUserSelected,
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                            signed: false, decimal: true),
                                  ),
                                )
                              ]);
                            })),
                    const SizedBox(
                      height: 10,
                    ),
                    const Text("Select beneficiares"),
                    Expanded(
                        child: ListView.builder(
                            itemCount: usersInUserGroup.length,
                            itemBuilder: (BuildContext context, int index) {
                              var user = usersInUserGroup[index];
                              var isUserSelected = selectedBeneficiares.keys
                                  .any((userId) => userId == user.userId);
                              double equalDistributed =
                                  selectedBeneficiares.isEmpty
                                      ? 0
                                      : 100 / selectedBeneficiares.length;
                              return Row(children: [
                                Checkbox(
                                    value: isUserSelected,
                                    onChanged: (value) {
                                      if (value == null) return;
                                      setState(() {
                                        if (value) {
                                          // we have to recalculate equalDistributed as its missing the newly added beneficiary (yet)
                                          equalDistributed = 100 /
                                              (selectedBeneficiares.length + 1);
                                          selectedBeneficiares.addAll(
                                              {user.userId: equalDistributed});
                                          selectedBeneficiares.updateAll(
                                              (key, value) => equalDistributed);
                                        } else {
                                          selectedBeneficiares.removeWhere(
                                              (userId, percentageShare) =>
                                                  userId == user.userId);
                                        }
                                      });
                                    }),
                                Text(user.username),
                                const Spacer(),
                                SizedBox(
                                  width: 70,
                                  child: TextFormField(
                                    key: Key(equalDistributed.toString()),
                                    onChanged: (value) {
                                      if (value.isEmpty) {
                                        return;
                                      }
                                      double newValue = double.parse(value);
                                      selectedBeneficiares.update(user.userId,
                                          (oldValue) {
                                        return newValue;
                                      });
                                    },
                                    initialValue: isUserSelected
                                        ? equalDistributed.toString()
                                        : null,
                                    decoration:
                                        const InputDecoration(suffixText: "%"),
                                    readOnly: !isUserSelected,
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                            signed: false, decimal: true),
                                  ),
                                )
                              ]);
                            })),
                    ElevatedButton(
                        onPressed: handleAddExpenseItem,
                        child: const Text("Add")),
                  ],
                ))));
  }
}
