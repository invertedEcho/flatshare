import 'dart:convert';

import 'package:flatshare/main.dart';
import 'package:flatshare/models/shopping_list_item.dart';
import 'package:flatshare/utils/env.dart';

Future<List<ShoppingListItem>> fetchShoppingList(
    {required int userGroupId}) async {
  final apiBaseUrl = getApiBaseUrl();
  final url = Uri.parse('$apiBaseUrl/shopping-list/$userGroupId');
  final response = await authenticatedClient.get(url);

  if (response.statusCode != 200) {
    throw Exception("Failed to load shopping list");
  }

  List<dynamic> shoppingListItems = jsonDecode(response.body);
  return shoppingListItems
      .map<ShoppingListItem>(
          (assignment) => ShoppingListItem.fromJson(assignment))
      .toList();
}
