class Task {
  final int id;
  final String title;
  final String? description;
  final int? taskGroupId;

  Task(
      {required this.id,
      required this.title,
      this.description,
      this.taskGroupId});

  Task.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        title = json['title'] as String,
        description = json['description'] as String?,
        taskGroupId = json['taskGroupId'] as int?;
}

enum TaskType { oneOff, recurring }
