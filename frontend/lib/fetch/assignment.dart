import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/main.dart';
import 'package:wg_app/models/assignment.dart';

Future<List<Assignment>> fetchAssignments({required int groupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      // TODO: correct groupid once group feature is implemented
      .get(Uri.parse('$apiBaseUrl/assignments?groupId=4'));

  if (response.statusCode == 200) {
    List<dynamic> assignments = jsonDecode(response.body);
    return assignments
        .map<Assignment>((assignment) => Assignment.fromJson(assignment))
        .toList();
  } else {
    throw Exception("Failed to fetch assignments: ${response.statusCode}");
  }
}

void updateAssignmentState(int assignmentId, bool newAssignmentState) async {
  var assignmentState = newAssignmentState ? "pending" : 'completed';
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient.post(
      Uri.parse('$apiBaseUrl/assignments/$assignmentId/$assignmentState'));
  if (response.statusCode != 201) {
    throw Exception("Failed to update assignment state");
  }
}