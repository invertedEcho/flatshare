import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/auth.dart';

import 'package:wg_app/main.dart';
import 'package:wg_app/models/user.dart';
import 'package:wg_app/user_provider.dart';

class LoginForm extends StatefulWidget {
  final VoidCallback onLogin;
  const LoginForm({super.key, required this.onLogin});

  @override
  LoginFormState createState() {
    return LoginFormState();
  }
}

class LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();

  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      try {
        var authResponse = await login(
          usernameController.text,
          passwordController.text,
        );
        var userFromResponse = authResponse.$1;
        var accessToken = authResponse.$2;

        if (!mounted) return;

        User user = User(
          // TODO: we should use the information we get from the backend.
          username: usernameController.text,
          email: userFromResponse.email,
          userId: userFromResponse.userId,
          groupId: userFromResponse.groupId,
        );

        Provider.of<UserProvider>(context, listen: false).setUser(user);

        await storage.write(key: 'jwt-token', value: accessToken);

        widget.onLogin();

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
                  labelText: 'Username',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a username';
                  }
                  return null;
                },
                controller: usernameController,
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
