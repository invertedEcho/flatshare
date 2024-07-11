class User {
  final String? accessToken;
  final int userId;
  final int? groupId;
  final String email;
  final String username;

  const User(
      {required this.accessToken,
      required this.userId,
      this.groupId,
      required this.email,
      required this.username});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      accessToken: json['accessToken'] as String?,
      userId: json['userId'] as int,
      groupId: json['groupId'] as int?,
      email: json['email'] as String,
      username: json['username'] as String,
    );
  }
}
