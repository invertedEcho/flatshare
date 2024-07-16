import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/user_group.dart';
import 'package:wg_app/models/user_group.dart';
import 'package:wg_app/providers/user.dart';

class JoinGroup extends StatefulWidget {
  const JoinGroup({super.key});

  @override
  JoinGroupState createState() {
    return JoinGroupState();
  }
}

class JoinGroupState extends State<JoinGroup> {
  final _formKey = GlobalKey<FormState>();

  final inviteCodeController = TextEditingController();

  handleSubmit() async {
    if (!(_formKey.currentState!.validate())) {
      return;
    }
    final inviteCode = inviteCodeController.text;
    UserProvider userProvider =
        Provider.of<UserProvider>(context, listen: false);
    final user = userProvider.user;
    if (user == null) {
      throw Exception(
          "Unexpected error: user was null in the join group widget");
    }

    try {
      final UserGroup userGroup = await joinGroupByInviteCode(
          userId: user.userId, inviteCode: inviteCode);
      userProvider.setUserGroup(userGroup);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Joined group!')),
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
                    decoration: const InputDecoration(
                        icon: Icon(Icons.password), labelText: "Invite Code"),
                    controller: inviteCodeController,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return "Please enter a valid invite code.";
                      }
                      return null;
                    },
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
                        child: Text('Join'),
                      ),
                    ),
                  ),
                ],
              ),
            )));
  }
}
