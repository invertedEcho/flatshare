import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/env.dart';
import 'package:flatshare/widgets/assignments/assignments_widget.dart';
import 'package:flatshare/widgets/create_user_group.dart';
import 'package:flatshare/widgets/join_group.dart';
import 'package:flatshare/widgets/tasks/create_task.dart';
import 'package:flatshare/widgets/tasks/tasks_overview_widget.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

List<Widget> getWidgets(int? userGroupId, String? inviteCode) {
  if (userGroupId != null) {
    return [
      const AssignmentsWidget(),
      const TasksOverviewWidget(),
    ];
  }
  return [
    JoinGroup(
      inviteCode: inviteCode,
    ),
    const CreateUserGroup(),
  ];
}

List<NavigationDestination> getNavigationDestinations(int? userGroupId) {
  if (userGroupId != null) {
    return [
      const NavigationDestination(
        selectedIcon: Icon(Icons.home),
        icon: Icon(Icons.home_outlined),
        label: 'Assignments',
      ),
      const NavigationDestination(
        icon: Icon(Icons.app_registration),
        label: 'Tasks',
      ),
    ];
  }
  return [
    const NavigationDestination(
      selectedIcon: Icon(Icons.group),
      icon: Icon(Icons.group_outlined),
      label: "Join Group",
    ),
    const NavigationDestination(
        selectedIcon: Icon(Icons.group_add),
        icon: Icon(Icons.group_add_outlined),
        label: "Create Group")
  ];
}

class AuthenticatedNavigation extends StatefulWidget {
  final String? userGroupInviteCode;
  const AuthenticatedNavigation({super.key, this.userGroupInviteCode});

  @override
  State<AuthenticatedNavigation> createState() =>
      _AuthenticatedNavigationState();
}

class _AuthenticatedNavigationState extends State<AuthenticatedNavigation> {
  final PageController _pageController = PageController(initialPage: 0);
  int currentPageIndex = 0;
  int? userGroupId;

  void handleLogout() {
    storage.delete(key: 'jwt-token');
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    userProvider.clearUser();
    userProvider.clearUserGroup();
    context.go('/login');
  }

  void handleOpenGenerateInviteCode() async {
    if (userGroupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                'Failed to generate user group invite code. userGroupId was null.')),
      );
      return;
    }
    String inviteCode =
        await generateInviteCodeForUserGroup(userGroupId: userGroupId!);
    String inviteCodeUrl = getInviteCodeUrl(inviteCode: inviteCode);
    showModalBottomSheet<void>(
        context: context,
        builder: (BuildContext context) {
          return SizedBox(
              height: 200,
              width: double.infinity,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Generated invite code: $inviteCode"),
                  const SizedBox(height: 20),
                  ElevatedButton(
                      style: const ButtonStyle(
                          foregroundColor:
                              WidgetStatePropertyAll(Colors.blueAccent)),
                      onPressed: () => Share.share(
                          "Join my Group on Flatshare by using this invite code: $inviteCodeUrl"),
                      child: const Text("Share this invite code"))
                ],
              ));
        });
  }

  @override
  Widget build(BuildContext context) {
    var userProvider = Provider.of<UserProvider>(context);
    if (userProvider.userGroup != null) {
      setState(() {
        userGroupId = userProvider.userGroup!.id;
      });
    }
    return Scaffold(
        appBar: AppBar(
          centerTitle: true,
          title: userProvider.userGroup?.name != null
              ? Text(userProvider.userGroup!.name)
              : null,
          actions: [
            PopupMenuButton(itemBuilder: (BuildContext context) {
              return [
                PopupMenuItem(
                    onTap: handleLogout,
                    child: const Row(children: [
                      Icon(Icons.logout),
                      SizedBox(
                        width: 10,
                      ),
                      Text("Logout"),
                    ])),
                PopupMenuItem(
                    onTap: handleOpenGenerateInviteCode,
                    child: const Row(
                      children: [
                        Icon(Icons.password),
                        SizedBox(
                          width: 10,
                        ),
                        Text("Invite new user to your group")
                      ],
                    ))
              ];
            })
          ],
        ),
        floatingActionButton: userProvider.userGroup?.id != null
            ? FloatingActionButton(
                backgroundColor: Colors.blueAccent,
                foregroundColor: Colors.white,
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (context) => const CreateTask())),
                child: Icon(Icons.add),
              )
            : null,
        bottomNavigationBar: NavigationBar(
          onDestinationSelected: (int index) {
            _pageController.animateToPage(index,
                duration: const Duration(milliseconds: 150),
                curve: Curves.linear);
          },
          indicatorColor: Colors.blueAccent,
          selectedIndex: currentPageIndex,
          destinations: getNavigationDestinations(userGroupId),
        ),
        body: PageView(
            controller: _pageController,
            onPageChanged: (int index) {
              setState(() {
                currentPageIndex = index;
              });
            },
            children: getWidgets(userGroupId, widget.userGroupInviteCode)));
  }
}
