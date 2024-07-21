import 'package:flatshare/fetch/auth.dart';
import 'package:flutter/material.dart';

class RegisterForm extends StatefulWidget {
  final VoidCallback onRegister;
  final String? maybeInviteCode;
  const RegisterForm(
      {super.key, required this.onRegister, this.maybeInviteCode});

  @override
  RegisterFormState createState() {
    return RegisterFormState();
  }
}

class RegisterFormState extends State<RegisterForm> {
  final _formKey = GlobalKey<FormState>();

  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final emailController = TextEditingController();

  @override
  void dispose() {
    usernameController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_formKey.currentState!.validate()) {
      try {
        await register(usernameController.text, passwordController.text,
            emailController.text, widget.maybeInviteCode);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully registered!')),
        );
        widget.onRegister();
      } catch (e) {
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
              if (widget.maybeInviteCode != null)
                Text(
                    "Note: After registering, you will automatically join the User Group with this invite code: ${widget.maybeInviteCode}"),
              TextFormField(
                  decoration: const InputDecoration(
                      icon: Icon(Icons.person), labelText: 'Username'),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a username';
                    }
                    return null;
                  },
                  controller: usernameController),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: TextFormField(
                    textCapitalization: TextCapitalization.none,
                    autocorrect: false,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                        icon: Icon(Icons.email), labelText: 'Email'),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter an Email';
                      }
                      return null;
                    },
                    controller: emailController),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 22.0, top: 8.0),
                child: TextFormField(
                    obscureText: true,
                    decoration: const InputDecoration(
                        icon: Icon(Icons.password), labelText: 'Password'),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a password';
                      }
                      return null;
                    },
                    controller: passwordController),
              ),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: ButtonStyle(
                      shape: WidgetStateProperty.all<RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)))),
                  onPressed: _handleRegister,
                  child: const Padding(
                    padding: EdgeInsets.all(14.0),
                    child: Text('Register'),
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
