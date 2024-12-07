import 'package:flatshare/const.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/task_group.dart';
import 'package:flatshare/widgets/task_type_switch.dart';
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
  TaskType filterByTaskType = TaskType.recurring;

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
        tasks.where((task) => task.taskGroupId == null).toList();
    final taskGroups = Provider.of<TaskGroupProvider>(context).taskGroups;
    return Padding(
      padding: const EdgeInsets.all(generalRootPadding),
      child: Column(children: [
        TaskTypeSwitch(
          selectedTaskType: filterByTaskType,
          onTaskTypeSelect: (taskType) {
            setState(() {
              filterByTaskType = taskType;
            });
          },
        ),
        const SizedBox(height: 20),
        Expanded(
            child: filterByTaskType == TaskType.recurring
                ? TaskGroupList(taskGroups: taskGroups)
                : TaskList(
                    tasks: oneTimeTasks,
                  ))
      ]),
    );
  }
}
