import 'package:flatshare/fetch/task.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class TaskProvider extends ChangeNotifier {
  List<Task> _tasks = [];

  List<Task> get tasks => _tasks;

  void addOneOffTask(
      {required String title,
      String? description,
      required int userGroupId,
      required List<int> userIds}) async {
    final task = await createOneOffTask(
        title: title,
        description: description,
        userGroupId: userGroupId,
        userIds: userIds);
    _tasks.add(task);
    notifyListeners();
  }

  void addRecurringTask(
      {required String title,
      String? description,
      required int userGroupId,
      required String interval}) async {
    final task = await createRecurringTask(
        title: title,
        description: description,
        userGroupId: userGroupId,
        interval: interval);
    _tasks.add(task);
    notifyListeners();
  }

  void removeTask(int taskId) async {
    await deleteTask(taskId: taskId);
    _tasks.removeWhere((task) => task.id == taskId);
    notifyListeners();
  }

  Future<void> initTasks(BuildContext context) async {
    // TODO: I am not really happy with accessing another provider inside a provider.
    final userGroup =
        Provider.of<UserProvider>(context, listen: false).userGroup;
    if (userGroup == null) {
      throw Exception("Cannot fetch tasks while the userGroup is not set");
    }

    final tasks = await fetchTasks(userGroupId: userGroup.id);
    _tasks = tasks;
    notifyListeners();
  }

  Future<void> updateTaskProvider(Task task) async {
    await updateTask(task: task);
    _tasks.removeWhere((task_) => task.id == task_.id);
    _tasks.add(task);
    notifyListeners();
  }
}
