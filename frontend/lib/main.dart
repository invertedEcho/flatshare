import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/authenticated_navigation.dart';
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

  @override
  void initState() {
    super.initState();
    getUserInfo();
  }

  Future<void> getUserInfo() async {
    try {
      print("TESDT");
      var apiBaseUrl = getApiBaseUrl();
      var profileRes =
          await authenticatedClient.get(Uri.parse('$apiBaseUrl/profile'));

      final userProfile = User.fromJson(jsonDecode(profileRes.body));
      UserGroup userGroup =
          await fetchUserGroupForUser(userId: userProfile.userId);

      var userProvider = Provider.of<UserProvider>(context, listen: false);
      userProvider.setUser(userProfile);
      userProvider.setUserGroup(userGroup);
      setState(() {
        isLoggedIn = true;
      });
    } catch (err) {
      print("LOGGEDDDING OUT.");
      print(err);
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
