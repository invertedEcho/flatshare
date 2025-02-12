import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/expense_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  int convertAmountTextInputToCent(String input) {
    if (input.contains(",")) {
      return int.parse(input.replaceAll(",", ""));
    }
    if (input.contains(".")) {
      return int.parse(input.replaceAll(".", ""));
    }
    return int.parse(input) * 100;
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

    // we show euro in frontend, but we store it as cent in database
    int actualAmountInCent =
        convertAmountTextInputToCent(amountController.text);

    ExpenseItem expenseItem = ExpenseItem(
        userGroupId: userGroup.id,
        title: titleController.text,
        description: descriptionController.text,
        amount: actualAmountInCent);

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

    if (expensePayers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('At least one payer must be selected!')),
      );
      return;
    }

    if (expenseBeneficiares.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('At least one beneficiary must be selected!')),
      );
      return;
    }

    expenseItemProvider.addExpenseItem(
        context: context,
        expenseItem: expenseItem,
        expenseBeneficiaries: expenseBeneficiares,
        expensePayers: expensePayers);
    Navigator.of(context).pop();
  }

  double calculateEqualDistributedPercentage(int countOfPeople) {
    // 1. we have 100 to distribute
    return 100 / countOfPeople;
  }

  @override
  void initState() {
    super.initState();

    UserProvider userProvider =
        Provider.of<UserProvider>(context, listen: false);
    if (userProvider.user != null) {
      selectedPayers.addAll({userProvider.user!.userId: 100});
    }

    List<User> usersInUserGroup = userProvider.usersInUserGroup;
    double equalDistributed =
        calculateEqualDistributedPercentage(usersInUserGroup.length);
    Map<int, double> initialBeneficiares = {};
    for (User user in usersInUserGroup) {
      initialBeneficiares.update(user.userId, (_) => equalDistributed,
          ifAbsent: () => equalDistributed);
    }
    selectedBeneficiares.addAll(initialBeneficiares);
  }

  @override
  Widget build(BuildContext context) {
    UserProvider userProvider =
        Provider.of<UserProvider>(context, listen: true);
    List<User> usersInUserGroup = userProvider.usersInUserGroup;

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
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                            RegExp(r'^[0-9.,]*$')),
                      ],
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
                                          double equalDistributed =
                                              calculateEqualDistributedPercentage(
                                                  selectedPayers.length + 1);
                                          selectedPayers.addAll(
                                              {user.userId: equalDistributed});
                                          selectedPayers.updateAll(
                                              (key, value) => equalDistributed);
                                        } else {
                                          selectedPayers.removeWhere(
                                              (userId, percentagePaid) =>
                                                  userId == user.userId);
                                          double equalDistributed =
                                              calculateEqualDistributedPercentage(
                                                  selectedPayers.length);
                                          selectedPayers.updateAll(
                                              (key, value) => equalDistributed);
                                        }
                                      });
                                    }),
                                Text(user.username),
                                const Spacer(),
                                SizedBox(
                                  width: 80,
                                  child: TextFormField(
                                    key: Key(equalDistributed.toString()),
                                    initialValue: isUserSelected
                                        ? equalDistributed.toStringAsFixed(2)
                                        : null,
                                    onChanged: (value) {
                                      double newValue = double.parse(value);
                                      selectedPayers.update(user.userId,
                                          (oldValue) {
                                        return newValue;
                                      });
                                    },
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
                                      : calculateEqualDistributedPercentage(
                                          selectedBeneficiares.length);
                              return Row(children: [
                                Checkbox(
                                    value: isUserSelected,
                                    onChanged: (value) {
                                      if (value == null) return;
                                      setState(() {
                                        if (value) {
                                          double equalDistributed =
                                              calculateEqualDistributedPercentage(
                                                  selectedBeneficiares.length +
                                                      1);
                                          selectedBeneficiares.addAll(
                                              {user.userId: equalDistributed});
                                          selectedBeneficiares.updateAll(
                                              (key, value) => equalDistributed);
                                        } else {
                                          selectedBeneficiares.removeWhere(
                                              (userId, percentageShare) =>
                                                  userId == user.userId);
                                          double equalDistributed =
                                              calculateEqualDistributedPercentage(
                                                  selectedBeneficiares.length);
                                          selectedBeneficiares.updateAll(
                                              (key, value) => equalDistributed);
                                        }
                                      });
                                    }),
                                Text(user.username),
                                const Spacer(),
                                SizedBox(
                                  width: 80,
                                  child: TextFormField(
                                    key: Key(equalDistributed.toString()),
                                    initialValue: isUserSelected
                                        ? equalDistributed.toStringAsFixed(2)
                                        : null,
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
