class ShoppingListItem {
  final int id;
  final String text;
  final String state;
  final DateTime createdAt;

  ShoppingListItem(
      {required this.id,
      required this.text,
      required this.state,
      required this.createdAt});

  ShoppingListItem.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        text = json['text'] as String,
        state = json['state'] as String,
        createdAt = DateTime.parse(json['createdAt'] as String);
}
