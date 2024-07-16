import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:http/http.dart' as http;
import 'package:wg_app/models/user.dart';

Future<(User, String)> login(String username, String password) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await http.post(
    Uri.parse('$apiBaseUrl/login'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'username': username,
      'password': password,
    }),
  );
  print(response.body);

  switch (response.statusCode) {
    case 201:
      return (
        User.fromJson(jsonDecode(response.body)),
        jsonDecode(response.body)['accessToken'] as String
      );
    case 401:
      throw Exception("Incorrect credentials");
    default:
      throw Exception("Failed to login");
  }
}

Future<void> register(String username, String password, String email) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await http.post(
    Uri.parse('$apiBaseUrl/register'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'username': username,
      'password': password,
      'email': email
    }),
  );

  if (response.statusCode == 409) {
    throw Exception("User already exists.");
  }

  if (response.statusCode != 201) {
    throw Exception("Failed to register");
  }
}
