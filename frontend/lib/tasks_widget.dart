import 'package:flutter/material.dart';
import 'package:wg_app/models/task_group.dart';
import 'package:wg_app/widgets/task_group_list.dart';
import 'package:wg_app/widgets/task_list.dart';

import 'fetch/tasks.dart';
import 'fetch/task_groups.dart';
import 'models/task.dart';

class TasksWidget extends StatefulWidget {
  const TasksWidget({super.key});

  @override
  TasksWidgetState createState() => TasksWidgetState();
}

class TasksWidgetState extends State<TasksWidget> {
  late Future<List<TaskGroup>> _taskGroupsFuture;
  late Future<List<Task>> _tasksFuture;

  @override
  void initState() {
    super.initState();
    _taskGroupsFuture = fetchTaskGroups();
    _tasksFuture = fetchTasks(4);
  }

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      FutureBuilder<List<TaskGroup>>(
          future: _taskGroupsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const CircularProgressIndicator();
            } else if (snapshot.hasError) {
              SafeArea(
                  child: Text(
                      "Eror while fetching task groups: ${snapshot.error}"));
            } else if (snapshot.hasData && snapshot.data!.isEmpty) {
              return const SafeArea(child: Text("No taskgroups."));
            }
            return Column(
              children: [
                Text(
                  "Task Groups:",
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const Divider(),
                TaskGroupList(taskGroups: snapshot.data!),
              ],
            );
          }),
      FutureBuilder(
          future: _tasksFuture,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              if (snapshot.data!.isEmpty) {
                return const SafeArea(child: Text("No tasks."));
              }
              return Column(children: [
                Text(
                  "One-off Tasks:",
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const Divider(),
                TaskList(
                  tasks: snapshot.data!,
                )
              ]);
            }
            return const CircularProgressIndicator();
          })
    ]);
  }
}
