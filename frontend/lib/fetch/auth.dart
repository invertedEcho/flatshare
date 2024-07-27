import 'dart:convert';

import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/utils/env.dart';
import 'package:http/http.dart' as http;

Future<String> login(String email, String password) async {
  var apiBaseUrl = getApiBaseUrl();
  print(apiBaseUrl);
  final response = await http.post(
    Uri.parse('$apiBaseUrl/auth/login'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'email': email,
      'password': password,
    }),
  );
  print(response);

  print(response.body);

  switch (response.statusCode) {
    case 200:
      return jsonDecode(response.body)['accessToken'] as String;
    case 401:
      throw Exception("Incorrect credentials");
    default:
      throw Exception("Failed to login");
  }
}

Future<void> register(
    String username, String password, String email, String? inviteCode) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await http.post(
    Uri.parse('$apiBaseUrl/auth/register'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String?>{
      'username': username,
      'password': password,
      'email': email,
      'inviteCode': inviteCode,
    }),
  );

  if (response.statusCode == 409) {
    throw Exception("User already exists.");
  }

  if (response.statusCode != 201) {
    throw Exception("Failed to register");
  }
}

Future<User> getProfile() async {
  var apiBaseUrl = getApiBaseUrl();
  var profileRes =
      await authenticatedClient.get(Uri.parse('$apiBaseUrl/auth/profile'));
  print(profileRes);
  print(profileRes.body);
  return User.fromJson(jsonDecode(profileRes.body));
}

Future<(User?, UserGroup?)> getUserInfo() async {
  try {
    User userProfile = await getProfile();
    UserGroup? userGroup =
        await fetchUserGroupForUser(userId: userProfile.userId);
    return (userProfile, userGroup);
  } catch (err) {
    print("ERROR: $err");
    return (null, null);
  }
}
