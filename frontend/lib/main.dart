import 'dart:convert';

import 'package:flatshare/authenticated_navigation.dart';
import 'package:flatshare/fetch/authenticated_client.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/unauthenticated_navigation.dart';
import 'package:flatshare/utils/env.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

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
  late Future<(User?, UserGroup?)> userInfoFuture;

  @override
  void initState() {
    super.initState();
    userInfoFuture = getUserInfo();
  }

  Future<(User?, UserGroup?)> getUserInfo() async {
    try {
      var apiBaseUrl = getApiBaseUrl();
      var profileRes =
          await authenticatedClient.get(Uri.parse('$apiBaseUrl/profile'));

      User userProfile = User.fromJson(jsonDecode(profileRes.body));
      UserGroup? userGroup =
          await fetchUserGroupForUser(userId: userProfile.userId);
      return (userProfile, userGroup);
    } catch (err) {
      return (null, null);
    }
  }

  void handleLogout() async {
    await storage.delete(key: 'jwt-token');
    context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final goRouter = GoRouter(routes: [
      GoRoute(
          path: '/',
          builder: (context, state) {
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
                      }
                      context.go('/login');
                    });
                  }
                  return const Center(child: CircularProgressIndicator());
                });
          }),
      GoRoute(
          path: '/home',
          builder: (context, state) => const AuthenticatedNavigation()),
      GoRoute(
          path: '/login',
          builder: (context, state) => const UnauthenticatedNavigation())
    ]);
    return MaterialApp.router(
        routerConfig: goRouter,
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
        ),
        darkTheme: ThemeData(brightness: Brightness.dark),
        themeMode: ThemeMode.system);
  }
}
