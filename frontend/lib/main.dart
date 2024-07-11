import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/assignments_widget.dart';
import 'package:wg_app/authenticated_client.dart';
import 'package:wg_app/fetch/url.dart';
import 'package:wg_app/login_form.dart';
import 'package:wg_app/models/user.dart';
import 'package:wg_app/register_form.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:wg_app/tasks_widget.dart';
import 'package:wg_app/user_provider.dart';

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
      var apiBaseUrl = getApiBaseUrl();
      var profileRes =
          await authenticatedClient.get(Uri.parse('$apiBaseUrl/profile'));

      final profile = User.fromJson(jsonDecode(profileRes.body));
      Provider.of<UserProvider>(context, listen: false).setUser(profile);
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
        theme: ThemeData(useMaterial3: true, brightness: Brightness.light),
        darkTheme: ThemeData(brightness: Brightness.dark),
        themeMode: ThemeMode.system,
        home: isLoggedIn
            ? AuthenticatedNavigation(
                onLogout: handleLogout,
              )
            : UnauthenticatedNavigation(onLogin: handleLogin));
  }
}

class UnauthenticatedNavigation extends StatefulWidget {
  final VoidCallback onLogin;
  const UnauthenticatedNavigation({super.key, required this.onLogin});

  @override
  State<UnauthenticatedNavigation> createState() =>
      _UnauthenticatedNavigationState();
}

class _UnauthenticatedNavigationState extends State<UnauthenticatedNavigation> {
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index) {
          setState(() {
            currentPageIndex = index;
          });
        },
        indicatorColor: Colors.blueAccent,
        selectedIndex: currentPageIndex,
        destinations: const <Widget>[
          NavigationDestination(
            icon: Icon(Icons.login),
            label: 'Login',
          ),
          NavigationDestination(
            icon: Icon(Icons.app_registration),
            label: 'Register',
          ),
        ],
      ),
      body: <Widget>[
        /// Home page
        LoginForm(onLogin: widget.onLogin),
        const RegisterForm()
      ][currentPageIndex],
    );
  }
}

class AuthenticatedNavigation extends StatefulWidget {
  final VoidCallback onLogout;
  const AuthenticatedNavigation({super.key, required this.onLogout});

  @override
  State<AuthenticatedNavigation> createState() =>
      _AuthenticatedNavigationState();
}

class _AuthenticatedNavigationState extends State<AuthenticatedNavigation> {
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: const Text("WG App"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () {
              storage.delete(key: 'jwt-token');
              widget.onLogout();
              // handle the press
            },
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index) {
          setState(() {
            currentPageIndex = index;
          });
        },
        indicatorColor: Colors.blueAccent,
        selectedIndex: currentPageIndex,
        destinations: const <Widget>[
          NavigationDestination(
            selectedIcon: Icon(Icons.home),
            icon: Icon(Icons.home_outlined),
            label: 'Assignments',
          ),
          NavigationDestination(
            icon: Icon(Icons.app_registration),
            label: 'Tasks',
          ),
        ],
      ),
      body: <Widget>[
        const AssignmentsWidget(),
        const TasksWidget(),
      ][currentPageIndex],
    );
  }
}
