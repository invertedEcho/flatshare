import 'package:flutter/material.dart';
import 'package:wg_app/main.dart';
import 'package:wg_app/widgets/assignments/assignments_widget.dart';
import 'package:wg_app/widgets/expandable_fab.dart';
import 'package:wg_app/widgets/tasks/create_task.dart';
import 'package:wg_app/widgets/tasks/create_task_group.dart';
import 'package:wg_app/widgets/tasks/tasks_overview_widget.dart';

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
        title: const Text("Flatshare"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () {
              storage.delete(key: 'jwt-token');
              widget.onLogout();
            },
          ),
        ],
      ),
      floatingActionButton: ExpandableFab(
        children: [
          Row(children: [
            const Text("New task group"),
            const SizedBox(width: 16),
            ActionButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const CreateTaskGroup())),
              icon: const Icon(Icons.group_work_outlined),
            ),
          ]),
          Row(children: [
            const Text("New task"),
            const SizedBox(width: 16),
            ActionButton(
              onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const CreateTask())),
              icon: const Icon(Icons.task_alt),
            ),
          ]),
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
        const TasksOverviewWidget(),
      ][currentPageIndex],
    );
  }
}
