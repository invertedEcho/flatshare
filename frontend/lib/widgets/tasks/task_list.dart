import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:collection/collection.dart';
import 'package:flatshare/fetch/task.dart';
import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class TaskList extends StatelessWidget {
  final List<Task> tasks;
  final VoidCallback refreshState;

  const TaskList({super.key, required this.tasks, required this.refreshState});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        shrinkWrap:
            true, // TODO: Get rid of this, thereotically this ListView won't have much data, but its still not recommended for performance reasons.
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          final task = tasks[index];
          return Card(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15.0)),
            child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task.title,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(task.description!)
                      ],
                    ),
                    ElevatedButton(
                        onPressed: () {
                          showModalBottomSheet<void>(
                              context: context,
                              builder: (BuildContext context) {
                                return Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Container(
                                      height: 300,
                                      width: double.infinity,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        children: [
                                          Text("Edit task",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .headlineMedium),
                                          const SizedBox(height: 40),
                                          EditTaskForm(
                                              task: task,
                                              refreshState: refreshState)
                                        ],
                                      )),
                                );
                              });
                        },
                        child: Icon(Icons.edit))
                  ],
                )),
          );
        });
  }
}

class EditTaskForm extends StatefulWidget {
  final VoidCallback refreshState;
  final Task task;
  const EditTaskForm(
      {super.key, required this.task, required this.refreshState});

  @override
  EditTaskFormState createState() {
    return EditTaskFormState();
  }
}

class EditTaskFormState extends State<EditTaskForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController titleController;
  late TextEditingController descriptionController;
  SingleSelectController<TaskGroup?> selectTaskGroupController =
      SingleSelectController(null);
  List<TaskGroup> taskGroups = [];

  @override
  void initState() {
    super.initState();
    titleController = TextEditingController(text: widget.task.title);
    descriptionController =
        TextEditingController(text: widget.task.description);

    // Initialize the selectTaskGroupController after fetching taskGroups
    fetchTaskGroupsAndInitialize();
  }

  Future<void> fetchTaskGroupsAndInitialize() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final userGroupId = userGroup?.id;

    if (userGroupId != null) {
      try {
        // Fetch task groups
        final result = await fetchTaskGroups(userGroupId: userGroupId);
        selectTaskGroupController = SingleSelectController<TaskGroup?>(
          result.firstWhereOrNull(
            (taskGroup) => taskGroup.id == widget.task.recurringTaskGroupId,
          ),
        );

        setState(() {
          taskGroups = result;
        });

        // Initialize the SingleSelectController after taskGroups is populated
      } catch (error) {
        // Handle error here (e.g., show a message)
        print('Error fetching task groups: $error');
      }
    }
  }

  Future<void> onSubmit(Task task) async {
    await updateTask(
        taskId: task.id,
        title: titleController.text,
        description: descriptionController.text,
        taskGroupId: selectTaskGroupController.value?.id);
  }

  @override
  build(BuildContext buildContext) {
    final Task task = widget.task;
    return Form(
        key: _formKey,
        child: Padding(
            padding: const EdgeInsets.all(0),
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
                CustomDropdown.search(
                    controller: selectTaskGroupController,
                    decoration: const CustomDropdownDecoration(
                        listItemStyle: TextStyle(color: Colors.black),
                        hintStyle: TextStyle(color: Colors.black)),
                    hintText: "Select task group",
                    items: taskGroups,
                    onChanged: (value) {}),
                SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                      onPressed: () async {
                        await onSubmit(task);
                        widget.refreshState();
                        Navigator.pop(context);
                      },
                      child: const Text("Submit")),
                ),
              ],
            )));
  }
}
