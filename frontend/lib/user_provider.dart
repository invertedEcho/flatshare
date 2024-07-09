import 'package:flutter/material.dart';
import 'package:wg_app/login_form.dart';

class UserProvider with ChangeNotifier {
  AuthResponse? _user;

  AuthResponse? get user => _user;

  void setUser(AuthResponse newUser) {
    _user = newUser;
    notifyListeners();
  }

  void clearUser() {
    _user = null;
    notifyListeners();
  }
}
