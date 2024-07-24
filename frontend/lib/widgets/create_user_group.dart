import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CreateUserGroup extends StatefulWidget {
  const CreateUserGroup({super.key});

  @override
  CreateUserGroupState createState() {
    return CreateUserGroupState();
  }
}

class CreateUserGroupState extends State<CreateUserGroup> {
  final _formKey = GlobalKey<FormState>();

  final userGroupNameController = TextEditingController();

  void handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    String userGroupName = userGroupNameController.text;
    try {
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      UserGroup userGroup = await createUserGroup(userGroupName: userGroupName);
      await joinUserGroupById(
          userId: userProvider.user!.userId, groupId: userGroup.id);
      userProvider.setUserGroup(userGroup);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Created group!')),
      );
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Form(
            key: _formKey,
            child: Padding(
              padding: const EdgeInsets.all(30),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextFormField(
                    controller: userGroupNameController,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return "Please enter a name for your group";
                      }
                      return null;
                    },
                    decoration: const InputDecoration(labelText: "Name"),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      style: ButtonStyle(
                          shape:
                              WidgetStateProperty.all<RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12)))),
                      onPressed: handleSubmit,
                      child: const Padding(
                        padding: EdgeInsets.all(14.0),
                        child: Text('Create'),
                      ),
                    ),
                  ),
                ],
              ),
            )));
  }
}
