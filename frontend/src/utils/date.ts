export function addDays(date: Date, nDays: number) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + nDays);
  return newDate;
}

export function setTimeToZero(date: Date) {
  const newDate = new Date(date).setHours(0, 0, 0, 0);
  return new Date(newDate);
}

export function addMonth(date: Date, nMonths: number) {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + nMonths);
  return newDate;
}
