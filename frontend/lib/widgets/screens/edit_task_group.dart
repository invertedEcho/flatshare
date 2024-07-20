import 'package:flutter/material.dart';
import 'package:wg_app/fetch/task_group.dart';
import 'package:wg_app/models/task.dart';
import 'package:wg_app/widgets/tasks/task_list.dart';

class EditTaskGroupScreen extends StatefulWidget {
  final int taskGroupId;
  const EditTaskGroupScreen({super.key, required this.taskGroupId});

  @override
  EditTaskGroupScreenState createState() => EditTaskGroupScreenState();
}

class EditTaskGroupScreenState extends State<EditTaskGroupScreen> {
  late Future<List<Task>> _tasksFuture;

  // TODO: we should not do async operations in this method, as it could cause unneccessary rebuilds
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _tasksFuture = fetchTasksForTaskGroup(taskGroupId: widget.taskGroupId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Edit task group")),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          FutureBuilder<List<Task>>(
              future: _tasksFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const CircularProgressIndicator();
                } else if (snapshot.hasError) {
                  SafeArea(
                      child:
                          Text("Eror while fetching tasks: ${snapshot.error}"));
                } else if (snapshot.hasData && snapshot.data!.isEmpty) {
                  return const SafeArea(
                      child: Text(
                          "No tasks inside this task group. To create some tasks, use the + Action Button on the bottom right."));
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Tasks in task group",
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TaskList(tasks: snapshot.data!)
                  ],
                );
              }),
        ]),
      ),
    );
  }
}
