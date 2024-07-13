import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/main.dart';
import 'package:wg_app/models/user.dart';

Future<List<User>> fetchUsersInGroup({required int groupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  var response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/users?groupId=$groupId"));

  if (response.statusCode != 200) {
    throw Exception("Failed to fetch users in group: ${response.statusCode}");
  }
  List<dynamic> usersInGroup = jsonDecode(response.body);
  return usersInGroup.map<User>((user) => User.fromJson(user)).toList();
}
