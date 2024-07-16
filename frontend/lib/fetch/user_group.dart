import 'dart:convert';

import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/main.dart';
import 'package:wg_app/models/user.dart';
import 'package:wg_app/models/user_group.dart';

Future<List<User>> fetchUsersInUserGroup({required int groupId}) async {
  var apiBaseUrl = getApiBaseUrl();
  var response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/users?userGroupId=$groupId"));

  if (response.statusCode != 200) {
    throw Exception(
        "Failed to fetch users in user group: ${response.statusCode}");
  }
  List<dynamic> usersInGroup = jsonDecode(response.body);
  return usersInGroup.map<User>((user) => User.fromJson(user)).toList();
}

Future<UserGroup> fetchUserGroupForUser({required int userId}) async {
  var apiBaseUrl = getApiBaseUrl();
  var response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/user-group/$userId"));
  if (response.statusCode != 200) {
    throw Exception(
        "Failed to fetch user group for user: ${response.statusCode}");
  }
  dynamic userGroup = jsonDecode(response.body);
  return UserGroup.fromJson(userGroup);
}
