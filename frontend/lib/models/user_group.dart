class UserGroup {
  final int id;
  final String name;

  const UserGroup({required this.id, required this.name});

  factory UserGroup.fromJson(Map<String, dynamic> json) {
    return UserGroup(
      id: json['id'] as int,
      name: json['name'] as String,
    );
  }
  @override
  String toString() {
    return name;
  }
}
