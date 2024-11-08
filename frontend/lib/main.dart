import 'package:flatshare/authenticated_navigation.dart';
import 'package:flatshare/fetch/authenticated_client.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/task_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/unauthenticated_navigation.dart';
import 'package:flatshare/widgets/screens/splash.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future main() async {
  await dotenv.load(fileName: '.env');
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
          checkboxTheme: CheckboxThemeData(
            fillColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return Colors.blueAccent;
              }
              return Colors.white;
            }),
          ),
        ),
        darkTheme: ThemeData(brightness: Brightness.dark),
        themeMode: ThemeMode.system);
  }
}
