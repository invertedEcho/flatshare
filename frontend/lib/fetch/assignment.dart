import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/assignment.dart';
import 'package:flatshare/utils/env.dart';

Future<List<Assignment>> fetchAssignments({required int userGroupId}) async {
  var apiBaseUrl = getApiBaseUrl(withApiSuffix: true);
  final response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/assignments?userGroupId=$userGroupId"));

  if (response.statusCode == 200) {
    List<dynamic> assignments = jsonDecode(response.body);
    return assignments
        .map<Assignment>((assignment) => Assignment.fromJson(assignment))
        .toList();
  } else {
    throw Exception("Failed to fetch assignments: ${response.statusCode}");
  }
}

Future<void> updateAssignmentState(
    int assignmentId, bool newAssignmentState) async {
  var assignmentState = newAssignmentState ? "pending" : 'completed';
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient.patch(
      Uri.parse('$apiBaseUrl/assignments/$assignmentId/$assignmentState'));
  if (response.statusCode != 200) {
    throw Exception("Failed to update assignment state");
  }
}
