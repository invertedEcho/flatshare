import 'dart:convert';

import 'package:wg_app/main.dart';
import 'package:wg_app/models/task_group.dart';
import 'package:wg_app/utils/env.dart';

Future<List<TaskGroup>> fetchTaskGroups({required int userGroupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/task-group?userGroupId=$userGroupId'));
  if (response.statusCode == 200) {
    List<dynamic> assignments = jsonDecode(response.body);
    return assignments
        .map<TaskGroup>((assignment) => TaskGroup.fromJson(assignment))
        .toList();
  } else {
    throw Exception("Failed to load assignments: ${response.statusCode}");
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
