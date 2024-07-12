import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:flutter/material.dart';
import 'package:wg_app/fetch/group.dart';
import 'package:wg_app/fetch/tasks.dart';
import 'package:wg_app/models/user.dart';

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

  List<User> userInGroups = [];

  @override
  void initState() {
    super.initState();
    fetchUsersInGroup(groupId: 4).then((result) {
      setState(() {
        userInGroups = result;
      });
    });
  }

  void handleSubmit() async {
    if (_formKey.currentState!.validate()) {
      String title = titleController.text;
      String description = descriptionController.text;
      List<int> selectedUserIds = multiSelectUserController.value
          .map((selectUser) => selectUser.userId)
          .toList();
      try {
        await createTask(
            title: title,
            description: description,
            groupId: 4,
            userIds: selectedUserIds);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Created new task!')),
        );
        Navigator.of(context).pop(); // Navigate back to the previous screen
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
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a description';
                        }
                        return null;
                      },
                      decoration: const InputDecoration(
                          labelText: "Description (optional)"),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: CustomDropdown.multiSelect(
                          multiSelectController: multiSelectUserController,
                          decoration: const CustomDropdownDecoration(
                              listItemStyle: TextStyle(color: Colors.black),
                              hintStyle: TextStyle(color: Colors.black)),
                          hintText: "Select users",
                          items: userInGroups,
                          onListChanged: (value) {}),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: ElevatedButton(
                          onPressed: handleSubmit, child: const Text("Submit")),
                    )
                  ],
                ))));
  }
}
