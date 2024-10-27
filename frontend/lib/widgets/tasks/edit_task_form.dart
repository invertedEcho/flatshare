import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:collection/collection.dart';
import 'package:flatshare/fetch/task_group.dart';
import 'package:flatshare/models/task.dart';
import 'package:flatshare/models/task_group.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/task.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class EditTaskForm extends StatefulWidget {
  final Task task;
  const EditTaskForm({super.key, required this.task});

  @override
  EditTaskFormState createState() {
    return EditTaskFormState();
  }
}

class EditTaskFormState extends State<EditTaskForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController titleController;
  late TextEditingController descriptionController;
  SingleSelectController<TaskGroup?>? selectTaskGroupController;
  List<TaskGroup> taskGroups = [];

  @override
  void initState() {
    super.initState();
    titleController = TextEditingController(text: widget.task.title);
    descriptionController =
        TextEditingController(text: widget.task.description);
    fetchTaskGroupsAndInitialize();
  }

  Future<void> fetchTaskGroupsAndInitialize() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    UserGroup? userGroup = userProvider.userGroup;
    final userGroupId = userGroup?.id;

    if (userGroupId != null) {
      final result = await fetchTaskGroups(userGroupId: userGroupId);

      setState(() {
        taskGroups = result;
        selectTaskGroupController = SingleSelectController<TaskGroup?>(
          result.firstWhereOrNull(
            (taskGroup) => taskGroup.id == widget.task.recurringTaskGroupId,
          ),
        );
      });
    }
  }

  Future<void> onUpdateTask(Task task) async {
    print("3");
    await Provider.of<TaskProvider>(context, listen: false)
        .updateTaskProvider(task);
    print("4");
  }

  @override
  Widget build(BuildContext context) {
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
              decoration:
                  const InputDecoration(labelText: "Description (optional)"),
            ),
            const SizedBox(height: 20),
            // I don't think you should have to do this, but without it the dropdown always displays the initial value as selected
            if (selectTaskGroupController != null)
              CustomDropdown.search(
                controller: selectTaskGroupController,
                decoration: const CustomDropdownDecoration(
                  listItemStyle: TextStyle(color: Colors.black),
                  hintStyle: TextStyle(color: Colors.black),
                ),
                hintText: "Select task group",
                items: taskGroups,
                onChanged: (value) {},
              ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    final updatedTask = Task(
                        id: task.id,
                        title: titleController.text,
                        description: descriptionController.text,
                        recurringTaskGroupId:
                            selectTaskGroupController?.value?.id);
                    await onUpdateTask(updatedTask);
                    Navigator.pop(context);
                  }
                },
                child: const Text("Update"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
