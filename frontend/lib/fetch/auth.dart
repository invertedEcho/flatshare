import 'dart:convert';
import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flatshare/fetch/notification.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/notifications/util.dart';
import 'package:flatshare/utils/env.dart';
import 'package:http/http.dart' as http;

Future<String> login(String email, String password) async {
  var apiBaseUrl = getApiBaseUrl();
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

  switch (response.statusCode) {
    case 200:
      return jsonDecode(response.body)['accessToken'] as String;
    case 401:
      throw Exception("Incorrect credentials");
    default:
      throw Exception("Failed to login: ${response.statusCode}");
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

Future<User?> fetchProfile() async {
  var apiBaseUrl = getApiBaseUrl();
  var profileRes =
      await authenticatedClient.get(Uri.parse('$apiBaseUrl/auth/profile'));
  if (profileRes.statusCode == 401) {
    return null;
  }
  return User.fromJson(jsonDecode(profileRes.body));
}

Future<(User?, UserGroup?)> fetchProfileAndUserGroup() async {
  try {
    User? user = await fetchProfile();
    if (user == null) {
      return (null, null);
    }
    UserGroup? userGroup = await fetchUserGroupForUser(userId: user.userId);

    if (getIsSupportedPlatformFirebase()) {
      String? registrationToken = await FirebaseMessaging.instance.getToken();
      if (registrationToken != null) {
        await sendFCMToken(user.userId, registrationToken);
      }
    }
    return (user, userGroup);
  } catch (err) {
    print(err);
    return (null, null);
  }
}
