class TaskGroup {
  final int id;
  final String title;
  final String? description;
  final String interval;

  TaskGroup({
    required this.id,
    required this.title,
    this.description,
    required this.interval,
  });

  factory TaskGroup.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'title': String title,
        'description': String? description,
        'interval': String interval,
      } =>
        TaskGroup(
          id: id,
          title: title,
          description: description,
          interval: interval,
        ),
      _ => throw const FormatException("Failed to parse task groups.")
    };
  }
  @override
  String toString() {
    return title;
  }
}
