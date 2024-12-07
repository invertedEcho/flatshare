import 'dart:io';

import 'package:flatshare/const.dart';
import 'package:flatshare/fetch/shopping_list.dart';
import 'package:flatshare/main.dart';
import 'package:flatshare/models/shopping_list_item.dart';
import 'package:flatshare/providers/user.dart';
import 'package:flatshare/utils/env.dart';
import 'package:flutter/material.dart';
import 'package:flutter_glow/flutter_glow.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;

class ShoppingListWidget extends StatefulWidget {
  final int userGroupId;

  const ShoppingListWidget({super.key, required this.userGroupId});

  @override
  ShoppingListWidgetState createState() => ShoppingListWidgetState();
}

class ShoppingListWidgetState extends State<ShoppingListWidget> {
  final controller = TextEditingController();
  final formKey = GlobalKey<FormState>();

  late socket_io.Socket socket;
  var isConnected = false;

  // TODO: should use provider instead.
  List<ShoppingListItem> shoppingListItems = [];

  @override
  void initState() {
    super.initState();

    storage.read(key: 'jwt-token').then((token) {
      if (token == null) {
        return;
      }

      socket = socket_io.io(
        getApiBaseUrl(withApiSuffix: false),
        socket_io.OptionBuilder()
            .setTransports(['websocket'])
            .setExtraHeaders({'Authorization': 'Bearer $token'})
            .setQuery({'userGroupId': widget.userGroupId})
            .disableAutoConnect()
            .build(),
      );

      socket.onConnect((_) {
        if (mounted) {
          setState(() {
            isConnected = true;
          });
        }
      });

      // TODO: when disposing this widget, the socket gets disconnected, and we try to mutate the state, which causes an exception to be thrown
      // however, we do want to change the isConnected state when the socket disconnects, but even with the if mounted check the exception gets thrown
      // socket.onDisconnect((_) {
      //   if (mounted) {
      //     setState(() {
      //       isConnected = false;
      //     });
      //   }
      // });

      socket.onError((error) {
        if (error is SocketException) {
          if (error.osError?.errorCode == 111) {
            if (mounted) {
              setState(() {
                isConnected = false;
              });
            }
          }
        }
        // TODO: i really dont get whats going here, for some reason in this callback even if the user is still on this screen,
        // the widget gets unmounted and accessing context will fail, thus we need the extra mounted check
        // i guess i am not long enough in the flutter game yet.
        // maybe the widget gets remounted and in that time we try to show the snackbar
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error.toString())),
          );
        }
      });

      socket.on('shopping-list-item', (data) {
        var parsedItem = ShoppingListItem.fromJson(data);
        setState(() {
          shoppingListItems.insert(0, parsedItem);
        });
      });

      socket.on('update-shopping-list-item', (data) {
        var parsedItem = ShoppingListItem.fromJson(data);
        if (parsedItem.state == 'deleted') {
          return;
        }
        var itemsExceptUpdated = shoppingListItems
            .where((item) => item.id != parsedItem.id)
            .toList();
        itemsExceptUpdated.add(parsedItem);
        itemsExceptUpdated.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        setState(() {
          shoppingListItems = itemsExceptUpdated;
        });
      });

      socket.connect();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    var userProvider = Provider.of<UserProvider>(context, listen: false);
    var userGroupId = userProvider.userGroup?.id;
    if (userGroupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                'Failed to fetch initial shopping list items. Could not find your user group id. Try logging in again.')),
      );
    }
    fetchShoppingList(userGroupId: userGroupId!).then((items) {
      var nonDeletedItems =
          items.where((item) => item.state != 'deleted').toList();
      setState(() {
        shoppingListItems = nonDeletedItems;
      });
    });
  }

  List<Widget> getConnectionStatusRowWidgets() {
    if (isConnected) {
      return const [
        GlowIcon(
          Icons.link,
          glowColor: Colors.green,
        ),
        Text("Real-Time Synchronization: Connected")
      ];
    } else {
      return const [
        GlowIcon(
          Icons.link,
          glowColor: Colors.red,
        ),
        Text("Real-Time Synchronization: Not Connected")
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.all(generalRootPadding),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 0),
              child: Column(
                children: [
                  Row(
                    children: getConnectionStatusRowWidgets(),
                  ),
                  Form(
                      key: formKey,
                      child: TextFormField(
                        controller: controller,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter a title";
                          }
                          return null;
                        },
                        decoration: const InputDecoration(
                            labelText: "New Shopping List Item"),
                      )),
                  const SizedBox(height: generalSizedBoxHeight),
                  ElevatedButton(
                      onPressed: sendNewShoppingListItem,
                      child: const Text("Add")),
                  const SizedBox(height: generalSizedBoxHeight),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                  itemCount: shoppingListItems.length,
                  itemBuilder: (BuildContext context, int index) {
                    var shoppingListItem = shoppingListItems[index];
                    return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(13),
                        ),
                        elevation: generalElevation,
                        shadowColor: Colors.black,
                        child: Dismissible(
                            onDismissed: (_) {
                              updateShoppingListItem(
                                  shoppingListItem, 'deleted');
                              setState(() {
                                shoppingListItems.remove(shoppingListItem);
                              });
                            },
                            key: Key(shoppingListItem.id.toString()),
                            child: ListTile(
                              title: Row(
                                children: [
                                  Text(shoppingListItem.text),
                                  const SizedBox(width: 8),
                                ],
                              ),
                              subtitle: const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[],
                              ),
                              onTap: () {
                                final newState =
                                    shoppingListItem.state == 'purchased'
                                        ? 'pending'
                                        : 'purchased';
                                updateShoppingListItem(
                                    shoppingListItem, newState);
                              },
                              trailing: Checkbox(
                                onChanged: (bool? value) {
                                  final newState =
                                      shoppingListItem.state == 'purchased'
                                          ? 'pending'
                                          : 'purchased';
                                  updateShoppingListItem(
                                      shoppingListItem, newState);
                                },
                                value: shoppingListItem.state == 'purchased',
                              ),
                            )));
                  }),
            )
          ],
        ));
  }

  void sendNewShoppingListItem() {
    if (!formKey.currentState!.validate()) {
      return;
    }

    var userProvider = Provider.of<UserProvider>(context, listen: false);
    var userGroupId = userProvider.userGroup?.id;
    if (userGroupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                'Failed to upload new shopping list item. Could not find your user group id. Try logging in again.')),
      );
    }

    // TODO: we should use emit with ack to show error message to the user if something failed
    socket.emit("shopping-list-item",
        {'text': controller.text, 'userGroupId': userGroupId});
    controller.clear();
  }

  void updateShoppingListItem(
      ShoppingListItem shoppingListItem, String newState) {
    socket.emit('update-shopping-list-item',
        {'id': shoppingListItem.id, 'state': newState});
  }

  @override
  void dispose() {
    socket.off('shopping-list-item');
    socket.dispose();
    controller.dispose();
    super.dispose();
  }
}
