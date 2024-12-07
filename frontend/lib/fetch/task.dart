import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/utils/env.dart';
import 'package:flatshare/widgets/tasks/create_task.dart';

// TODO: https://github.com/invertedEcho/flatshare/issues/121
class TaskWithMaybeTaskGroup extends Task {
  TaskGroup? taskGroup;

  TaskWithMaybeTaskGroup(
      {required super.id,
      required super.title,
      super.description,
      super.taskGroupId,
      this.taskGroup});

  factory TaskWithMaybeTaskGroup.fromJson(Map<String, dynamic> json) {
    try {
      return TaskWithMaybeTaskGroup(
          id: json['id'] as int,
          title: json['title'] as String,
          description: json['description'] as String?,
          taskGroupId: json['taskGroupId'] as int?,
          taskGroup: json['maybeCreatedTaskGroup'] != null
              ? TaskGroup.fromJson(json['maybeCreatedTaskGroup'])
              : null);
    } catch (e) {
      throw FormatException(
          "Failed to parse task with maybe task group: ${e.toString()}");
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
              'userGroupId': userGroupId,
              'userIds': userIds
            },
          ));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task: ${response.statusCode}");
  }
  dynamic taskResponse = jsonDecode(response.body);
  return Task.fromJson(taskResponse);
}

Future<TaskWithMaybeTaskGroup> createRecurringTask(
    {required String title,
    required String? description,
    required int userGroupId,
    required IntervalType interval}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/tasks/recurring'),
          body: jsonEncode(
            {
              'title': title,
              'description': description,
              'userGroupId': userGroupId,
              'interval': interval.name[0].toUpperCase() +
                  interval.name.substring(1, interval.name.length)
            },
          ));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task: ${response.statusCode}");
  }
  dynamic taskResponse = jsonDecode(response.body);
  return TaskWithMaybeTaskGroup.fromJson(taskResponse);
}

Future<void> updateTask({required Task task}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.patch(Uri.parse('$apiBaseUrl/tasks/${task.id}'),
          body: jsonEncode(
            {
              'title': task.title,
              'description': task.description,
              'taskGroupId': task.taskGroupId
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
