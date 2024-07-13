class User {
  final int userId;
  final int? groupId;
  final String email;
  final String username;

  const User(
      {required this.userId,
      this.groupId,
      required this.email,
      required this.username});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'] as int,
      groupId: json['groupId'] as int?,
      email: json['email'] as String,
      username: json['username'] as String,
    );
  }
  @override
  String toString() {
    return username;
  }
}
