class ExpenseItem {
  final int? id;
  final String title;
  final String? description;
  final int amount;
  final int userGroupId;

  ExpenseItem(
      {this.id,
      required this.title,
      this.description,
      required this.amount,
      required this.userGroupId});

  ExpenseItem.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        title = json['title'] as String,
        description = json['description'] as String,
        amount = json['amount'] as int,
        userGroupId = json['userGroupId'] as int;

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'amount': amount,
      'userGroupId': userGroupId
    };
  }

  @override
  String toString() {
    return title;
  }
}
