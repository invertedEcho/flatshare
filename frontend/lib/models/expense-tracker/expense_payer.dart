class ExpensePayer {
  final int userId;
  final double percentagePaid;

  ExpensePayer({required this.userId, required this.percentagePaid});

  Map<String, dynamic> toJson() {
    return {'userId': userId, 'percentagePaid': percentagePaid};
  }
}
