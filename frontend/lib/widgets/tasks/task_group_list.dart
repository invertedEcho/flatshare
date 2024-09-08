import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/task_group.dart';
import 'package:flatshare/widgets/screens/edit_task_group.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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
  const TaskGroupList({super.key});

  void handleOnDismissed({required int taskGroupId}) async {
    await deleteTaskGroup(taskGroupId: taskGroupId);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TaskGroupProvider>(
        builder: (context, taskGroupProvider, child) {
      if (taskGroupProvider.taskGroups.isEmpty) {
        return const Center(child: Text("No task groups found."));
      }
      return ListView.builder(
          itemCount: taskGroupProvider.taskGroups.length,
          itemBuilder: (context, index) {
            final taskGroup = taskGroupProvider.taskGroups[index];

            // Feels stupid to get all tasks just to get the count of tasks in the current task group
            final tasks = Provider.of<TaskProvider>(context).tasks;
            final tasksInTaskGroup = tasks
                .where((task) => task.recurringTaskGroupId == taskGroup.id);
            final countOfTasksInTaskGroup = tasksInTaskGroup.length;
            return Dismissible(
                key: Key(taskGroup.id.toString()),
                direction: DismissDirection.endToStart,
                onDismissed: (direction) {
                  handleOnDismissed(taskGroupId: taskGroup.id);
                },
                confirmDismiss: (DismissDirection direction) async {
                  return await showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text("Are you sure?"),
                          content: const Text(
                              "Are you really sure you want to delete all tasks with this interval? This will also delete all assignments attached to these tasks."),
                          actions: [
                            TextButton(
                                onPressed: () async {
                                  Navigator.of(context).pop(false);
                                },
                                child: const Text("Abort")),
                            TextButton(
                                onPressed: () async {
                                  Navigator.of(context).pop(true);
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
                        builder: (context) =>
                            EditTaskGroupScreen(taskGroup: taskGroup)));
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
                        Text("Total tasks: $countOfTasksInTaskGroup"),
                      ],
                    ),
                  ),
                )));
          });
    });
  }
}
