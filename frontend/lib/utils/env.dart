import 'package:flutter_dotenv/flutter_dotenv.dart';

String getApiBaseUrl({bool withApiSuffix = true}) {
  String? maybeApibaseUrl = dotenv.env["API_BASE_URL"];

  assert(maybeApibaseUrl != null);

  if (withApiSuffix) {
    return "$maybeApibaseUrl/api";
  }
  return maybeApibaseUrl!;
}

String getInviteCodeUrl({required String inviteCode}) {
  String? maybeInviteCodeUrl = dotenv.env["INVITE_CODE_URL"];

  assert(maybeInviteCodeUrl != null);

  return "$maybeInviteCodeUrl?inviteCode=$inviteCode";
}
