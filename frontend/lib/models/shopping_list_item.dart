class ShoppingListItem {
  final int id;
  final String text;
  final String state;

  ShoppingListItem({required this.id, required this.text, required this.state});

  ShoppingListItem.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        text = json['text'] as String,
        state = json['state'] as String;
}
