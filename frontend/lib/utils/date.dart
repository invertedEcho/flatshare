String stringifyDueDate(DateTime dueDate) {
  DateTime localDueDate = dueDate.toLocal();
  DateTime localDueDateWithoutTime =
      DateTime(localDueDate.year, localDueDate.month, localDueDate.day);
  DateTime localNow = DateTime.now();
  localNow = DateTime(localNow.year, localNow.month, localNow.day);

  final diffInDays = localDueDateWithoutTime.difference(localNow).inDays;

  if (diffInDays == 0) {
    return "Due today";
  }
  if (diffInDays == 1) {
    return "Due in $diffInDays day";
  }
  return "Due in $diffInDays days";
}
