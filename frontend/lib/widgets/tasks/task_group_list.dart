import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/widgets/screens/edit_task_group.dart';
import 'package:flutter/material.dart';

String formatPostgresInterval(String interval) {
  switch (interval) {
    case '1 day':
      return 'Every day';
    case '7 days':
      return "Every week";
    case '1 mon':
      return "Every month";
    default:
      return interval;
  }
}

class TaskGroupList extends StatelessWidget {
  final VoidCallback onRefresh;
  final List<TaskGroup> taskGroups;

  const TaskGroupList(
      {super.key, required this.taskGroups, required this.onRefresh});

  void handleOnDismissed(
      {required BuildContext context, required int taskGroupId}) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text("Are you sure?"),
            content: const Text(
                "Are you really sure you want to delete all tasks with this interval? This will also delete all assignments attached to these tasks."),
            actions: [
              TextButton(
                  onPressed: () async {
                    Navigator.of(context).pop();
                    onRefresh();
                  },
                  child: const Text("Abort")),
              TextButton(
                  onPressed: () async {
                    try {
                      await deleteTaskGroup(taskGroupId: taskGroupId);
                    } catch (error) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('$error')),
                      );
                    }
                    Navigator.of(context).pop();
                  },
                  child: const Text("Confirm"))
            ],
          );
        });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        shrinkWrap:
            true, // TODO: Get rid of this, thereotically this ListView won't have much data, but its still not recommended for performance reasons.
        itemCount: taskGroups.length,
        itemBuilder: (context, index) {
          final taskGroup = taskGroups[index];
          return Dismissible(
              key: Key(taskGroup.id.toString()),
              direction: DismissDirection.endToStart,
              onDismissed: (direction) {
                handleOnDismissed(context: context, taskGroupId: taskGroup.id);
              },
              background: Container(
                  decoration: const BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.all(Radius.circular(15))),
                  padding: const EdgeInsets.all(16),
                  child: const Align(
                    alignment: Alignment.centerRight,
                    child: Icon(
                      Icons.delete,
                      color: Colors.black,
                    ),
                  )),
              child: Card(
                  child: InkWell(
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => EditTaskGroupScreen(
                          taskGroup: taskGroup, onRefresh: onRefresh)));
                },
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.repeat),
                          Text(formatPostgresInterval(taskGroup.interval),
                              style: Theme.of(context).textTheme.titleMedium),
                        ],
                      ),
                      Text(taskGroup.description ?? ""),
                      Text("Total tasks: ${taskGroup.numberOfTasks}"),
                    ],
                  ),
                ),
              )));
        });
  }
}
