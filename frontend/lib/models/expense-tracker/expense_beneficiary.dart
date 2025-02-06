class ExpenseBeneficiary {
  final int userId;
  final double percentageShare;

  ExpenseBeneficiary({required this.userId, required this.percentageShare});

  Map<String, dynamic> toJson() {
    return {'userId': userId, 'percentageShare': percentageShare};
  }
}
