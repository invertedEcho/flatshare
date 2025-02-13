String stringifyCentAmount(double amount) {
  String inEur = (amount / 100).toStringAsFixed(2);

  // ignore rounding issues
  if (inEur == "-0.00") {
    return "0.00€";
  }

  return "$inEur€";
}
