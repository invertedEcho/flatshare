import 'package:flutter/material.dart';
import 'package:wg_app/fetch/assignments.dart';
import 'package:wg_app/utils/date.dart';

class Assignment {
  final int id;
  final String title;
  final String description;
  final DateTime? dueDate;
  bool isCompleted;

  Assignment(
      {required this.id,
      required this.title,
      required this.description,
      this.dueDate,
      required this.isCompleted});

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'title': String title,
        'description': String description,
        // TODO: Is this right?
        'dueDate': dynamic dueDateStr,
        'isCompleted': bool isCompleted
      } =>
        Assignment(
            id: id,
            title: title,
            description: description,
            dueDate: dueDateStr == null
                ? null
                // TODO: feels weird
                : DateTime.parse(dueDateStr.toString()),
            isCompleted: isCompleted),
      _ => throw const FormatException("Failed to load assignments.")
    };
  }
}

class AssignmentsWidget extends StatefulWidget {
  const AssignmentsWidget({super.key});

  @override
  AssignmentsWidgetState createState() => AssignmentsWidgetState();
}

class AssignmentsWidgetState extends State<AssignmentsWidget> {
  late Future<List<Assignment>> _assignmentsFuture;

  @override
  void initState() {
    super.initState();
    _assignmentsFuture = fetchAssignments();
  }

  Future<void> updateAssignment(Assignment assignment) async {
    setState(() {
      assignment.isCompleted = !assignment.isCompleted;
    });

    try {
      updateAssignmentState(assignment.id, !assignment.isCompleted);
    } catch (error) {
      setState(() {
        assignment.isCompleted = !assignment.isCompleted;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update assignment: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Assignment>>(
        future: _assignmentsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            if (snapshot.data!.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text("No assigments."),
              );
            }
            return ListView.builder(
                itemCount: snapshot.data!.length,
                itemBuilder: (BuildContext context, int index) {
                  final assignment = snapshot.data![index];

                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(13),
                    ),
                    elevation: 1,
                    shadowColor: Colors.black,
                    child: ListTile(
                      title: Text(assignment.title),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(assignment.description),
                          if (assignment.dueDate != null)
                            Text(parseToDueDate(assignment.dueDate!)),
                        ],
                      ),
                      trailing: Checkbox(
                        onChanged: (bool? value) =>
                            updateAssignment(assignment),
                        value: assignment.isCompleted,
                      ),
                    ),
                  );
                });
          } else if (snapshot.hasError) {
            return SafeArea(
              child: Text('${snapshot.error}'),
            );
          }
          return const CircularProgressIndicator();
        });
  }
}
