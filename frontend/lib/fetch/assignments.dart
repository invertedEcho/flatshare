import 'dart:convert';

import 'package:wg_app/assignments_widget.dart';
import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/main.dart';

Future<List<Assignment>> fetchAssignments() async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/assignments?groupId=4'));

  if (response.statusCode == 200) {
    List<dynamic> assignments = jsonDecode(response.body);
    return assignments
        .map<Assignment>((assignment) => Assignment.fromJson(assignment))
        .toList();
  } else {
    throw Exception("Failed to load assignments ${response.body}");
  }
}

void updateAssignmentState(int assignmentId, bool newAssignmentState) async {
  var assignmentState = newAssignmentState ? "pending" : 'completed';
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient.post(Uri.parse(
      '$apiBaseUrl/assignments/$assignmentId/$assignmentState'));
  if (response.statusCode != 200) {
    throw Exception("Failed to update assignment state");
  }
}
