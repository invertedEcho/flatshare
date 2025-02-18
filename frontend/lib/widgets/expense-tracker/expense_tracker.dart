import 'package:flatshare/const.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/providers/expense_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/money.dart';
import 'package:flatshare/widgets/expense-tracker/utils.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ExpenseTrackerWidget extends StatefulWidget {
  const ExpenseTrackerWidget({super.key});

  @override
  State<StatefulWidget> createState() => ExpenseTrackerWidgetState();
}

class ExpenseTrackerWidgetState extends State<ExpenseTrackerWidget> {
  @override
  void initState() {
    super.initState();
    Provider.of<ExpenseItemProvider>(context, listen: false)
        .initExpenseItems(context);
  }

  @override
  Widget build(BuildContext context) {
    ExpenseItemProvider expenseItemProvider =
        Provider.of<ExpenseItemProvider>(context, listen: true);
    UserProvider userProvider =
        Provider.of<UserProvider>(context, listen: true);

    List<ExpenseItem> expenseItems = expenseItemProvider.expenseItems;
    List<ExpensePayer> expensePayers = expenseItemProvider.expensePayers;
    List<ExpenseBeneficiary> expenseBeneficiares =
        expenseItemProvider.expenseBeneficiares;
    List<User> usersInUserGroup = userProvider.usersInUserGroup;
    print(usersInUserGroup);

    double total =
        expenseItems.map((item) => item.amount).fold(0, (a, b) => a + b);
    Map<int, double> balancePerUser = calculateBalancePerUser(
        expenseItems: expenseItems,
        expensePayers: expensePayers,
        expenseBeneficiares: expenseBeneficiares);
    double? ownBalance = balancePerUser[userProvider.user?.userId];

    Map<int, List<MapEntry<int, double>>> settlePayment =
        getSettlePayment(balancePerUser);
    print(balancePerUser);
    List<MapEntry<int, double>>? ownSettlePayment =
        settlePayment[userProvider.user?.userId];
    print("ownSettlePayment: $ownSettlePayment");

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
                        const Text("Total:"),
                        Text(
                          stringifyCentAmount(total),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 22),
                        ),
                        const SizedBox(
                          height: 15,
                        ),
                        const Text("You need to pay:"),
                        Text(
                          stringifyCentAmount(ownBalance ?? 0),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 22),
                        )
                      ],
                    ),
                  ))),
          const SizedBox(
            height: 20,
          ),
          const Row(
            children: [
              Text(
                "Settle up",
                style: TextStyle(fontSize: 16),
              ),
              Spacer(),
              Text(
                "View all",
                style: TextStyle(color: Colors.blueAccent, fontSize: 16),
              ),
              Icon(
                Icons.chevron_right,
                color: Colors.blueAccent,
              )
            ],
          ),
          const SizedBox(height: 5),
          SizedBox(
            width: double.infinity,
            child: Card(
              elevation: generalElevation,
              child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: SizedBox(
                    height: 140,
                    child: ListView.builder(
                      shrinkWrap: true,
                      physics: const ScrollPhysics(),
                      scrollDirection: Axis.horizontal,
                      itemCount: usersInUserGroup.length,
                      itemBuilder: (BuildContext context, int index) {
                        var user = usersInUserGroup[index];
                        final String username = user.username;
                        final amount = ownSettlePayment
                            ?.firstWhere(
                                (oweUser) => oweUser.key == user.userId)
                            .value;
                        return Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              const Text(
                                "You owe",
                              ),
                              Text(
                                username,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold),
                              ),
                              Text(
                                stringifyCentAmount(amount ?? 0),
                                style: const TextStyle(color: Colors.orange),
                              ),
                              const SizedBox(
                                height: 7,
                              ),
                              RawMaterialButton(
                                onPressed: amount == null ? null : () {},
                                elevation: 2.0,
                                fillColor:
                                    amount == null ? Colors.grey : Colors.green,
                                constraints:
                                    const BoxConstraints(minWidth: 20.0),
                                padding: const EdgeInsets.all(10.0),
                                shape: const RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(5))),
                                child: const Row(children: [
                                  Text("Pay up"),
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
          )
        ],
      ),
    );
  }
}
