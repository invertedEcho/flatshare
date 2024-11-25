import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/utils/env.dart';

Future<List<TaskGroup>> fetchTaskGroups({required int userGroupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/task-group?userGroupId=$userGroupId'));
  if (response.statusCode == 200) {
    List<dynamic> taskGroups = jsonDecode(response.body);
    final parsedTaskGroups = taskGroups
        .map<TaskGroup>((assignment) => TaskGroup.fromJson(assignment))
        .toList();
    return parsedTaskGroups;
  } else {
    throw Exception("Failed to load taskGroups: ${response.statusCode}");
  }
}

Future<void> deleteTaskGroup({required int taskGroupId}) async {
  final apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .delete(Uri.parse("$apiBaseUrl/task-group/$taskGroupId"));
  if (response.statusCode != 200) {
    throw Exception("Failed to delete task group: ${response.statusCode}");
  }
}
