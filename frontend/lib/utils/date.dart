String parseToDueDate(DateTime dueDate) {
  final diffInDays = dueDate.difference(DateTime.now()).inDays;
  if (diffInDays == 0) {
    return "Due today";
  }
  return "Due in: ${diffInDays}d";
}
