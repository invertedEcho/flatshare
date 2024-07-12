class Assignment {
  final int id;
  final String title;
  final int assigneeId;
  final String assigneeName;
  final DateTime createdAt;
  final bool isOneOff;
  bool isCompleted;
  final String? description;
  final DateTime? dueDate;
  final int? taskGroupId;
  final String? taskGroupTitle;

  Assignment({
    required this.id,
    required this.title,
    required this.assigneeId,
    required this.assigneeName,
    required this.createdAt,
    required this.isOneOff,
    required this.isCompleted,
    this.taskGroupId,
    this.taskGroupTitle,
    this.description,
    this.dueDate,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return Assignment(
      id: json['id'] as int,
      title: json['title'] as String,
      isCompleted: json['isCompleted'] as bool,
      assigneeId: json['assigneeId'] as int,
      assigneeName: json['assigneeName'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isOneOff: json['isOneOff'] as bool,
      description: json['description'] as String?,
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : null,
      taskGroupId: json['taskGroupId'] as int?,
      taskGroupTitle: json['taskGroupTitle'] as String?,
    );
  }
}