import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/main.dart';
import 'package:wg_app/models/task.dart';

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

Future<void> createTask(
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
