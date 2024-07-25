import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:flatshare/fetch/task.dart';
import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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
  final selectTaskGroupController = SingleSelectController<TaskGroup>(null);

  TaskType selectedTaskType = TaskType.oneOff;

  List<User> userInUserGroup = [];
  List<TaskGroup> taskGroups = [];

  // TODO: will probably be gone when below todo is fixed.
  int? currentUserGroupId;

  // TODO: we should not do async operations in this method, as it could cause unneccessary rebuilds
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final userGroupId = userGroup?.id;

    setState(() {
      currentUserGroupId = userGroupId;
    });

    if (userGroupId != null) {
      fetchUsersInUserGroup(groupId: userGroupId).then((result) {
        setState(() {
          userInUserGroup = result;
        });
      });
      fetchTaskGroups(userGroupId: userGroupId).then((result) {
        setState(() {
          taskGroups = result;
        });
      });
    }
  }

  ButtonStyle getSelectTaskTypeButtonStyle(
      TaskType taskTypeOfButton, TaskType selectedTaskType) {
    return ButtonStyle(
      foregroundColor:
          WidgetStatePropertyAll(taskTypeOfButton == selectedTaskType
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
      if (selectedTaskType == TaskType.recurring &&
          selectTaskGroupController.value == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a task group first')),
        );
        return;
      }
      // TODO: This should never happen.
      if (currentUserGroupId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Unexpected error: userGroupId was null')),
        );
        return;
      }
      try {
        selectedTaskType == TaskType.oneOff
            ? await createOneOffTask(
                title: title,
                description: description,
                groupId: currentUserGroupId!,
                userIds: selectedUserIds)
            : await createRecurringTask(
                title: title,
                description: description,
                groupId: currentUserGroupId!,
                taskGroupId: selectTaskGroupController.value!.id);
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
                      decoration: const InputDecoration(labelText: "Title"),
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
                                TaskType.oneOff, selectedTaskType),
                            onPressed: () {
                              setState(() {
                                selectedTaskType = TaskType.oneOff;
                              });
                            },
                            child: const Text("One-Off Task")),
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
                        : CustomDropdown.search(
                            controller: selectTaskGroupController,
                            decoration: const CustomDropdownDecoration(
                                listItemStyle: TextStyle(color: Colors.black),
                                hintStyle: TextStyle(color: Colors.black)),
                            hintText: "Select task group",
                            items: taskGroups,
                            onChanged: (value) {}),
                    const SizedBox(height: 20),
                    ElevatedButton(
                        onPressed: handleSubmit, child: const Text("Submit")),
                  ],
                ))));
  }
}
