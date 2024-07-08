import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/assignments_widget.dart';
import 'package:wg_app/authenticated_client.dart';
import 'package:wg_app/login_form.dart';
import 'package:wg_app/register_form.dart';

// user_provider.dart

class UserProvider with ChangeNotifier {
  AuthResponse? _user;

  AuthResponse? get user => _user;

  void setUser(AuthResponse newUser) {
    _user = newUser;
    notifyListeners();
  }

  void clearUser() {
    _user = null;
    notifyListeners();
  }
}

void main() => runApp(MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => UserProvider())],
      child: const App(),
    ));

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
    // Call the asynchronous method to determine if the user is logged in
    checkLoginStatus();
    getUserInfo();
  }

  Future<void> getUserInfo() async {
    var profileRes = await authenticatedClient
        .get(Uri.parse('http://192.168.178.114:3000/api/profile'));

    final profile = AuthResponse.fromJson(jsonDecode(profileRes.body));
    Provider.of<UserProvider>(context, listen: false).setUser(profile);
  }

  // Method to check login status asynchronously
  Future<void> checkLoginStatus() async {
    var maybeAuthToken = await storage.read(key: 'jwt-token');
    bool loggedIn = maybeAuthToken != null;

    // Update the state with the login status
    setState(() {
      isLoggedIn = loggedIn;
    });
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
    print(isLoggedIn);

    return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(useMaterial3: true),
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
        indicatorColor: Colors.blue,
        selectedIndex: currentPageIndex,
        destinations: const <Widget>[
          NavigationDestination(
            icon: Badge(child: Icon(Icons.login)),
            label: 'Login',
          ),
          NavigationDestination(
            icon: Badge(child: Icon(Icons.app_registration)),
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

class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Accessing the UserProvider and getting the user data
    UserProvider userProvider = Provider.of<UserProvider>(context);
    AuthResponse? user = userProvider.user;

    return Text(user != null ? 'Welcome, ${user.username}' : 'Not logged in');
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
    final ThemeData theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: const Text("Wg app"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Open shopping cart',
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
        indicatorColor: Colors.blue,
        selectedIndex: currentPageIndex,
        destinations: const <Widget>[
          NavigationDestination(
            selectedIcon: Icon(Icons.home),
            icon: Icon(Icons.home_outlined),
            label: 'Assignments',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_sharp),
            label: 'Tasks',
          ),
        ],
      ),
      body: <Widget>[
	const AssignmentsWidget(),

        /// Messages page
        ListView.builder(
          reverse: true,
          itemCount: 2,
          itemBuilder: (BuildContext context, int index) {
            if (index == 0) {
              return Align(
                alignment: Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.all(8.0),
                  padding: const EdgeInsets.all(8.0),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Text(
                    'Hello',
                    style: theme.textTheme.bodyLarge!
                        .copyWith(color: theme.colorScheme.onPrimary),
                  ),
                ),
              );
            }
            return Align(
              alignment: Alignment.centerLeft,
              child: Container(
                  margin: const EdgeInsets.all(8.0),
                  padding: const EdgeInsets.all(8.0),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: MyWidget()),
            );
          },
        ),
      ][currentPageIndex],
    );
  }
}
