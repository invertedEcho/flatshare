import { DefaultPostgresInterval } from './interval';

// TODO: this will only work for UTC+2, overall we need to add a local time zone in the recurring task group and do all the stuff dynamic.
export function getStartOfInterval(interval: DefaultPostgresInterval): Date {
  switch (interval) {
    // Go back to previous day at 22 o clock
    case '1 day': {
      const today10Pm = new Date().setUTCHours(22, 0, 0, 0);
      return new Date(
        new Date(today10Pm).setDate(new Date(today10Pm).getDate() - 1),
      );
    }
    // Go back to previous sunday at 22 0 clock
    case '7 days': {
      const now = new Date();
      const today10Pm = new Date(now);
      today10Pm.setUTCHours(22, 0, 0, 0);

      if (now.getDay() === 0 && now.getTime() >= today10Pm.getTime()) {
        // If it's Sunday and past 22:00, return today at 22:00
        return today10Pm;
      } else {
        // Otherwise, find the previous Sunday at 22:00
        const previousSunday10Pm = new Date(today10Pm);
        const daysSinceSunday = (now.getDay() + 7) % 7;
        previousSunday10Pm.setDate(
          previousSunday10Pm.getDate() - daysSinceSunday,
        );
        if (now.getDay() === 0 && now.getTime() < today10Pm.getTime()) {
          // If it's Sunday but before 22:00, go back to the previous Sunday
          previousSunday10Pm.setDate(previousSunday10Pm.getDate() - 7);
        }
        return previousSunday10Pm;
      }
    }
    // Go back to last day of previous month at 22 o clock
    case '1 month':
      const now = new Date();
      const firstDayOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );
      const dayBeforeFirstDayOfCurrentMonth = new Date(firstDayOfCurrentMonth);
      dayBeforeFirstDayOfCurrentMonth.setDate(
        dayBeforeFirstDayOfCurrentMonth.getDate() - 1,
      );
      dayBeforeFirstDayOfCurrentMonth.setUTCHours(22, 0, 0, 0);
      return dayBeforeFirstDayOfCurrentMonth;
  }
}
