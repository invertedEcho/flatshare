class UserGroup {
  final int id;
  final String name;

  const UserGroup({required this.id, required this.name});

  UserGroup.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        name = json['name'] as String;

  @override
  String toString() {
    return name;
  }
}
