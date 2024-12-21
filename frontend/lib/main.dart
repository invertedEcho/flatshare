import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flatshare/authenticated_navigation.dart';
import 'package:flatshare/fetch/authenticated_client.dart';
import 'package:flatshare/notifications/android.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/task_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/unauthenticated_navigation.dart';
import 'package:flatshare/widgets/screens/splash.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';

Future main() async {
  await dotenv.load(fileName: '.env');
  if (Platform.isAndroid || Platform.isIOS) {
    WidgetsFlutterBinding.ensureInitialized();
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    await messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  }
  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => UserProvider()),
      ChangeNotifierProvider(create: (_) => TaskProvider()),
      ChangeNotifierProvider(create: (_) => TaskGroupProvider()),
    ],
    child: const App(),
  ));
}

const storage = FlutterSecureStorage();
final authenticatedClient = AuthenticatedClient(storage);

final goRouter = GoRouter(routes: [
  GoRoute(
      path: '/',
      builder: (context, state) => SplashScreen(
            userGroupInviteCode: state.uri.queryParameters['inviteCode'],
          )),
  GoRoute(
      path: '/home',
      builder: (context, state) {
        final maybeInviteCode = state.uri.queryParameters['inviteCode'];
        return AuthenticatedNavigation(userGroupInviteCode: maybeInviteCode);
      }),
  GoRoute(
      path: '/login',
      builder: (context, state) {
        final maybeInviteCode = state.uri.queryParameters['inviteCode'];
        return UnauthenticatedNavigation(maybeInviteCode: maybeInviteCode);
      }),
]);

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
        routerConfig: goRouter,
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorScheme: const ColorScheme(
              brightness: Brightness.light,
              primary: Colors.blueAccent,
              onPrimary: Colors.white,
              secondary: Colors.blueAccent,
              onSecondary: Colors.white,
              error: Colors.red,
              onError: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black),
        ),
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: ColorScheme(
              brightness: Brightness.dark,
              primary: Colors.blueAccent,
              onPrimary: Colors.white,
              secondary: Colors.blueAccent,
              onSecondary: Colors.white,
              error: Colors.red,
              onError: Colors.white,
              surfaceContainer: Colors.grey[850],
              surface: Colors.grey.shade900,
              onSurface: Colors.white),
        ),
        themeMode: ThemeMode.system);
  }
}
