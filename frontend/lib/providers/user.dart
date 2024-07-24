import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flutter/material.dart';

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

  void clearUserGroup() {
    _userGroup = null;
    notifyListeners();
  }
}
