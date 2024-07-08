import 'dart:convert';

import 'package:wg_app/login_form.dart';
import 'package:http/http.dart' as http;

Future<AuthResponse> login(String username, String password) async {
  final response = await http.post(
    Uri.parse('http://192.168.178.114:3000/api/login'),
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
