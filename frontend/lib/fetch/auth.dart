import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/login_form.dart';
import 'package:http/http.dart' as http;

Future<AuthResponse> login(String username, String password) async {
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
      return AuthResponse.fromJson(jsonDecode(response.body));
    case 401:
      throw Exception("Incorrect credentials");
    default:
      throw Exception("Failed to login");
  }
}