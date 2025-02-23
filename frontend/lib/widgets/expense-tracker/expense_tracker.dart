import 'package:collection/collection.dart';
import 'package:flatshare/const.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/providers/expense_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/date.dart';
import 'package:flatshare/utils/money.dart';
import 'package:flatshare/widgets/expense-tracker/utils.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

class ExpenseTrackerWidget extends StatefulWidget {
  const ExpenseTrackerWidget({super.key});

  @override
  State<StatefulWidget> createState() => ExpenseTrackerWidgetState();
}

class ExpenseTrackerWidgetState extends State<ExpenseTrackerWidget> {
  @override
  void initState() {
    super.initState();
    Provider.of<ExpenseTrackerProvider>(context, listen: false)
        .initExpenseItems(context);
  }

  void payUp(int amountInCent, int toUserId) {
    Provider.of<ExpenseTrackerProvider>(context, listen: false);
  }

  Future<void> _showMyDialog() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false, // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('AlertDialog Title'),
          content: const SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text('Do you really want to settle this payment?'),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              style: ButtonStyle(
                  overlayColor:
                      WidgetStatePropertyAll(Colors.red.withOpacity(0.1))),
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Abort', style: TextStyle(color: Colors.red)),
            ),
            TextButton(
              child: const Text(
                'Confirm',
              ),
              onPressed: () {
                print("Not yet implemented!!!");
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    ExpenseTrackerProvider expenseItemProvider =
        Provider.of<ExpenseTrackerProvider>(context, listen: true);
    UserProvider userProvider =
        Provider.of<UserProvider>(context, listen: true);

    final int? currentUserId = userProvider.user?.userId;
    if (currentUserId == null) {
      return const Text(
          "Sorry, something went wrong. Please try logging out and in again.");
    }

    List<ExpenseItem> expenseItems = expenseItemProvider.expenseItems;
    List<ExpensePayer> expensePayers = expenseItemProvider.expensePayers;
    List<ExpenseBeneficiary> expenseBeneficiares =
        expenseItemProvider.expenseBeneficiares;
    List<User> usersInUserGroup = userProvider.usersInUserGroup;
    List<User> usersInUserGroupWithoutCurrentUser =
        usersInUserGroup.where((user) => user.userId != currentUserId).toList();

    double total =
        expenseItems.map((item) => item.amount).fold(0, (a, b) => a + b);

    Map<int, double> balancePerUser =
        calculateBalancePerUserFromAllExpenseItems(
            expenseItems: expenseItems,
            expensePayers: expensePayers,
            expenseBeneficiares: expenseBeneficiares);

    double balanceOfCurrentUser = balancePerUser[currentUserId] ?? 0;
    final bool isCurrentUserOwed = balanceOfCurrentUser > 0;

    print("Own balance: ${balanceOfCurrentUser / 100}");

    Map<int, List<MapEntry<int, double>>> settlePayment =
        getSettlePayment(balancePerUser);
    List<MapEntry<int, double>>? ownSettlePayment =
        settlePayment[userProvider.user?.userId];

    return Padding(
      padding: const EdgeInsets.all(generalRootPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
              width: double.infinity,
              child: Card(
                  color: Colors.blueAccent,
                  elevation: generalElevation,
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Total Group Balance:",
                            style: TextStyle(fontSize: 13)),
                        Text(
                          stringifyCentAmount(total),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 22),
                        ),
                        const SizedBox(
                          height: 15,
                        ),
                        Text(
                            isCurrentUserOwed
                                ? "You will be paid:"
                                : "You need to pay:",
                            style: const TextStyle(fontSize: 13)),
                        Text(
                          stringifyCentAmount(balanceOfCurrentUser),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 22),
                        ),
                      ],
                    ),
                  ))),
          const SizedBox(
            height: 20,
          ),
          const Text(
            "Settle up",
            style: TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 5),
          SizedBox(
            width: double.infinity,
            child: Card(
              elevation: generalElevation,
              child: Padding(
                  padding: const EdgeInsets.all(5.0),
                  child: SizedBox(
                    height: 140,
                    child: ListView.builder(
                      shrinkWrap: true,
                      physics: const ScrollPhysics(),
                      scrollDirection: Axis.horizontal,
                      itemCount: usersInUserGroupWithoutCurrentUser.length,
                      itemBuilder: (BuildContext context, int index) {
                        final User user =
                            usersInUserGroupWithoutCurrentUser[index];
                        final String username = user.username;
                        final double amount = ownSettlePayment
                                ?.firstWhereOrNull(
                                    (oweUser) => oweUser.key == user.userId)
                                ?.value ??
                            0;

                        if (amount == 0) {
                          return null;
                        }

                        print("amount: $amount");
                        return Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              Text(
                                amount < 0 ? "You get from" : "You owe",
                              ),
                              Text(
                                username,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold),
                              ),
                              Text(
                                stringifyCentAmount(amount.abs()),
                                style: TextStyle(
                                    color: amount < 0
                                        ? Colors.green
                                        : Colors.orange),
                              ),
                              const SizedBox(
                                height: 7,
                              ),
                              RawMaterialButton(
                                onPressed: () {
                                  // if (amount < 0) {
                                  //   Share.share(
                                  //       "Hey, you still owe me ${stringifyCentAmount(amount.abs())}.");
                                  // } else {
                                  _showMyDialog();
                                  // }
                                },
                                elevation: 2.0,
                                fillColor: Colors.green,
                                constraints:
                                    const BoxConstraints(minWidth: 20.0),
                                padding: const EdgeInsets.all(10.0),
                                shape: const RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(5))),
                                child: Row(children: [
                                  Text(amount < 0 ? "Ask" : "Pay up"),
                                  Icon(Icons.attach_money)
                                ]),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  )),
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Row(
            children: [
              const Text(
                "All Expenses",
                style: TextStyle(fontSize: 16),
              ),
              const Spacer(),
              RawMaterialButton(
                onPressed: () {},
                child: const Padding(
                  padding: EdgeInsets.only(left: 6),
                  child: Row(
                    children: [
                      Text(
                        "View all",
                        style:
                            TextStyle(color: Colors.blueAccent, fontSize: 16),
                      ),
                      Icon(
                        Icons.chevron_right,
                        color: Colors.blueAccent,
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
          Expanded(
            child: Card(
              elevation: generalElevation,
              child: Padding(
                  padding: const EdgeInsets.all(5.0),
                  child: SizedBox(
                    height: 140,
                    width: double.infinity,
                    child: expenseItems.isEmpty
                        ? const Center(child: Text("No Expenses yet."))
                        : ListView.separated(
                            separatorBuilder:
                                (BuildContext context, int index) {
                              return const Divider();
                            },
                            itemCount: expenseItems.length,
                            itemBuilder: (BuildContext context, int index) {
                              final ExpenseItem expenseItem =
                                  expenseItems[index];
                              final List<ExpensePayer> localExpensePayers =
                                  expensePayers
                                      .where((expensePayer) =>
                                          expensePayer.expenseItemId ==
                                          expenseItem.id)
                                      .toList();

                              final expensePayerNames = localExpensePayers
                                  .map((expensePayer) => usersInUserGroup
                                      .firstWhereOrNull((user) =>
                                          user.userId == expensePayer.userId)
                                      ?.username)
                                  .toList();

                              final String? monthShort = stringifyMonthShort(
                                  expenseItem.createdAt.month);

                              if (monthShort == null) {
                                throw Exception(
                                    "Could not get short month text from expenseItem.createdAt.month");
                              }

                              return Padding(
                                  padding: const EdgeInsets.all(0),
                                  child: ListTile(
                                    leading: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          expenseItem.createdAt
                                              .toLocal()
                                              .day
                                              .toString(),
                                          style: const TextStyle(
                                              color: Colors.white70),
                                        ),
                                        Text(
                                          monthShort,
                                          style: const TextStyle(
                                              color: Colors.white70),
                                        ),
                                      ],
                                    ),
                                    trailing: Text(stringifyCentAmount(
                                        expenseItem.amount.toDouble())),
                                    title: Text(expenseItem.title),
                                    subtitle: Text(
                                        "Paid by: ${expensePayerNames.isNotEmpty ? expensePayerNames.join(", ") : "No-one"}"),
                                  ));
                            },
                          ),
                  )),
            ),
          ),
        ],
      ),
    );
  }
}
