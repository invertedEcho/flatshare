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
