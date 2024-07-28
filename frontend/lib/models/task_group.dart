class TaskGroup {
  final int id;
  final String title;
  final String? description;
  final String interval;
  final int numberOfTasks;

  TaskGroup(
      {required this.id,
      required this.title,
      this.description,
      required this.interval,
      required this.numberOfTasks});

  factory TaskGroup.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'title': String title,
        'description': String? description,
        'interval': String interval,
        'numberOfTasks': int numberOfTasks
      } =>
        TaskGroup(
            id: id,
            title: title,
            description: description,
            interval: interval,
            numberOfTasks: numberOfTasks),
      _ => throw const FormatException("Failed to parse task groups.")
    };
  }
  @override
  String toString() {
    return title;
  }
}
