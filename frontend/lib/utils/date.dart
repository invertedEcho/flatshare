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

String? stringifyMonthShort(int month) {
  switch (month) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      return null;
  }
}
