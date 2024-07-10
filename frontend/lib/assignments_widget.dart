import 'package:flutter/material.dart';
import 'package:wg_app/fetch/assignments.dart';
import 'package:wg_app/utils/date.dart';

class Assignment {
  final int id;
  final String title;
  final int assigneeId;
  final String assigneeName;
  final DateTime createdAt;
  final bool isOneOff;
  bool isCompleted;
  final String? description;
  final DateTime? dueDate;

  Assignment({
    required this.id,
    required this.title,
    required this.assigneeId,
    required this.assigneeName,
    required this.createdAt,
    required this.isOneOff,
    required this.isCompleted,
    this.description,
    this.dueDate,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return Assignment(
      id: json['id'] as int,
      title: json['title'] as String,
      isCompleted: json['isCompleted'] as bool,
      assigneeId: json['assigneeId'] as int,
      assigneeName: json['assigneeName'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isOneOff: json['isOneOff'] as bool,
      description: json['description'] as String?,
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : null,
    );
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
                padding: const EdgeInsets.all(8.0),
                itemCount: snapshot.data!.length,
                itemBuilder: (BuildContext context, int index) {
                  final assignment = snapshot.data![index];
                  final description = assignment.description;

                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(13),
                    ),
                    elevation: 1,
                    shadowColor: Colors.black,
                    child: ListTile(
                      title: Row(
                        children: [
                          Text(assignment.title),
                          const SizedBox(width: 8),
                          if (!assignment.isOneOff)
                            Icon(Icons.repeat,
                                color: Theme.of(context).colorScheme.onSurface,
                                size: 16)
                        ],
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          if (description != null) Text(description),
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
