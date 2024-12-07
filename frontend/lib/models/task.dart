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

  factory Task.fromJson(Map<String, dynamic> json) {
    try {
      return Task(
          id: json['id'] as int,
          title: json['title'] as String,
          description: json['description'] as String?,
          taskGroupId: json['taskGroupId'] as int?);
    } catch (e) {
      throw FormatException("Failed to parse task: ${e.toString()}");
    }
  }
}

enum TaskType { oneOff, recurring }
