import 'package:flatshare/fetch/auth.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

class SplashScreen extends StatefulWidget {
  final String? userGroupInviteCode;
  const SplashScreen({super.key, this.userGroupInviteCode});

  @override
  State<StatefulWidget> createState() {
    return SplashScreenState();
  }
}

class SplashScreenState extends State<SplashScreen> {
  @override
  Widget build(BuildContext context) {
    final userGroupInviteCode = widget.userGroupInviteCode;
    return FutureBuilder<(User?, UserGroup?)>(
        future: fetchProfileAndUserGroup(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasData) {
            // TODO: This is a ugly workaround. We can't navigate to another route while there are being initialized.
            WidgetsBinding.instance.addPostFrameCallback((_) {
              var data = snapshot.data;
              var maybeUser = data!.$1;
              var maybeUserGroup = data.$2;
              var userProvider =
                  Provider.of<UserProvider>(context, listen: false);
              if (maybeUserGroup != null) {
                userProvider.setUserGroup(maybeUserGroup);
                userProvider.initUsersInUserGroup(maybeUserGroup.id);
              }
              if (maybeUser != null) {
                userProvider.setUser(maybeUser);
                String path = userGroupInviteCode != null
                    ? '/home?inviteCode=$userGroupInviteCode'
                    : '/home';
                context.go(path);
              } else {
                String path = userGroupInviteCode != null
                    ? '/login?inviteCode=$userGroupInviteCode'
                    : '/login';
                context.go(path);
              }
            });
          }
          return const Center(child: CircularProgressIndicator());
        });
  }
}
