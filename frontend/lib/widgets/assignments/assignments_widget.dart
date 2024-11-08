import 'package:flatshare/const.dart';
import 'package:flatshare/fetch/assignment.dart';
import 'package:flatshare/models/assignment.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/date.dart';
import 'package:flatshare/widgets/task_type_switch.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import "package:collection/collection.dart";

class AssignmentsWidget extends StatefulWidget {
  const AssignmentsWidget({super.key});

  @override
  AssignmentsWidgetState createState() => AssignmentsWidgetState();
}

class AssignmentsWidgetState extends State<AssignmentsWidget> {
  late Future<List<Assignment>> _assignmentsFuture;
  TaskType filterByTaskType = TaskType.recurring;
  bool showOnlyCurrentUserAssignments = true;
  int? currentUserId;

  // TODO: we should not do async operations in this method, as it could cause unneccessary rebuilds
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    currentUserId = userProvider.user?.userId;
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
      await updateAssignmentState(assignment.id, !assignment.isCompleted);
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
    return Padding(
      padding: const EdgeInsets.all(generalRootPadding),
      child: Column(
        children: [
          TaskTypeSwitch(
            selectedTaskType: filterByTaskType,
            onTaskTypeSelect: (taskType) {
              setState(() {
                filterByTaskType = taskType;
              });
            },
          ),
          ListTile(
              title: const Text("Show only my assignments"),
              onTap: () {
                setState(() {
                  showOnlyCurrentUserAssignments =
                      !showOnlyCurrentUserAssignments;
                });
              },
              splashColor: Colors.transparent,
              trailing: SizedBox(
                  height: 24,
                  width: 24,
                  child: Checkbox(
                      activeColor: Colors.blueAccent,
                      value: showOnlyCurrentUserAssignments,
                      onChanged: (newValue) {
                        setState(() {
                          showOnlyCurrentUserAssignments = newValue ?? false;
                        });
                      }))),
          const SizedBox(
            height: 10,
          ),
          Expanded(
              child: FutureBuilder<List<Assignment>>(
                  future: _assignmentsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      if (snapshot.data!.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Text(
                              "Currently, there are no assignments. To get started, use the + Action Button on the bottom right."),
                        );
                      }
                      Map<String, List<Assignment>> groupedAssignments = {};

                      if (filterByTaskType == TaskType.recurring) {
                        // print(snapshot.data);
                        final filteredAssignments = snapshot.data!.where(
                            (assignment) =>
                                assignment.taskGroupTitle != null &&
                                (!showOnlyCurrentUserAssignments ||
                                    assignment.assigneeId == currentUserId));
                        groupedAssignments = groupBy(filteredAssignments,
                            (assignment) => assignment.taskGroupTitle!);
                      } else if (filterByTaskType == TaskType.oneOff) {
                        final filteredAssignments = snapshot.data!.where(
                            (assignment) =>
                                assignment.taskGroupTitle == null &&
                                (!showOnlyCurrentUserAssignments ||
                                    assignment.assigneeId == currentUserId));
                        groupedAssignments = groupBy(filteredAssignments,
                            (assignment) => assignment.assigneeName);
                      }

                      return ListView.builder(
                        itemCount: groupedAssignments.length,
                        itemBuilder: (BuildContext context, int index) {
                          final section =
                              groupedAssignments.entries.elementAt(index);
                          final sectionTitle = section.key;
                          final sectionAssignments = section.value;

                          // TODO: i dont like this.
                          final isRecurringAssignments = sectionAssignments.any(
                              (assignment) =>
                                  assignment.taskGroupTitle != null);

                          return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Padding(
                                        padding: EdgeInsets.symmetric(
                                            horizontal:
                                                isRecurringAssignments ? 4 : 0,
                                            vertical: 0),
                                        child: Text(
                                            isRecurringAssignments
                                                ? sectionTitle
                                                : "",
                                            style: theme.textTheme.titleLarge)),
                                    Row(
                                        children: isRecurringAssignments
                                            ? const [
                                                SizedBox(width: 8),
                                                Icon(
                                                  Icons.arrow_right_alt,
                                                )
                                              ]
                                            : []),
                                    const SizedBox(width: 8),
                                    Text(sectionAssignments[0].assigneeName,
                                        style: theme.textTheme.titleLarge!
                                            .merge(const TextStyle(
                                                color: Colors.blueAccent)))
                                  ],
                                ),
                                const SizedBox(height: generalSizedBoxHeight),
                                ListView.builder(
                                    shrinkWrap: true,
                                    physics: const ClampingScrollPhysics(),
                                    itemCount: sectionAssignments.length,
                                    itemBuilder:
                                        (BuildContext context, int index) {
                                      final assignment =
                                          sectionAssignments[index];
                                      final description =
                                          assignment.description;

                                      return Card(
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(13),
                                        ),
                                        elevation: generalElevation,
                                        shadowColor: Colors.black,
                                        child: ListTile(
                                          onTap: () async {
                                            await updateAssignment(assignment);
                                          },
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
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: <Widget>[
                                              if (description != null)
                                                Text(description),
                                              if (assignment.dueDate != null)
                                                Text(parseToDueDate(
                                                    assignment.dueDate!)),
                                            ],
                                          ),
                                          trailing: Checkbox(
                                            activeColor: Colors.blueAccent,
                                            onChanged: (bool? value) =>
                                                updateAssignment(assignment),
                                            value: assignment.isCompleted,
                                          ),
                                        ),
                                      );
                                    }),
                                const SizedBox(
                                  height: generalSizedBoxHeight,
                                )
                              ]);
                        },
                      );
                    } else if (snapshot.hasError) {
                      return SafeArea(
                        child: Text('${snapshot.error}'),
                      );
                    }
                    return const Center(child: CircularProgressIndicator());
                  }))
        ],
      ),
    );
  }
}
