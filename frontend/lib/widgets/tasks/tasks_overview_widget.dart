import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/task.dart';
import 'package:wg_app/fetch/task_group.dart';
import 'package:wg_app/models/task.dart';
import 'package:wg_app/models/task_group.dart';
import 'package:wg_app/models/user_group.dart';
import 'package:wg_app/providers/user.dart';
import 'package:wg_app/widgets/tasks/task_group_list.dart';
import 'package:wg_app/widgets/tasks/task_list.dart';

class TasksOverviewWidget extends StatefulWidget {
  const TasksOverviewWidget({super.key});

  @override
  TasksOverviewWidgetState createState() => TasksOverviewWidgetState();
}

class TasksOverviewWidgetState extends State<TasksOverviewWidget> {
  late Future<List<TaskGroup>> _taskGroupsFuture;
  late Future<List<Task>> _tasksFuture;

  // TODO: we should not do async operations in this method, as it could cause unneccessary rebuilds
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
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
                SafeArea(
                    child: Text(
                        "Eror while fetching task groups: ${snapshot.error}"));
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
        FutureBuilder(
            future: _tasksFuture,
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                if (snapshot.data!.isEmpty) {
                  return const SafeArea(
                      child: Text(
                          "No Tasks. To get started, use the + Action Button on the bottom right."));
                }
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
                        tasks: snapshot.data!,
                      )
                    ]);
              }
              return const CircularProgressIndicator();
            })
      ]),
    );
  }
}
