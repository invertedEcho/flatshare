import 'package:flutter_dotenv/flutter_dotenv.dart';

String getApiBaseUrl() {
  String? maybeApibaseUrl = dotenv.env["API_BASE_URL"];

  assert(maybeApibaseUrl != null);

  return maybeApibaseUrl!;
}
