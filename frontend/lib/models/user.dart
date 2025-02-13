class User {
  // TODO: why is this called userId instead of id?
  final int userId;
  final String email;
  final String username;

  User({required this.userId, required this.email, required this.username});

  User.fromJson(Map<String, dynamic> json)
      : userId = json['userId'] as int,
        email = json['email'] as String,
        username = json['username'] as String;

  @override
  String toString() {
    return username;
  }
}
