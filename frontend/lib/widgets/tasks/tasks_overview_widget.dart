import 'package:flatshare/fetch/task.dart';
import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/widgets/tasks/task_group_list.dart';
import 'package:flatshare/widgets/tasks/task_list.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class TasksOverviewWidget extends StatefulWidget {
  const TasksOverviewWidget({super.key});

  @override
  TasksOverviewWidgetState createState() => TasksOverviewWidgetState();
}

class TasksOverviewWidgetState extends State<TasksOverviewWidget> {
  late Future<List<TaskGroup>> _taskGroupsFuture;
  late Future<List<Task>> _tasksFuture;

  @override
  void initState() {
    super.initState();
    _initializeFutures();
  }

  void _initializeFutures() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final groupId = userGroup?.id;

    if (groupId != null) {
      _taskGroupsFuture = fetchTaskGroups(userGroupId: groupId);
      _tasksFuture = fetchTasks(groupId: groupId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        FutureBuilder<List<TaskGroup>>(
            future: _taskGroupsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const CircularProgressIndicator();
              } else if (snapshot.hasError) {
                return SafeArea(
                    child: Text(
                        "Error while fetching task groups: ${snapshot.error}"));
              } else if (snapshot.hasData && snapshot.data!.isEmpty) {
                return const SafeArea(
                    child: Text(
                        "No Task Groups. To get started, use the + Action Button on the bottom right."));
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Task Groups:",
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  TaskGroupList(taskGroups: snapshot.data!),
                ],
              );
            }),
        FutureBuilder<List<Task>>(
            future: _tasksFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const CircularProgressIndicator();
              } else if (snapshot.hasError) {
                return SafeArea(
                    child:
                        Text("Error while fetching tasks: ${snapshot.error}"));
              } else if (snapshot.hasData && snapshot.data!.isEmpty) {
                return const SafeArea(
                    child: Text(
                        "No Tasks. To get started, use the + Action Button on the bottom right."));
              }
              final oneOffTasks = snapshot.data!
                  .where((task) => task.recurringTaskGroupId == null)
                  .toList();
              return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(
                      height: 20,
                    ),
                    Text(
                      "One-off Tasks:",
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TaskList(
                        tasks: oneOffTasks,
                        refreshState: () {
                          _initializeFutures();
                          setState(() {});
                        }),
                  ]);
            })
      ]),
    );
  }
}
