import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/widgets/screens/edit_task_group.dart';
import 'package:flutter/material.dart';

// TODO: We should probably fix that our backend doesn't return the pg interval type formatted
// like this in the case of month
String formatInterval(String interval) {
  if (interval.contains("mon")) {
    return interval.replaceAll("mon", "month");
  }
  return interval;
}

class TaskGroupList extends StatelessWidget {
  final VoidCallback onRefresh;
  final List<TaskGroup> taskGroups;

  const TaskGroupList(
      {super.key, required this.taskGroups, required this.onRefresh});

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
                showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        title: const Text("Are you sure?"),
                        content: const Text(
                            "Are you really sure you want to delete this task group? This will also delete all tasks attached to this task group, and all assignments attached to these tasks."),
                        actions: [
                          TextButton(
                              onPressed: () async {
                                Navigator.of(context).pop();
                              },
                              child: const Text("Abort")),
                          TextButton(
                              onPressed: () async {
                                try {
                                  await deleteTaskGroup(
                                      taskGroupId: taskGroup.id);
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
                      Text(taskGroup.title,
                          style: Theme.of(context).textTheme.titleMedium),
                      Text(taskGroup.description!),
                      Text("Total tasks: ${taskGroup.numberOfTasks}"),
                      Row(
                        children: [
                          const Icon(Icons.repeat),
                          Text("Every ${formatInterval(taskGroup.interval)}")
                        ],
                      )
                    ],
                  ),
                ),
              )));
        });
  }
}
