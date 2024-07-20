import 'dart:convert';

import 'package:flatshare/fetch/url.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/models/task.dart';

Future<List<Task>> fetchTasks({required int groupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/tasks?groupId=$groupId'));

  if (response.statusCode == 200) {
    List<dynamic> tasks = jsonDecode(response.body);
    return tasks.map<Task>((task) => Task.fromJson(task)).toList();
  } else {
    throw Exception("Failed to fetch tasks: ${response.statusCode}");
  }
}

Future<void> createOneOffTask(
    {required String title,
    required String description,
    required int groupId,
    required List<int> userIds}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/tasks/one-off'),
          body: jsonEncode(
            {
              'title': title,
              'description': description,
              'groupId': groupId,
              'userIds': userIds
            },
          ));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task: ${response.statusCode}");
  }
}

Future<void> createRecurringTask(
    {required String title,
    required String description,
    required int groupId,
    required int taskGroupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.post(Uri.parse('$apiBaseUrl/tasks/recurring'),
          body: jsonEncode(
            {
              'title': title,
              'description': description,
              'groupId': groupId,
              'recurringTaskGroupId': taskGroupId
            },
          ));
  if (response.statusCode != 201) {
    throw Exception("Failed to create task: ${response.statusCode}");
  }
}
