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
  final List<TaskGroup> taskGroups;

  const TaskGroupList({super.key, required this.taskGroups});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        shrinkWrap:
            true, // TODO: Get rid of this, thereotically this ListView won't have much data, but its still not recommended for performance reasons.
        itemCount: taskGroups.length,
        itemBuilder: (context, index) {
          final taskGroup = taskGroups[index];
          return Card(
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
          ));
        });
  }
}
