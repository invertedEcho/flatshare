import 'package:flatshare/fetch/auth.dart';
import 'package:flatshare/fetch/user_group.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/models/user.dart';
import 'package:flatshare/models/user_group.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  LoginFormState createState() {
    return LoginFormState();
  }
}

class LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      String email = emailController.text;
      String password = passwordController.text;
      var accessToken = await login(
        email,
        password,
      );
      await storage.write(key: 'jwt-token', value: accessToken);

      if (!mounted) return;

      User user = await getProfile();

      UserGroup? userGroup = await fetchUserGroupForUser(userId: user.userId);

      var userProvider = Provider.of<UserProvider>(context, listen: false);

      userProvider.setUser(user);

      if (userGroup != null) {
        userProvider.setUserGroup(userGroup);
      }

      context.go("/home");

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login Successful!')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e')),
        );
      }
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
            children: <Widget>[
              TextFormField(
                decoration: const InputDecoration(
                  icon: Icon(Icons.person),
                  labelText: 'Email',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an email';
                  }
                  return null;
                },
                controller: emailController,
              ),
              // TODO: move this padding to the button instead, use EdgeInsets.symmetric(vertical: 16)
              Padding(
                padding: const EdgeInsets.only(bottom: 22.0, top: 8.0),
                child: TextFormField(
                  decoration: const InputDecoration(
                    icon: Icon(Icons.password),
                    labelText: 'Password',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a password';
                    }
                    return null;
                  },
                  obscureText: true,
                  controller: passwordController,
                ),
              ),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: ButtonStyle(
                      backgroundColor:
                          const WidgetStatePropertyAll(Colors.blueAccent),
                      foregroundColor:
                          const WidgetStatePropertyAll(Colors.white),
                      shape: WidgetStateProperty.all<RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)))),
                  onPressed: _handleLogin,
                  child: const Padding(
                    padding: EdgeInsets.all(14.0),
                    child: Text('Login'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
