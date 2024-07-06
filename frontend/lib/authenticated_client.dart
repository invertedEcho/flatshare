import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthenticatedClient extends http.BaseClient {
  final FlutterSecureStorage _storage;
  final http.Client _httpClient = http.Client();

  AuthenticatedClient(this._storage);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    // Retrieve the token from secure storage
    String? token = await _storage.read(key: 'jwt-token');

    // Add the token to the request headers if available
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    // Proceed with the original request
    return _httpClient.send(request);
  }
}
