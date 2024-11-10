import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

enum IntervalType { daily, weekly, monthly }

class CreateTask extends StatefulWidget {
  const CreateTask({super.key});

  @override
  CreateTaskState createState() {
    return CreateTaskState();
  }
}

class CreateTaskState extends State<CreateTask> {
  final _formKey = GlobalKey<FormState>();
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final multiSelectUserController = MultiSelectController<User>([]);

  TaskType selectedTaskType = TaskType.recurring;
  // TODO: use interval type
  String? selectedInterval;

  List<User> userInUserGroup = [];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final userGroupId = userGroup?.id;

    if (userGroupId != null) {
      fetchUsersInUserGroup(groupId: userGroupId).then((result) {
        setState(() {
          userInUserGroup = result;
        });
      });
    }
  }

  ButtonStyle getSelectTaskTypeButtonStyle(
      TaskType taskTypeOfButton, TaskType selectedTaskType) {
    return ButtonStyle(
      foregroundColor: WidgetStatePropertyAll(taskTypeOfButton ==
              selectedTaskType
          // TODO: Fix nested ternary, you baaaaad -> this can be fixed by finally fixing theme colors in the app
          ? Colors.blue
          : MediaQuery.of(context).platformBrightness == Brightness.dark
              ? Colors.white
              : Colors.black),
    );
  }

  void handleSubmit() async {
    if (_formKey.currentState!.validate()) {
      String title = titleController.text;
      String description = descriptionController.text;
      List<int> selectedUserIds = multiSelectUserController.value
          .map((selectUser) => selectUser.userId)
          .toList();

      if (selectedTaskType == TaskType.oneOff && selectedUserIds.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('At least one user must be selected')),
        );
        return;
      }

      if (selectedTaskType == TaskType.recurring && selectedInterval == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select an interval first')),
        );
        return;
      }

      final int? currentUserGroupId =
          Provider.of<UserProvider>(context, listen: false).userGroup?.id;

      if (currentUserGroupId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Unexpected error: userGroupId was null')),
        );
        return;
      }
      final taskProvider = Provider.of<TaskProvider>(context, listen: false);
      try {
        selectedTaskType == TaskType.oneOff
            ? taskProvider.addOneOffTask(
                title: title,
                description: description,
                userGroupId: currentUserGroupId,
                userIds: selectedUserIds)
            : await taskProvider.addRecurringTask(
                title: title,
                description: description,
                userGroupId: currentUserGroupId,
                interval: selectedInterval!,
                context: context);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Created new task!')),
        );
        Navigator.of(context).pop();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Create a new Task")),
        body: Form(
            key: _formKey,
            child: Padding(
                padding: const EdgeInsets.all(30),
                child: Column(
                  children: [
                    TextFormField(
                      controller: titleController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a title';
                        }
                        return null;
                      },
                      decoration: const InputDecoration(
                        labelText: "Title",
                      ),
                    ),
                    TextFormField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                          labelText: "Description (optional)"),
                    ),
                    const SizedBox(height: 20),
                    Text("Select the task type:",
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Spacer(),
                        ElevatedButton(
                            style: getSelectTaskTypeButtonStyle(
                                TaskType.recurring, selectedTaskType),
                            onPressed: () {
                              setState(() {
                                selectedTaskType = TaskType.recurring;
                              });
                            },
                            child: const Text("Recurring Task")),
                        const Spacer(),
                        ElevatedButton(
                            style: getSelectTaskTypeButtonStyle(
                                TaskType.oneOff, selectedTaskType),
                            onPressed: () {
                              setState(() {
                                selectedTaskType = TaskType.oneOff;
                              });
                            },
                            child: const Text("One-Time Task")),
                        const Spacer(),
                      ],
                    ),
                    const SizedBox(height: 20),
                    selectedTaskType == TaskType.oneOff
                        ? CustomDropdown.multiSelect(
                            multiSelectController: multiSelectUserController,
                            decoration: const CustomDropdownDecoration(
                                listItemStyle: TextStyle(color: Colors.black),
                                hintStyle: TextStyle(color: Colors.black)),
                            hintText: "Select users",
                            items: userInUserGroup,
                            onListChanged: (value) {})
                        : CustomDropdown(
                            decoration: const CustomDropdownDecoration(
                                listItemStyle: TextStyle(color: Colors.black),
                                hintStyle: TextStyle(color: Colors.black)),
                            hintText: "Select interval",
                            items: const ['Daily', 'Weekly', 'Monthly'],
                            onChanged: (value) {
                              setState(() {
                                selectedInterval = value!;
                              });
                            }),
                    const SizedBox(height: 20),
                    ElevatedButton(
                        style: const ButtonStyle(),
                        onPressed: handleSubmit,
                        child: const Text("Create")),
                  ],
                ))));
  }
}
