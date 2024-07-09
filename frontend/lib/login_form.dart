import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wg_app/fetch/auth.dart';

import 'package:wg_app/main.dart';
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
        var authRes = await login(
          usernameController.text,
          passwordController.text,
        );

        if (!mounted) return;

        AuthResponse user = AuthResponse(
          username: usernameController.text,
          email: authRes.email,
          accessToken: authRes.accessToken,
          userId: authRes.userId,
          groupId: authRes.groupId,
        );

        Provider.of<UserProvider>(context, listen: false).setUser(user);

        await storage.write(key: 'jwt-token', value: authRes.accessToken);

        widget.onLogin();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login Successful!')),
        );
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to login: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
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
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
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
            FilledButton(
              onPressed: _handleLogin, // call the refactored method
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
}

class AuthResponse {
  final String? accessToken;
  final int userId;
  final int? groupId; // Mark groupId as nullable
  final String email;
  final String username;

  const AuthResponse(
      {required this.accessToken,
      required this.userId,
      this.groupId, // No need for required here, as it's nullable
      required this.email,
      required this.username});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String?,
      userId: json['userId'] as int,
      groupId: json['groupId'] as int?, // Handle null case by casting to int?
      email: json['email'] as String,
      username: json['username'] as String,
    );
  }
}

// user_model.dart
class User {
  final String username;
  final String email;
  final String? accessToken;
  final int userId;
  final int? groupId;

  User({
    required this.username,
    required this.email,
    required this.accessToken,
    required this.userId,
    this.groupId,
  });
}
