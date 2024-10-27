import 'package:flatshare/models/task.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/task_group.dart';
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
  TaskType filterBy = TaskType.recurring;

  @override
  void initState() {
    super.initState();

    Provider.of<TaskProvider>(context, listen: false).initTasks(context);
    Provider.of<TaskGroupProvider>(context, listen: false)
        .initTaskGroups(context);
  }

  @override
  Widget build(BuildContext context) {
    final tasks = Provider.of<TaskProvider>(context).tasks;
    final oneTimeTasks =
        tasks.where((task) => task.recurringTaskGroupId == null).toList();
    final taskGroups = Provider.of<TaskGroupProvider>(context).taskGroups;
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
                                    ? Colors.blueAccent
                                    : Colors.grey.shade300),
                            textStyle: WidgetStateProperty.all<TextStyle>(
                              TextStyle(
                                fontWeight: filterBy == TaskType.recurring
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                            shape: WidgetStateProperty.all(
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
                          child: const Text("Recurring Tasks"))),
                  const SizedBox(width: 4),
                  Expanded(
                      child: ElevatedButton(
                          style: ButtonStyle(
                              backgroundColor: WidgetStateProperty.all(
                                  filterBy == TaskType.oneOff
                                      ? Colors.blueAccent
                                      : Colors.grey.shade300),
                              foregroundColor: WidgetStateProperty.all(
                                  filterBy == TaskType.oneOff
                                      ? Colors.white
                                      : Colors.black),
                              textStyle: WidgetStateProperty.all<TextStyle>(
                                TextStyle(
                                  fontWeight: filterBy == TaskType.oneOff
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                              shape: WidgetStateProperty.all<
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
                          child: const Text("One-Time Tasks"))),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Expanded(
            child: filterBy == TaskType.recurring
                ? TaskGroupList(taskGroups: taskGroups)
                : TaskList(
                    tasks: oneTimeTasks,
                  ))
      ]),
    );
  }
}
