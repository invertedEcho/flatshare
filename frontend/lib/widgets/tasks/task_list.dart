import 'package:flatshare/fetch/task.dart';
import 'package:flatshare/models/task.dart';
import 'package:flutter/material.dart';

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

  @override
  void initState() {
    super.initState();
    titleController = TextEditingController(text: widget.task.title);
    descriptionController =
        TextEditingController(text: widget.task.description);
  }

  void onSubmit(Task task) {
    updateTask(
        taskId: task.id,
        title: titleController.text,
        description: descriptionController.text,
        taskGroupId: task.recurringTaskGroupId);
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
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                      onPressed: () {
                        onSubmit(task);
                        widget.refreshState();
                        Navigator.pop(context);
                      },
                      child: const Text("Submit")),
                ),
              ],
            )));
  }
}
