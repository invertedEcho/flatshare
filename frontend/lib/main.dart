import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/authenticated_navigation.dart';
import 'package:wg_app/fetch/auth.dart';
import 'package:wg_app/fetch/authenticated_client.dart';
import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/fetch/user_group.dart';
import 'package:wg_app/models/user.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:wg_app/models/user_group.dart';
import 'package:wg_app/providers/user.dart';
import 'package:wg_app/unauthenticated_navigation.dart';

Future main() async {
  await dotenv.load(fileName: '.env');
  runApp(MultiProvider(
    providers: [ChangeNotifierProvider(create: (_) => UserProvider())],
    child: const App(),
  ));
}

const storage = FlutterSecureStorage();
final authenticatedClient = AuthenticatedClient(storage);

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  var isLoggedIn = false;
  var isInGroup = false;

  @override
  void initState() {
    super.initState();
    getUserInfo();
  }

  Future<void> getUserInfo() async {
    try {
      User user = await getProfile();
      UserGroup? userGroup = await fetchUserGroupForUser(userId: user.userId);

      var userProvider = Provider.of<UserProvider>(context, listen: false);
      userProvider.setUser(user);

      if (userGroup != null) {
        userProvider.setUserGroup(userGroup);
        setState(() {
          isInGroup = true;
        });
      } else {
        userProvider.setUserGroup(null);
      }
      setState(() {
        isLoggedIn = true;
      });
    } catch (err) {
      setState(() {
        isLoggedIn = false;
      });
    }
  }

  void handleLogout() async {
    await storage.delete(key: 'jwt-token');
    setState(() {
      isLoggedIn = false;
    });
  }

  void handleLogin() async {
    setState(() {
      isLoggedIn = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
        ),
        darkTheme: ThemeData(brightness: Brightness.dark),
        themeMode: ThemeMode.system,
        home: isLoggedIn
            ? AuthenticatedNavigation(
                onLogout: handleLogout,
              )
            : UnauthenticatedNavigation(onLogin: handleLogin));
  }
}
