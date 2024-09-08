import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/widgets/tasks/task_list.dart';
import 'package:flutter/material.dart';

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
    return Scaffold(
      appBar: AppBar(title: const Text("Tasks:")),
      body: const Padding(
        padding: EdgeInsets.all(8.0),
        child: TaskList(),
      ),
    );
  }
}
