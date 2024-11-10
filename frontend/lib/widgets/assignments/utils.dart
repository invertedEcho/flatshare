import 'package:flatshare/models/assignment.dart';

// we should make these generic once we reach a third duplication here

List<List<Assignment>> groupRecurringAssignments(
    List<Assignment> recurringAssignments) {
  List<List<Assignment>> sortedAndGroupedAssignments = [];
  for (final assignment in recurringAssignments) {
    final maybeIndex =
        sortedAndGroupedAssignments.indexWhere((assignmentGroup) {
      final firstAssignmentInGroup = assignmentGroup[0];
      final taskGroupTitle = firstAssignmentInGroup.taskGroupTitle;
      return taskGroupTitle == assignment.taskGroupTitle;
    });
    if (maybeIndex == -1) {
      sortedAndGroupedAssignments.add([assignment]);
    } else {
      sortedAndGroupedAssignments[maybeIndex].add(assignment);
    }
  }

  return sortedAndGroupedAssignments;
}

List<List<Assignment>> sortRecurringAssignmentGroups(
    List<List<Assignment>> assignmentGroups) {
  assignmentGroups.sort((a, b) {
    final firstAssignmentA = a[0];
    final firstAssignmentB = b[0];
    return firstAssignmentA.dueDate!.millisecondsSinceEpoch
        .compareTo(firstAssignmentB.dueDate!.millisecondsSinceEpoch);
  });
  return assignmentGroups;
}

List<List<Assignment>> groupOneOffAssignments(
    List<Assignment> oneOffAssignments) {
  List<List<Assignment>> sortedAndGroupedAssignments = [];
  for (final assignment in oneOffAssignments) {
    final maybeIndex =
        sortedAndGroupedAssignments.indexWhere((assignmentGroup) {
      final firstAssignmentInGroup = assignmentGroup[0];
      final taskGroupTitle = firstAssignmentInGroup.assigneeName;
      return taskGroupTitle == assignment.assigneeName;
    });
    if (maybeIndex == -1) {
      sortedAndGroupedAssignments.add([assignment]);
    } else {
      sortedAndGroupedAssignments[maybeIndex].add(assignment);
    }
  }

  return sortedAndGroupedAssignments;
}

List<List<Assignment>> filterGroupedAssignments(
    List<List<Assignment>> groupedAssignments,
    bool showOnlyCurrentUserAssignments,
    int? currentUserId) {
  List<List<Assignment>> finalFilteredAssignments = [];
  for (final assignmentGroup in groupedAssignments) {
    final filteredAssignments = assignmentGroup
        .where((assignment) =>
            (!showOnlyCurrentUserAssignments) ||
            assignment.assigneeId == currentUserId)
        .toList();
    if (filteredAssignments.isEmpty) {
      continue;
    }
    finalFilteredAssignments.add(filteredAssignments);
  }
  return finalFilteredAssignments;
}
