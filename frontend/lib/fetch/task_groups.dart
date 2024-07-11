import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/main.dart';
import 'package:wg_app/models/task_group.dart';

Future<List<TaskGroup>> fetchTaskGroups() async {
  var apiBaseUrl = getApiBaseUrl();
  final response =
      await authenticatedClient.get(Uri.parse('$apiBaseUrl/task-group'));
  if (response.statusCode == 200) {
    List<dynamic> assignments = jsonDecode(response.body);
    return assignments
        .map<TaskGroup>((assignment) => TaskGroup.fromJson(assignment))
        .toList();
  } else {
    throw Exception("Failed to load assignments ${response.body}");
  }
}