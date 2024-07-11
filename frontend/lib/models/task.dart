class Task {
  final int id;
  final String title;
  final String? description;
  final int? recurringTaskGroupId;

  Task(
      {required this.id,
      required this.title,
      this.description,
      this.recurringTaskGroupId});

  factory Task.fromJson(Map<String, dynamic> json) {
    try {
      return Task(
          id: json['id'] as int,
          title: json['title'] as String,
          description: json['description'] as String?,
          recurringTaskGroupId: json['recurringTaskGroupId'] as int?);
    } catch (e) {
      throw FormatException("Failed to parse tasks: ${e.toString()}");
    }
  }
}
