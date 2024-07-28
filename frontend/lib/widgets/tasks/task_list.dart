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

  void handleOnDismissed({required BuildContext context, required int taskId}) {
    showDialog(
        context: context,
        builder: (BuildContext ctx) {
          return AlertDialog(
            title: const Text("Are you sure?"),
            content: const Text(
                "Are you really sure you want to delete this task? This will also delete all current assignments that exist for this task."),
            actions: [
              TextButton(
                  onPressed: () async {
                    refreshState();
                    Navigator.of(context).pop();
                  },
                  child: const Text("Abort")),
              TextButton(
                  onPressed: () async {
                    await deleteTask(taskId: taskId);
                    Navigator.of(context).pop();
                    refreshState();
                  },
                  child: const Text("Confirm"))
            ],
          );
        });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        shrinkWrap:
            true, // TODO: Get rid of this, thereotically this ListView won't have much data, but its still not recommended for performance reasons.
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          final task = tasks[index];
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            // TODO: fix black edges visible when swiping dismissible
            child: Dismissible(
              direction: DismissDirection.endToStart,
              key: Key(task.id.toString()),
              onDismissed: (direction) async {
                handleOnDismissed(context: context, taskId: task.id);
              },
              background: Container(
                  decoration: const BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.all(Radius.circular(15))),
                  padding: const EdgeInsets.all(16),
                  child: const Align(
                    alignment: Alignment.centerRight,
                    child: Icon(
                      Icons.delete,
                      color: Colors.black,
                    ),
                  )),
              child: Card(
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
                                          height: 350,
                                          width: double.infinity,
                                          child: Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.start,
                                            children: [
                                              Text("Edit Task",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .headlineMedium),
                                              const SizedBox(height: 20),
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
              ),
            ),
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
      try {
        final result = await fetchTaskGroups(userGroupId: userGroupId);

        setState(() {
          taskGroups = result;
          selectTaskGroupController = SingleSelectController<TaskGroup?>(
            result.firstWhereOrNull(
              (taskGroup) => taskGroup.id == widget.task.recurringTaskGroupId,
            ),
          );
        });
      } catch (error) {
        print('Error fetching task groups: $error');
      }
    }
  }

  Future<void> onSubmit(Task task) async {
    await updateTask(
      taskId: task.id,
      title: titleController.text,
      description: descriptionController.text,
      taskGroupId: selectTaskGroupController?.value?.id,
    );
  }

  @override
  Widget build(BuildContext buildContext) {
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
                    await onSubmit(task);
                    widget.refreshState();
                    Navigator.pop(context);
                  }
                },
                child: const Text("Submit"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
