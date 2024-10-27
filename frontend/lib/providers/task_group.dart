import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class TaskGroupProvider extends ChangeNotifier {
  List<TaskGroup> _taskGroups = [];

  List<TaskGroup> get taskGroups => _taskGroups;

  Future<void> initTaskGroups(BuildContext context) async {
    // TODO: I am not really happy with accessing another provider inside a provider.
    final userGroup =
        Provider.of<UserProvider>(context, listen: false).userGroup;
    if (userGroup == null) {
      throw Exception("Cannot fetch tasks while the userGroup is not set");
    }

    final taskGroups = await fetchTaskGroups(userGroupId: userGroup.id);
    _taskGroups = taskGroups;
    notifyListeners();
  }

  void addTaskGroup(TaskGroup taskGroup) {
    _taskGroups.add(taskGroup);
    notifyListeners();
  }

  Future<void> removeTaskGroup(int taskGroupId) async {
    await deleteTaskGroup(taskGroupId: taskGroupId);
    _taskGroups.removeWhere((taskGroup) => taskGroup.id == taskGroupId);
    notifyListeners();
  }
}
