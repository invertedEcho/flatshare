import 'package:collection/collection.dart';
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

class SettlePayment extends StatefulWidget {
  const SettlePayment({super.key});

  @override
  State<StatefulWidget> createState() {
    return SettlePaymentState();
  }
}

class SettlePaymentState extends State<SettlePayment> {
  @override
  Widget build(BuildContext context) {
    ExpenseTrackerProvider expenseItemProvider =
        Provider.of<ExpenseTrackerProvider>(context, listen: true);
    List<ExpenseItem> expenseItems = expenseItemProvider.expenseItems;
    List<ExpensePayer> expensePayers = expenseItemProvider.expensePayers;
    List<ExpenseBeneficiary> expenseBeneficiaries =
        expenseItemProvider.expenseBeneficiares;
    Map<int, double> balancePerUser =
        calculateBalancePerUserFromAllExpenseItems(
            expenseItems: expenseItems,
            expensePayers: expensePayers,
            expenseBeneficiares: expenseBeneficiaries);
    Map<int, List<MapEntry<int, double>>> recommendedSettlePaymentMap =
        getSettlePayment(balancePerUser);
    List<User> usersInUserGroup =
        Provider.of<UserProvider>(context, listen: true).usersInUserGroup;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Settle Up"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(generalSubPagePadding),
        child: Column(
          children: [
            const Text("Recommended:"),
            Expanded(
                child: ListView.builder(
              itemCount: recommendedSettlePaymentMap.keys.length,
              itemBuilder: (BuildContext context, int index) {
                var mapEntryThatGetsPaid =
                    recommendedSettlePaymentMap.entries.toList()[index];
                var userIdThatGetsPaid = mapEntryThatGetsPaid.key;

                var usernameThatGetsPaid = usersInUserGroup
                    .firstWhereOrNull(
                        (user) => user.userId == userIdThatGetsPaid)
                    ?.username;

                var allPeopleThatNeedToPayForCurrentPerson =
                    mapEntryThatGetsPaid.value;

                return Column(
                  children: [
                    Text("$usernameThatGetsPaid should be paid by:"),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const ScrollPhysics(),
                      itemCount: allPeopleThatNeedToPayForCurrentPerson.length,
                      itemBuilder: (BuildContext context, int index2) {
                        final userThatNeedsToPayForCurrentPerson =
                            allPeopleThatNeedToPayForCurrentPerson[index2];
                        final usernameThatNeedsToPayForCurrentPerson =
                            usersInUserGroup
                                .firstWhere((user) =>
                                    user.userId ==
                                    userThatNeedsToPayForCurrentPerson.key)
                                .username;
                        return ListTile(
                          title: Text(usernameThatNeedsToPayForCurrentPerson),
                          trailing: Text(stringifyCentAmount(
                              userThatNeedsToPayForCurrentPerson.value.abs())),
                        );
                      },
                    ),

                    // ListView.builder(
                    //     shrinkWrap: true,
                    //     physics: const ClampingScrollPhysics(),
                    //     itemBuilder: (BuildContext context, int index2) {
                    //       var userThatNeedsToPay =
                    //           allPeopleThatNeedToPayForCurrentPerson?[
                    //               index2];
                    //       print(userThatNeedsToPay);
                    //       final String? usernameThatNeedsToPay =
                    //           usersInUserGroup
                    //               .firstWhereOrNull((user) =>
                    //                   user.userId ==
                    //                   userThatNeedsToPay?.key)
                    //               ?.username;
                    //       return ListTile(
                    //         title: Text(usernameThatNeedsToPay ?? ""),
                    //         trailing: Text(
                    //             userThatNeedsToPay?.value.toString() ??
                    //                 ""),
                    //       );
                    //     },
                    //     itemCount: allPeopleThatNeedToPayForCurrentPerson
                    //         ?.length)
                  ],
                );
              },
            ))
          ],
        ),
      ),
    );
  }
}
