import 'package:flatshare/const.dart';
import 'package:flatshare/models/expense-tracker/expense_item.dart';
import 'package:flatshare/providers/expense_item.dart';
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
    List<ExpenseItem> expenseItems =
        Provider.of<ExpenseItemProvider>(context).expenseItems;

    return Padding(
      padding: const EdgeInsets.all(generalRootPadding),
      child: Column(
        children: [
          Expanded(
              child: ListView.builder(
                  itemCount: expenseItems.length,
                  itemBuilder: (BuildContext context, int index) {
                    var expenseItem = expenseItems[index];
                    return Card(
                        child: ListTile(
                      title: Text(expenseItem.title),
                      subtitle: Text(expenseItem.description ?? ""),
                    ));
                  }))
        ],
      ),
    );
  }
}
