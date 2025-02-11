import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flutter/material.dart';

class UserProvider with ChangeNotifier {
  User? _user;
  UserGroup? _userGroup;
  List<User> _usersInUserGroup = [];

  User? get user => _user;
  UserGroup? get userGroup => _userGroup;
  List<User> get usersInUserGroup => _usersInUserGroup;

  Future<void> initUsersInUserGroup(int userGroupId) async {
    List<User> usersInUserGroup =
        await fetchUsersInUserGroup(userGroupId: userGroupId);
    _usersInUserGroup = usersInUserGroup;
  }

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
