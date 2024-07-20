import 'package:flatshare/models/task.dart';
import 'package:flutter/material.dart';

class TaskList extends StatelessWidget {
  final List<Task> tasks;

  const TaskList({super.key, required this.tasks});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        shrinkWrap:
            true, // TODO: Get rid of this, thereotically this ListView won't have much data, but its still not recommended for performance reasons.
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          final task = tasks[index];
          return Card(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15.0)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.title,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(task.description!)
                ],
              ),
            ),
          );
        });
  }
}
