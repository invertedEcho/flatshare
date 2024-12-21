import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/utils/env.dart';

sendFCMToken(int userId, String registrationToken) async {
  var apiBaseUrl = getApiBaseUrl();
  final response = await authenticatedClient.post(
      Uri.parse('$apiBaseUrl/notifications/registration-token'),
      body: jsonEncode(
          {'userId': userId, 'registrationToken': registrationToken}));
  if (response.statusCode != 201) {
    throw Exception("Failed to post firebase registration token to backend");
  }
}
