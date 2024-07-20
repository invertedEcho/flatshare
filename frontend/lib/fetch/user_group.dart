import 'dart:convert';

import 'package:flatshare/fetch/url.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';

Future<List<User>> fetchUsersInUserGroup({required int groupId}) async {
  final apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/users?userGroupId=$groupId"));

  if (response.statusCode != 200) {
    throw Exception(
        "Failed to fetch users in user group: ${response.statusCode}");
  }
  List<dynamic> usersInGroup = jsonDecode(response.body);
  return usersInGroup.map<User>((user) => User.fromJson(user)).toList();
}

Future<UserGroup?> fetchUserGroupForUser({required int userId}) async {
  final apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse("$apiBaseUrl/user-group/$userId"));
  if (response.statusCode != 200) {
    throw Exception(
        "Failed to fetch user group for user: ${response.statusCode}");
  }
  Map<String, dynamic> userGroup = jsonDecode(response.body);

  // TODO: The endpoint should probably return a userGroup object instead
  // that is either null or contains these two fields.
  if (userGroup['id'] == null || userGroup['name'] == null) {
    return null;
  }

  return UserGroup.fromJson(userGroup);
}

Future<UserGroup> joinGroupByInviteCode(
    {required int userId, required String inviteCode}) async {
  final String apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient.post(
      Uri.parse('$apiBaseUrl/user-group/join'),
      body: jsonEncode(
          <String, dynamic>{'userId': userId, 'inviteCode': inviteCode}));

  switch (response.statusCode) {
    case 201:
      Map<String, dynamic> result = jsonDecode(response.body);
      return UserGroup(id: result['id'] as int, name: result['name'] as String);
    case 400:
      throw Exception("Invalid invite code");
    default:
      throw Exception("Failed to join user group by invite code.");
  }
}

Future<String> generateInviteCodeForUserGroup(
    {required int userGroupId}) async {
  final String apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient
      .get(Uri.parse('$apiBaseUrl/user-group/invite-code/$userGroupId'));

  switch (response.statusCode) {
    case 200:
      Map<String, dynamic> result = jsonDecode(response.body);
      // TODO
      return result['inviteCode'] as String;
    default:
      throw Exception(
          "Failed to generate invite code for user group: ${response.statusCode}");
  }
}
