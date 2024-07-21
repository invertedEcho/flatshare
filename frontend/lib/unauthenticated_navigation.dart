import 'package:flatshare/widgets/user/login_form.dart';
import 'package:flatshare/widgets/user/register_form.dart';
import 'package:flutter/material.dart';

class UnauthenticatedNavigation extends StatefulWidget {
  const UnauthenticatedNavigation({super.key});

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
        const LoginForm(),
        RegisterForm(onRegister: () {
          setState(() {
            currentPageIndex = 0;
          });
        })
      ][currentPageIndex],
    );
  }
}
