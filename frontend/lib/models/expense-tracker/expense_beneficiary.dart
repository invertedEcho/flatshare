class ExpenseBeneficiary {
  final int userId;
  final double percentageShare;
  // nullable because when adding new expense item we cant know the expenseitemid yet
  final int? expenseItemId;

  ExpenseBeneficiary(
      {required this.userId,
      required this.percentageShare,
      this.expenseItemId});

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'percentageShare': percentageShare,
      'expenseItemId': expenseItemId
    };
  }

  ExpenseBeneficiary.fromJson(Map<String, dynamic> json)
      : userId = json['userId'] as int,
        percentageShare = double.parse(json['percentageShare'].toString()),
        expenseItemId = json['expenseItemId'] as int?;
}
