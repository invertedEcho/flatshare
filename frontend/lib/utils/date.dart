String parseToDueDate(DateTime dueDate) {
  print("Due date: $dueDate");
  final diffInDays = dueDate.difference(DateTime.now()).inDays;
  if (diffInDays == 0) {
    return "Due today";
  }
  return "Due in $diffInDays days";
}
