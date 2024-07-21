import 'package:flatshare/fetch/auth.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<StatefulWidget> createState() {
    return SplashScreenState();
  }
}

class SplashScreenState extends State<SplashScreen> {
  late Future<(User?, UserGroup?)> userInfoFuture;

  @override
  void initState() {
    super.initState();
    userInfoFuture = getUserInfo();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<(User?, UserGroup?)>(
        future: userInfoFuture,
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
              }
              if (maybeUser != null) {
                userProvider.setUser(maybeUser);
                context.go('/home');
              } else {
                context.go('/login');
              }
            });
          }
          return const Center(child: CircularProgressIndicator());
        });
  }
}
