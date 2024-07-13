import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// TODO: Should maybe accept just the path, and always get the api base url
class AuthenticatedClient extends http.BaseClient {
  final FlutterSecureStorage _storage;
  final http.Client _httpClient = http.Client();

  AuthenticatedClient(this._storage);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    String? token = await _storage.read(key: 'jwt-token');

    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.headers['Content-Type'] = 'application/json';

    return _httpClient.send(request);
  }
}
