import 'package:flatshare/providers/task.dart';
import 'package:flatshare/widgets/tasks/edit_task_form.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class TaskList extends StatelessWidget {
  const TaskList({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<TaskProvider>(
      builder: (context, taskProvider, child) {
        if (taskProvider.tasks.isEmpty) {
          return const Center(child: Text("No tasks found."));
        }

        return ListView.builder(
          itemCount: taskProvider.tasks.length,
          itemBuilder: (context, index) {
            final task = taskProvider.tasks[index];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              // TODO: fix black edges visible when swiping dismissible
              child: Dismissible(
                direction: DismissDirection.endToStart,
                key: Key(task.id.toString()),
                onDismissed: (direction) async {
                  Provider.of<TaskProvider>(context, listen: false)
                      .removeTask(task.id);
                },
                confirmDismiss: (DismissDirection direction) async {
                  return await showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text("Are you sure?"),
                          content: const Text(
                              "Are you really sure you want to delete this task? This will also delete all current assignments that exist for this task."),
                          actions: [
                            TextButton(
                                onPressed: () async {
                                  Navigator.of(context).pop(false);
                                },
                                child: const Text("Abort")),
                            TextButton(
                                onPressed: () async {
                                  Navigator.of(context).pop(true);
                                },
                                child: const Text("Confirm"))
                          ],
                        );
                      });
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
                              Text(task.description ?? "")
                            ],
                          ),
                          ElevatedButton(
                              onPressed: () {
                                showModalBottomSheet<void>(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return Padding(
                                        padding: const EdgeInsets.all(16.0),
                                        child: SizedBox(
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
                                                )
                                              ],
                                            )),
                                      );
                                    });
                              },
                              child: const Icon(Icons.edit))
                        ],
                      )),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
