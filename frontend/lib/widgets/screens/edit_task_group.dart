import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/widgets/tasks/task_list.dart';
import 'package:flutter/material.dart';

class EditTaskGroupScreen extends StatefulWidget {
  final VoidCallback onRefresh;
  final TaskGroup taskGroup;
  const EditTaskGroupScreen(
      {super.key, required this.taskGroup, required this.onRefresh});

  @override
  EditTaskGroupScreenState createState() => EditTaskGroupScreenState();
}

class EditTaskGroupScreenState extends State<EditTaskGroupScreen> {
  late Future<List<Task>> _tasksFuture;

  @override
  void initState() {
    super.initState();
    _initializeFutures();
  }

  void _initializeFutures() {
    _tasksFuture = fetchTasksForTaskGroup(taskGroupId: widget.taskGroup.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Tasks:")),
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
                          "No tasks inside this task group. To create some tasks, go back to the previous screen and use the + Action Button on the bottom right."));
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TaskList(
                      tasks: snapshot.data!,
                      refreshState: () {
                        widget.onRefresh();
                        _initializeFutures();
                        setState(() {});
                      },
                    )
                  ],
                );
              }),
        ]),
      ),
    );
  }
}
