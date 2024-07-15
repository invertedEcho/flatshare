import 'package:animated_custom_dropdown/custom_dropdown.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/task_group.dart';
import 'package:wg_app/fetch/user_group.dart';
import 'package:wg_app/models/task.dart';
import 'package:wg_app/models/user.dart';
import 'package:wg_app/user_provider.dart';

class CreateTaskGroup extends StatefulWidget {
  const CreateTaskGroup({super.key});

  @override
  CreateTaskGroupState createState() {
    return CreateTaskGroupState();
  }
}

List<String> intervalTypes = ['days', 'weeks', 'months'];

class CreateTaskGroupState extends State<CreateTaskGroup> {
  final _formKey = GlobalKey<FormState>();
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final multiSelectUserController = MultiSelectController<User>([]);
  final intervalCountController = TextEditingController();
  final intervalTypeController = FixedExtentScrollController();

  List<User> userInUserGroups = [];
  DateTime selectedDate = DateTime.now();

  // TODO: we should not do async operations in this method, as it could cause unneccessary rebuilds
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final userProvider = Provider.of<UserProvider>(context, listen: false);
    User? user = userProvider.user;
    final groupId = user?.groupId;
    if (groupId != null) {
      // TODO: I think this is pretty bad, we should probably move to a FutureBuilder instead.
      fetchUsersInUserGroup(groupId: groupId).then((result) {
        setState(() {
          userInUserGroups = result;
        });
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
        context: context, firstDate: DateTime.now(), lastDate: DateTime(2101));
    if (pickedDate != null && pickedDate != selectedDate) {
      setState(() {
        selectedDate = pickedDate;
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
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // TODO: we already get the user group id above.
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    User? user = userProvider.user;
    final groupId = user?.groupId;

    if (groupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Unexpected error: userGroupId was null.')),
      );
      return;
    }

    String title = titleController.text;
    String description = descriptionController.text;
    List<int> selectedUserIds = multiSelectUserController.value
        .map((selectUser) => selectUser.userId)
        .toList();
    String interval =
        "${intervalCountController.text} ${intervalTypes[intervalTypeController.selectedItem]}";
    try {
      await createTaskGroup(
          title: title,
          description: description,
          interval: interval.replaceAll("months", 'mons'),
          userIds: selectedUserIds,
          initialStartDate: selectedDate.toString(),
          userGroupId: groupId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Created new task group!')),
      );
      // Navigator.of(context).pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
        appBar: AppBar(title: const Text("Create a new Task Group")),
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
                    CustomDropdown.multiSelect(
                      multiSelectController: multiSelectUserController,
                      items: userInUserGroups,
                      onListChanged: (value) {},
                      hintText: "Select users",
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                            child: Text("Every",
                                style: theme.textTheme.bodyLarge)),
                        Expanded(
                            child: TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter an interval count';
                            }
                            return null;
                          },
                          controller: intervalCountController,
                          keyboardType: TextInputType.number,
                        )),
                        Expanded(
                          child: CupertinoPicker(
                              scrollController: intervalTypeController,
                              itemExtent: 40,
                              onSelectedItemChanged: (value) {},
                              children: intervalTypes.map((item) {
                                return Center(child: Text(item));
                              }).toList()),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Start Date: "),
                        ElevatedButton(
                            onPressed: () => _selectDate(context),
                            child: Text('${selectedDate.toLocal()}'))
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                            onPressed: handleSubmit,
                            child: const Text("Submit"))),
                  ],
                ))));
  }
}
