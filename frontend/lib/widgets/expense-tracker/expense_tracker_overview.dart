import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/utils/money.dart';
import 'package:flatshare/widgets/expense-tracker/utils.dart';
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
  Map<int, double> balanceInCentPerUser = {};

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
    setState(() {
      balanceInCentPerUser.clear();
      balanceInCentPerUser = calculateBalancePerUser(
          expenseItems: widget.expenseItems,
          expensePayers: widget.expensePayers,
          expenseBeneficiares: widget.expenseBeneficiaries);
      getSettlePayment(balanceInCentPerUser);
    });

    if (widget.expenseItems.isEmpty) {
      return const Expanded(
        child: Center(child: Text("No expenses found.")),
      );
    }

    return Expanded(
        child: ListView.builder(
            itemCount: balanceInCentPerUser.length,
            itemBuilder: (BuildContext context, int index) {
              final int userId = balanceInCentPerUser.keys.toList()[index];
              final User user = widget.usersInUserGroup.firstWhere((user) {
                return user.userId == userId;
              });

              final double moneyOfUserInCent =
                  balanceInCentPerUser.values.toList()[index];
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
