import 'package:flutter/material.dart';
import 'package:wg_app/widgets/user/login_form.dart';
import 'package:wg_app/widgets/user/register_form.dart';

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
        RegisterForm(onRegister: () {
          setState(() {
            currentPageIndex = 0;
          });
        })
      ][currentPageIndex],
    );
  }
}
