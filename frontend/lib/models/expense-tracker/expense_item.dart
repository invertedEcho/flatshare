class ExpenseItem {
  // TODO: the id is nullable here, as we also use this model when posting a expense item created in the ui to the backend, so we dont have a id yet.
  final int? id;
  final String title;
  final String? description;
  final int amount;
  final int userGroupId;
  final DateTime createdAt;

  ExpenseItem(
      {this.id,
      required this.title,
      this.description,
      required this.amount,
      required this.userGroupId,
      required this.createdAt});

  ExpenseItem.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        title = json['title'] as String,
        description = json['description'] as String,
        amount = json['amount'] as int,
        userGroupId = json['userGroupId'] as int,
        createdAt = DateTime.parse(json['createdAt'] as String);

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'amount': amount,
      'userGroupId': userGroupId,
      'createdAt': createdAt
    };
  }

  @override
  String toString() {
    return title;
  }
}
