import 'package:flatshare/widgets/user/login_form.dart';
import 'package:flatshare/widgets/user/register_form.dart';
import 'package:flutter/material.dart';

class UnauthenticatedNavigation extends StatefulWidget {
  final String? maybeInviteCode;
  const UnauthenticatedNavigation({super.key, this.maybeInviteCode});

  @override
  State<UnauthenticatedNavigation> createState() =>
      _UnauthenticatedNavigationState();
}

class _UnauthenticatedNavigationState extends State<UnauthenticatedNavigation> {
  final PageController _pageController = PageController(initialPage: 0);
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        bottomNavigationBar: NavigationBar(
          onDestinationSelected: (int index) {
            _pageController.animateToPage(index,
                duration: const Duration(milliseconds: 150),
                curve: Curves.linear);
          },
          selectedIndex: currentPageIndex,
          destinations: const <Widget>[
            NavigationDestination(
              icon: Icon(Icons.app_registration),
              label: 'Register',
            ),
            NavigationDestination(
              icon: Icon(Icons.login),
              label: 'Login',
            ),
          ],
        ),
        body: PageView(
          controller: _pageController,
          onPageChanged: (int index) {
            setState(() {
              currentPageIndex = index;
            });
          },
          children: [
            RegisterForm(
              onRegister: () {
                _pageController.animateToPage(1,
                    duration: const Duration(milliseconds: 150),
                    curve: Curves.linear);
              },
              maybeInviteCode: widget.maybeInviteCode,
            ),
            const LoginForm(),
          ],
        ));
  }
}
