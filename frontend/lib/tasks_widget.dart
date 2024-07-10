import 'package:flutter/material.dart';
import 'package:wg_app/fetch/task_groups.dart';

class TaskGroup {
  final int id;
  final String title;
  final String? description;
  final String interval;
  final int numberOfTasks;

  TaskGroup(
      {required this.id,
      required this.title,
      this.description,
      required this.interval,
      required this.numberOfTasks});

  factory TaskGroup.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'title': String title,
        'description': String description,
        'interval': String interval,
        'numberOfTasks': int numberOfTasks
      } =>
        TaskGroup(
            id: id,
            title: title,
            description: description,
            interval: interval,
            numberOfTasks: numberOfTasks),
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
            print(snapshot.data);
            if (snapshot.data!.isEmpty) {
              return const SafeArea(child: Text("No taskgroups."));
            }
            return Column(
              children: [
                Text(
                  "Task Groups:",
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const Divider(),
                GridView.count(
                    crossAxisCount: 2,
                    padding: const EdgeInsets.all(8.0),
                    mainAxisSpacing: 4,
                    crossAxisSpacing: 4,
                    scrollDirection: Axis.vertical,
                    shrinkWrap: true,
                    children: snapshot.data!.map((taskGroup) {
                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(13),
                        ),
                        color: Colors.blueAccent,
                        elevation: 8,
                        child: ListTile(
                          title: Text(taskGroup.title,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.titleMedium),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Each ${taskGroup.interval}"),
                              Text("Total tasks: ${taskGroup.numberOfTasks}")
                            ],
                          ),
                        ),
                      );
                    }).toList())
              ],
            );
          } else if (snapshot.hasError) {
            SafeArea(
                child:
                    Text("Eror while fetching task groups: ${snapshot.error}"));
          }
          print(snapshot);
          return const CircularProgressIndicator();
        });
  }
}
