// TODO: i hateee this so much...
// TODO: https://github.com/invertedEcho/flatshare/issues/121
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';

class TaskWithMaybeTaskGroup extends Task {
  TaskGroup? taskGroup;

  TaskWithMaybeTaskGroup(
      {required super.id,
      required super.title,
      super.description,
      super.taskGroupId,
      this.taskGroup});

  TaskWithMaybeTaskGroup.fromJson(Map<String, dynamic> json)
      : taskGroup = json['maybeCreatedTaskGroup'] != null
            ? TaskGroup.fromJson(json['maybeCreatedTaskGroup'])
            : null,
        super(
            id: json['id'] as int,
            title: json['title'] as String,
            description: json['description'] as String?,
            taskGroupId: json['taskGroupId'] as int?);
}
