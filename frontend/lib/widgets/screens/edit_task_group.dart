import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/widgets/tasks/task_list.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class EditTaskGroupScreen extends StatefulWidget {
  final TaskGroup taskGroup;
  const EditTaskGroupScreen({super.key, required this.taskGroup});

  @override
  EditTaskGroupScreenState createState() => EditTaskGroupScreenState();
}

class EditTaskGroupScreenState extends State<EditTaskGroupScreen> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final tasks = Provider.of<TaskProvider>(context, listen: false).tasks;
    final currentTaskGroupTasks =
        tasks.where((task) => task.taskGroupId == widget.taskGroup.id).toList();

    return Scaffold(
      appBar: AppBar(title: const Text("Tasks:")),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: TaskList(tasks: currentTaskGroupTasks),
      ),
    );
  }
}
