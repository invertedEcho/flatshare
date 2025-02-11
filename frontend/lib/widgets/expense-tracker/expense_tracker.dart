import 'package:flatshare/const.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/expense-tracker/expense_beneficiary.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/models/expense-tracker/expense_payer.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/expense_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/widgets/expense-tracker/expense_item_list.dart';
import 'package:flatshare/widgets/expense-tracker/expense_tracker_overview.dart';
import 'package:flatshare/widgets/expense-tracker/page_switch.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

enum PageType { overview, list }

class ExpenseTrackerWidget extends StatefulWidget {
  const ExpenseTrackerWidget({super.key});

  @override
  State<StatefulWidget> createState() => ExpenseTrackerWidgetState();
}

class ExpenseTrackerWidgetState extends State<ExpenseTrackerWidget> {
  // TODO: get rid of this by storing them in a provider too
  List<User> usersInUserGroup = [];
  PageType selectedPage = PageType.overview;

  @override
  void initState() {
    super.initState();
    Provider.of<ExpenseItemProvider>(context, listen: false)
        .initExpenseItems(context);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final userGroupId = userGroup?.id;

    if (userGroupId != null) {
      fetchUsersInUserGroup(userGroupId: userGroupId).then((result) {
        setState(() {
          usersInUserGroup = result;
        });
      });
    } else {
      print("WARNING: userGroupId was null, not fetching users in usergroup");
    }
  }

  @override
  Widget build(BuildContext context) {
    List<ExpenseItem> expenseItems =
        Provider.of<ExpenseItemProvider>(context, listen: true).expenseItems;
    List<ExpensePayer> expensePayers =
        Provider.of<ExpenseItemProvider>(context, listen: true).expensePayers;
    List<ExpenseBeneficiary> expenseBeneficiares =
        Provider.of<ExpenseItemProvider>(context, listen: true)
            .expenseBeneficiares;

    return Padding(
      padding: const EdgeInsets.all(generalRootPadding),
      child: Column(
        children: [
          PageSwitch(
            selectedPage: selectedPage,
            onPageSelect: (PageType pageType) {
              setState(() {
                selectedPage = pageType;
              });
            },
          ),
          selectedPage == PageType.overview
              ? ExpenseTrackerOverview(
                  expenseItems: expenseItems,
                  expensePayers: expensePayers,
                  expenseBeneficiaries: expenseBeneficiares,
                  usersInUserGroup: usersInUserGroup,
                )
              : ExpenseItemList(
                  expenseItems: expenseItems,
                  expensePayers: expensePayers,
                  expenseBeneficiaries: expenseBeneficiares,
                  usersInUserGroup: usersInUserGroup)
        ],
      ),
    );
  }
}
