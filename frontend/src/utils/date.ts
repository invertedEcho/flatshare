export function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

export function setTimeToZero(date: Date) {
  const newDate = new Date(date).setHours(0, 0, 0, 0);
  return new Date(newDate);
}
