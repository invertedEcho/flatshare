import 'package:flutter_dotenv/flutter_dotenv.dart';

// TODO: i dont like these two functions

String getApiBaseUrl() {
  String? maybeApibaseUrl = dotenv.env["API_BASE_URL"];

  assert(maybeApibaseUrl != null);

  return "$maybeApibaseUrl/api";
}

String getPureApiBaseUrl() {
  String? maybeApibaseUrl = dotenv.env["API_BASE_URL"];

  assert(maybeApibaseUrl != null);

  return "$maybeApibaseUrl";
}

String getInviteCodeUrl({required String inviteCode}) {
  String? maybeInviteCodeUrl = dotenv.env["INVITE_CODE_URL"];

  assert(maybeInviteCodeUrl != null);

  return "$maybeInviteCodeUrl?inviteCode=$inviteCode";
}
