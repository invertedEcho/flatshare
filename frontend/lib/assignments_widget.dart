import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/assignments.dart';
import 'package:wg_app/login_form.dart';
import 'package:wg_app/user_provider.dart';
import 'package:wg_app/utils/date.dart';
import "package:collection/collection.dart";

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
  final int? taskGroupId;
  final String? taskGroupTitle;

  Assignment({
    required this.id,
    required this.title,
    required this.assigneeId,
    required this.assigneeName,
    required this.createdAt,
    required this.isOneOff,
    required this.isCompleted,
    this.taskGroupId,
    this.taskGroupTitle,
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
      taskGroupId: json['taskGroupId'] as int?,
      taskGroupTitle: json['taskGroupTitle'] as String?,
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
    _assignmentsFuture = Future.value([]);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    AuthResponse? user = userProvider.user;
    final groupId = user?.groupId;

    if (groupId != null) {
      _assignmentsFuture = fetchAssignments(groupId: groupId);
    }
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
    final theme = Theme.of(context);
    return FutureBuilder<List<Assignment>>(
        future: _assignmentsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            if (snapshot.data!.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text("No assignments."),
              );
            }
            var groupedAssignments = groupBy(
                snapshot.data!, (assignment) => assignment.taskGroupTitle);

            return ListView.builder(
              itemCount: groupedAssignments.length,
              itemBuilder: (BuildContext context, int index) {
                final section = groupedAssignments.entries.elementAt(index);
                final sectionTitle = section.key;
                final sectionAssignments = section.value;

                return Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(sectionTitle ?? 'One-off tasks',
                              style: theme.textTheme.titleLarge),
                          const SizedBox(width: 8),
                          Icon(Icons.arrow_right_alt, color: theme.hintColor),
                          const SizedBox(width: 8),
                          Text(sectionAssignments[0].assigneeName,
                              style: theme.textTheme.titleLarge!.merge(
                                  const TextStyle(color: Colors.blueAccent)))
                        ],
                      ),
                      const SizedBox(height: 8),
                      ListView.builder(
                          shrinkWrap: true,
                          physics: const ClampingScrollPhysics(),
                          itemCount: sectionAssignments.length,
                          itemBuilder: (BuildContext context, int index) {
                            final assignment = sectionAssignments[index];
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
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onSurface,
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
                          })
                    ],
                  ),
                );
              },
            );
          } else if (snapshot.hasError) {
            return SafeArea(
              child: Text('${snapshot.error}'),
            );
          }
          return const CircularProgressIndicator();
        });
  }
}
