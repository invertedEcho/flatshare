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

  TaskGroup.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        title = json['title'] as String,
        description = json['description'] as String?,
        interval = json['interval'] as String;

  @override
  String toString() {
    return title;
  }
}
