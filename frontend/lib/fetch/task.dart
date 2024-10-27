import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/utils/env.dart';

// TODO: https://github.com/invertedEcho/flatshare/issues/121
class TaskWithMaybeRecurringTaskGroup extends Task {
  TaskGroup? taskGroup;

  TaskWithMaybeRecurringTaskGroup(
      {required super.id,
      required super.title,
      super.description,
      super.recurringTaskGroupId,
      this.taskGroup});

  factory TaskWithMaybeRecurringTaskGroup.fromJson(Map<String, dynamic> json) {
    try {
      return TaskWithMaybeRecurringTaskGroup(
          id: json['id'] as int,
          title: json['title'] as String,
          description: json['description'] as String?,
          recurringTaskGroupId: json['recurringTaskGroupId'] as int?,
          taskGroup: json['maybeCreatedRecurringTaskGroup'] != null
              ? TaskGroup.fromJson(json['maybeCreatedRecurringTaskGroup'])
              : null);
    } catch (e) {
      throw FormatException(
          "Failed to parse task with maybe recurring task group: ${e.toString()}");
    }
  }
}

Future<List<Task>> fetchTasks({required int userGroupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/tasks?userGroupId=$userGroupId'));

  if (response.statusCode == 200) {
    List<dynamic> tasks = jsonDecode(response.body);
    return tasks.map<Task>((task) => Task.fromJson(task)).toList();
  } else {
    throw Exception("Failed to fetch tasks: ${response.statusCode}");
  }
}

// TODO: maybe we should just unify these endpoints and handle it in the backend by checking for the existence of the `interval` field
Future<Task> createOneOffTask(
    {required String title,
    String? description,
    required int userGroupId,
    required List<int> userIds}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/tasks/one-off'),
          body: jsonEncode(
            {
              'title': title,
              'description': description,
              'groupId': userGroupId,
              'userIds': userIds
            },
          ));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task: ${response.statusCode}");
  }
  dynamic taskResponse = jsonDecode(response.body);
  return Task.fromJson(taskResponse);
}

Future<TaskWithMaybeRecurringTaskGroup> createRecurringTask(
    {required String title,
    required String? description,
    required int userGroupId,
    required String interval}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/tasks/recurring'),
          body: jsonEncode(
            {
              'title': title,
              'description': description,
              'userGroupId': userGroupId,
              'interval': interval
            },
          ));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task: ${response.statusCode}");
  }
  dynamic taskResponse = jsonDecode(response.body);
  print(taskResponse);
  return TaskWithMaybeRecurringTaskGroup.fromJson(taskResponse);
}

Future<void> updateTask({required Task task}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.put(Uri.parse('$apiBaseUrl/tasks/${task.id}'),
          body: jsonEncode(
            {
              'title': task.title,
              'description': task.description,
              'taskGroupId': task.recurringTaskGroupId
            },
          ));

  if (response.statusCode != 200) {
    throw Exception("Failed to update task: ${response.statusCode}");
  }
}

Future<void> deleteTask({required int taskId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient.delete(
    Uri.parse('$apiBaseUrl/tasks/$taskId'),
  );

  if (response.statusCode != 200) {
    throw Exception(
        "Failed to delete task with taskId $taskId: ${response.statusCode}");
  }
}
