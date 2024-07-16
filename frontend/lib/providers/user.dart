import 'package:flutter/material.dart';
import 'package:wg_app/models/user.dart';
import 'package:wg_app/models/user_group.dart';

class UserProvider with ChangeNotifier {
  User? _user;
  UserGroup? _userGroup;

  User? get user => _user;
  UserGroup? get userGroup => _userGroup;

  void setUser(User newUser) {
    _user = newUser;
    notifyListeners();
  }

  void setUserGroup(UserGroup? newUserGroup) {
    _userGroup = newUserGroup;
    notifyListeners();
  }

  void clearUser() {
    _user = null;
    notifyListeners();
  }
}
