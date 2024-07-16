import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/assignment.dart';
import 'package:wg_app/models/assignment.dart';
import 'package:wg_app/models/user_group.dart';
import 'package:wg_app/providers/user.dart';
import 'package:wg_app/utils/date.dart';
import "package:collection/collection.dart";

class AssignmentsWidget extends StatefulWidget {
  const AssignmentsWidget({super.key});

  @override
  AssignmentsWidgetState createState() => AssignmentsWidgetState();
}

class AssignmentsWidgetState extends State<AssignmentsWidget> {
  late Future<List<Assignment>> _assignmentsFuture;

  // TODO: we should not do async operations in this method, as it could cause unneccessary rebuilds
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final groupId = userGroup?.id;

    if (groupId == null) {
      throw Exception("userGroupId is null.");
    }

    _assignmentsFuture = fetchAssignments(groupId: groupId);
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
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(sectionTitle ?? 'One-off Tasks',
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
