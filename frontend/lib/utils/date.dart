String parseToDueDate(DateTime dueDate) {
  String diffInDays = DateTime.now().difference(dueDate).inDays.toString();
  return "Due in: ${diffInDays}d";
}
