import 'package:flutter/material.dart';
import 'package:wg_app/utils/date.dart';

class Assignment {
  final int id;
  final String title;
  final String description;
  final DateTime? dueDate;
  final bool isCompleted;

  const Assignment(
      {required this.id,
      required this.title,
      required this.description,
      this.dueDate,
      required this.isCompleted});

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'title': String title,
        'description': String description,
        // TODO: Is this right?
        'dueDate': dynamic dueDateStr,
        'isCompleted': bool isCompleted
      } =>
        Assignment(
            id: id,
            title: title,
            description: description,
            dueDate: dueDateStr == null
                ? null
                // TODO: feels weird
                : DateTime.parse(dueDateStr.toString()),
            isCompleted: isCompleted),
      _ => throw const FormatException("Failed to load assignments.")
    };
  }
}

class AssignmentCard extends StatelessWidget {
  final Assignment assignment;

  const AssignmentCard({super.key, required this.assignment});

  @override
  Widget build(BuildContext context) {
    final title = assignment.title;
    final description = assignment.description;
    final String? dueDate =
        assignment.dueDate != null ? parseToDueDate(assignment.dueDate!) : null;
    final isCompleted = assignment.isCompleted;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(13),
      ),
      elevation: 1,
      shadowColor: Colors.black,
      child: ListTile(
        title: Text(title),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(description),
            if (dueDate != null) Text(dueDate),
          ],
        ),
        trailing: Checkbox(
          onChanged: (bool? value) => print(value),
          value: isCompleted,
        ),
      ),
    );
  }
}
