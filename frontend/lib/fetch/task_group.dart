import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/task.dart';
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
    // TODO: sort by something that makes more sense
    parsedTaskGroups.sort((a, b) => a.id - b.id);
    return parsedTaskGroups;
  } else {
    throw Exception("Failed to load taskGroups: ${response.statusCode}");
  }
}

Future<void> createTaskGroup(
    {required String title,
    String? description,
    required String interval,
    required List<int> userIds,
    required String initialStartDate,
    required int userGroupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/task-group'),
          body: jsonEncode(<String, dynamic>{
            'title': title,
            'description': description,
            'interval': interval,
            'userIds': userIds,
            'initialStartDate': initialStartDate,
            'userGroupId': userGroupId
          }));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task group: ${response.statusCode}");
  }
}

Future<List<Task>> fetchTasksForTaskGroup({required int taskGroupId}) async {
  final apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/task-group/tasks/$taskGroupId"));
  if (response.statusCode == 200) {
    List<dynamic> tasks = jsonDecode(response.body);
    List<Task> parsedTasks =
        tasks.map<Task>((assignment) => Task.fromJson(assignment)).toList();
    // TODO: sort by something that makes more sense
    parsedTasks.sort((a, b) => a.id - b.id);
    return parsedTasks;
  } else {
    throw Exception(
        "Failed to load tasks for task group $taskGroupId: ${response.statusCode}");
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
