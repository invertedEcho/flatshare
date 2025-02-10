class ExpensePayer {
  final int userId;
  final double percentagePaid;
  // nullable because when adding new expense item we cant know the expenseitemid yet
  final int? expenseItemId;

  ExpensePayer(
      {required this.userId, required this.percentagePaid, this.expenseItemId});

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'percentagePaid': percentagePaid,
      'expenseItemId': expenseItemId
    };
  }

  ExpensePayer.fromJson(Map<String, dynamic> json)
      : userId = json['userId'] as int,
        percentagePaid = double.parse(json['percentagePaid'].toString()),
        expenseItemId = json['expenseItemId'] as int?;
}
