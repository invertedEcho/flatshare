enum IntervalType { days, weeks, months }

String parseToDueDate(DateTime dueDate) {
  String diffInDays = DateTime.now().difference(dueDate).inDays.toString();
  return "${diffInDays}d";
}

String convertInterval(IntervalType intervalType, int intervalCount) {
  return "";
}
