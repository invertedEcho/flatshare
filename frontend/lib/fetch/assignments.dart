import 'dart:convert';

import 'package:wg_app/assignments_widget.dart';
import 'package:wg_app/main.dart';

Future<List<Assignment>> fetchAssignments() async {
  final response = await authenticatedClient
      .get(Uri.parse('http://192.168.178.114:3000/api/assignments?groupId=4'));

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
  final response = await authenticatedClient.post(Uri.parse(
      'http://192.168.178.114:3000/api/assignments/$assignmentId/$assignmentState'));
  if (response.statusCode != 200) {
    throw Exception("Failed to update assignment state");
  }
}
