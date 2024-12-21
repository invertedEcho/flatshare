import 'package:flatshare/const.dart';
import 'package:flatshare/fetch/assignment.dart';
import 'package:flatshare/models/assignment.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/date.dart';
import 'package:flatshare/widgets/assignments/utils.dart';
import 'package:flatshare/widgets/task_type_switch.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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

    _assignmentsFuture = fetchAssignments(userGroupId: groupId);
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
                      List<List<Assignment>> sortedAssignmentGroups = [];

                      if (filterByTaskType == TaskType.recurring) {
                        final recurringAssignments =
                            snapshot.data!.where((assignment) {
                          return assignment.taskGroupTitle != null;
                        }).toList();
                        sortedAssignmentGroups = sortRecurringAssignmentGroups(
                            groupRecurringAssignments(recurringAssignments));
                      } else if (filterByTaskType == TaskType.oneOff) {
                        final oneOffAssignments =
                            snapshot.data!.where((assignment) {
                          return assignment.taskGroupTitle == null;
                        }).toList();
                        // we dont have due dates yet for one off tasks, so only grouping here
                        sortedAssignmentGroups =
                            groupOneOffAssignments(oneOffAssignments);
                      }

                      final filteredAssignments = filterGroupedAssignments(
                          sortedAssignmentGroups,
                          showOnlyCurrentUserAssignments,
                          currentUserId);

                      return ListView.builder(
                        itemCount: filteredAssignments.length,
                        itemBuilder: (BuildContext context, int index) {
                          final sectionAssignments = filteredAssignments[index];
                          final sectionTitle =
                              sectionAssignments[0].taskGroupTitle == null
                                  ? sectionAssignments[0].assigneeName
                                  : sectionAssignments[0].taskGroupTitle!;

                          // for now, we can just pick the first assginment because they are gouped together and all have the same due date.
                          final firstAssignmentDueDate =
                              sectionAssignments[0].dueDate;
                          final maybeParsedDueDate =
                              firstAssignmentDueDate != null
                                  ? parseToDueDate(firstAssignmentDueDate)
                                  : "";

                          final isRecurringAssignments = sectionAssignments
                              .any((assignment) => !assignment.isOneOff);

                          return Container(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 0, vertical: 4),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                                color: theme.brightness == Brightness.light
                                    ? Colors.grey.shade100
                                    : Colors.black26,
                                borderRadius:
                                    const BorderRadius.all(Radius.circular(8))),
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Padding(
                                          padding: EdgeInsets.symmetric(
                                              horizontal: isRecurringAssignments
                                                  ? 4
                                                  : 0,
                                              vertical: 0),
                                          child: Text(
                                              isRecurringAssignments
                                                  ? sectionTitle
                                                  : "",
                                              style:
                                                  theme.textTheme.titleLarge)),
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
                                  SizedBox(
                                      height: isRecurringAssignments
                                          ? generalSizedBoxHeight / 4
                                          : 0),
                                  isRecurringAssignments
                                      ? Padding(
                                          padding: EdgeInsets.symmetric(
                                              vertical: 0,
                                              horizontal: isRecurringAssignments
                                                  ? 4
                                                  : 0),
                                          child: Text(maybeParsedDueDate),
                                        )
                                      : const SizedBox(
                                          width: 0,
                                          height: 0,
                                        ),
                                  SizedBox(
                                      height: isRecurringAssignments
                                          ? generalSizedBoxHeight / 2
                                          : 0),
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
                                              await updateAssignment(
                                                  assignment);
                                            },
                                            title: Text(assignment.title),
                                            subtitle: Text(description ?? ""),
                                            trailing: Checkbox(
                                              onChanged: (bool? value) =>
                                                  updateAssignment(assignment),
                                              value: assignment.isCompleted,
                                            ),
                                          ),
                                        );
                                      }),
                                ]),
                          );
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
