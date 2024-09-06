import { DefaultPostgresInterval } from './interval';

// TODO: this will only work for UTC+2, overall we need to add a local time zone in the recurring task group and do all the stuff dynamic.
export function getStartOfInterval(interval: DefaultPostgresInterval): Date {
  switch (interval) {
    // Go back to previous day at 22 o clock
    case '1 day': {
      const today10Pm = new Date().setUTCHours(22, 0, 0, 0);
      return new Date(
        new Date(today10Pm).setUTCDate(new Date(today10Pm).getUTCDate() - 1),
      );
    }
    // Go back to previous sunday at 22 0 clock
    case '7 days': {
      const now = new Date();
      const today10Pm = new Date(now);
      today10Pm.setUTCHours(22, 0, 0, 0);

      if (now.getUTCDay() === 0 && now.getTime() >= today10Pm.getTime()) {
        // If it's Sunday and past 22:00, return today at 22:00
        return today10Pm;
      } else {
        // Otherwise, find the previous Sunday at 22:00
        const previousSunday10Pm = new Date(today10Pm);
        const daysSinceSunday = (now.getUTCDay() + 7) % 7;
        previousSunday10Pm.setUTCDate(
          previousSunday10Pm.getUTCDate() - daysSinceSunday,
        );
        if (now.getUTCDay() === 0 && now.getTime() < today10Pm.getTime()) {
          // If it's Sunday but before 22:00, go back to the previous Sunday
          previousSunday10Pm.setUTCDate(previousSunday10Pm.getUTCDate() - 7);
        }
        return previousSunday10Pm;
      }
    }
    // Go back to last day of previous month at 22 o clock
    case '1 month':
    case '1 mon':
      const now = new Date();
      const firstDayOfCurrentMonth = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
      );
      const dayBeforeFirstDayOfCurrentMonth = new Date(firstDayOfCurrentMonth);
      dayBeforeFirstDayOfCurrentMonth.setUTCDate(
        dayBeforeFirstDayOfCurrentMonth.getUTCDate() - 1,
      );
      dayBeforeFirstDayOfCurrentMonth.setUTCHours(22, 0, 0, 0);
      return dayBeforeFirstDayOfCurrentMonth;
  }
}

export function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setUTCDate(date.getUTCDate() + days);
  return newDate;
}
