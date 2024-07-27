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

  // TODO: We should just use a radio
  TaskType filterBy = TaskType.recurring;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4.0),
          child: Container(
            decoration: BoxDecoration(
                borderRadius: const BorderRadius.all(Radius.circular(10)),
                color: Colors.grey[300]),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Row(
                children: [
                  Expanded(
                      child: ElevatedButton(
                          style: ButtonStyle(
                            foregroundColor: WidgetStateProperty.all(
                                filterBy == TaskType.recurring
                                    ? Colors.white
                                    : Colors.black),
                            backgroundColor: WidgetStateProperty.all<Color>(
                                filterBy == TaskType.recurring
                                    ? Colors.deepPurple
                                    : Colors.grey.shade300),
                            textStyle: WidgetStateProperty.all<TextStyle>(
                              TextStyle(
                                fontWeight: filterBy == TaskType.recurring
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                            shape: MaterialStateProperty.all<
                                RoundedRectangleBorder>(
                              RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                          onPressed: () {
                            setState(() {
                              filterBy = TaskType.recurring;
                            });
                          },
                          child: const Text("Task Groups"))),
                  const SizedBox(width: 4),
                  Expanded(
                      child: ElevatedButton(
                          style: ButtonStyle(
                              backgroundColor:
                                  MaterialStateProperty.resolveWith<Color>(
                                (Set<MaterialState> states) {
                                  if (states.contains(MaterialState.pressed))
                                    return Colors.deepPurple.shade200;
                                  return filterBy == TaskType.oneOff
                                      ? Colors.deepPurple
                                      : Colors.grey.shade300;
                                },
                              ),
                              foregroundColor: WidgetStateProperty.all(
                                  filterBy == TaskType.oneOff
                                      ? Colors.white
                                      : Colors.black),
                              textStyle: MaterialStateProperty.all<TextStyle>(
                                TextStyle(
                                  fontWeight: filterBy == TaskType.oneOff
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                              shape: MaterialStateProperty.all<
                                  RoundedRectangleBorder>(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              )),
                          onPressed: () {
                            setState(() {
                              filterBy = TaskType.oneOff;
                            });
                          },
                          child: const Text("One-Off Tasks"))),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Expanded(
            child: filterBy == TaskType.recurring
                ? FutureBuilder<List<TaskGroup>>(
                    future: _taskGroupsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const CircularProgressIndicator();
                      } else if (snapshot.hasError) {
                        return Text(
                            "Error while fetching task groups: ${snapshot.error}");
                      } else if (snapshot.hasData && snapshot.data!.isEmpty) {
                        return const Text(
                            "No Task Groups. To get started, use the + Action Button on the bottom right.");
                      }
                      return TaskGroupList(
                          taskGroups: snapshot.data!,
                          onRefresh: () {
                            _initializeFutures();
                            setState(() {});
                          });
                    })
                : FutureBuilder<List<Task>>(
                    future: _tasksFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const CircularProgressIndicator();
                      } else if (snapshot.hasError) {
                        return SafeArea(
                            child: Text(
                                "Error while fetching tasks: ${snapshot.error}"));
                      }
                      final oneOffTasks = snapshot.data!
                          .where((task) => task.recurringTaskGroupId == null)
                          .toList();
                      if (oneOffTasks.isEmpty) {
                        return const Column(
                          children: [
                            SizedBox(
                              height: 20,
                            ),
                            Center(
                              child: Text(
                                  "No Tasks. To get started, use the + Action Button on the bottom right."),
                            ),
                          ],
                        );
                      }
                      return TaskList(
                          tasks: oneOffTasks,
                          refreshState: () {
                            _initializeFutures();
                            setState(() {});
                          });
                    }))
      ]),
    );
  }
}
