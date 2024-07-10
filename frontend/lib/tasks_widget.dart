import 'package:flutter/material.dart';
import 'package:wg_app/fetch/task_groups.dart';

class TaskGroup {
  final int id;
  final String title;
  final String? description;
  final String interval;

  TaskGroup(
      {required this.id,
      required this.title,
      this.description,
      required this.interval});

  factory TaskGroup.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'title': String title,
        'description': String description,
        'interval': String interval
      } =>
        TaskGroup(
            id: id, title: title, description: description, interval: interval),
      _ => throw const FormatException("Failed to load assignments.")
    };
  }
}

class TasksWidget extends StatefulWidget {
  const TasksWidget({super.key});

  @override
  TasksWidgetState createState() => TasksWidgetState();
}

class TasksWidgetState extends State<TasksWidget> {
  late Future<List<TaskGroup>> _taskGroupsFuture;

  @override
  void initState() {
    super.initState();
    _taskGroupsFuture = fetchTaskGroups();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<TaskGroup>>(
        future: _taskGroupsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            if (snapshot.data!.isEmpty) {
              return const SafeArea(child: Text("No taskgroups."));
            }
            return GridView.count(
                crossAxisCount: 2,
                padding: const EdgeInsets.all(8.0),
                mainAxisSpacing: 4,
                crossAxisSpacing: 4,
                children: snapshot.data!.map((taskGroup) {
                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(13),
                    ),
                    elevation: 8,
                    child: ListTile(
                      title: Text(taskGroup.title),
                      subtitle: Text(taskGroup.description!),
                    ),
                  );
                }).toList());
          }
          return const CircularProgressIndicator();
        });
  }
}
