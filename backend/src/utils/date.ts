import { DefaultPostgresInterval } from './interval';

// TODO: this will only work for UTC+2, overall we need to add a local time zone in the recurring task group and do all the stuff dynamic.
export function getStartOfInterval(interval: DefaultPostgresInterval): Date {
  // HOTFIX: This seems very hacky. We should think of something more elegant to handle this in the future, also consider the case when
  //  assignment scheduler runs during the changing days of DST.
  // Determine target hour based on whether it's DST period
  const targetHour = getIsDSTPeroid(new Date()) ? 22 : 23; // 22:00 during DST, 23:00 afterward

  switch (interval) {
    // Go back to previous day at the calculated target hour
    case '1 day': {
      const todayTargetTime = new Date();
      todayTargetTime.setUTCHours(targetHour, 0, 0, 0); // Set to target hour (22 or 23 based on DST)

      // Go back to previous day
      return new Date(
        todayTargetTime.setUTCDate(todayTargetTime.getUTCDate() - 1),
      );
    }

    // Go back to previous Sunday at the calculated target hour
    case '7 days': {
      const now = new Date();
      const todayTargetTime = new Date(now);
      todayTargetTime.setUTCHours(targetHour, 0, 0, 0); // Set to target hour (22 or 23 based on DST)

      if (now.getUTCDay() === 0 && now.getTime() >= todayTargetTime.getTime()) {
        // If it's Sunday and past target hour, return today at the target hour
        return todayTargetTime;
      } else {
        // Otherwise, find the previous Sunday at target hour
        const previousSundayTargetTime = new Date(todayTargetTime);
        const daysSinceSunday = (now.getUTCDay() + 7) % 7;
        previousSundayTargetTime.setUTCDate(
          previousSundayTargetTime.getUTCDate() - daysSinceSunday,
        );

        if (
          now.getUTCDay() === 0 &&
          now.getTime() < todayTargetTime.getTime()
        ) {
          // If it's Sunday but before target hour, go back to the previous Sunday
          previousSundayTargetTime.setUTCDate(
            previousSundayTargetTime.getUTCDate() - 7,
          );
        }

        return previousSundayTargetTime;
      }
    }

    // Go back to last day of previous month at the calculated target hour
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
      dayBeforeFirstDayOfCurrentMonth.setUTCHours(targetHour, 0, 0, 0); // Set to target hour (22 or 23 based on DST)
      return dayBeforeFirstDayOfCurrentMonth;
  }
}

export function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setUTCDate(date.getUTCDate() + days);
  return newDate;
}

export function getIsDSTPeroid(date: Date) {
  const year = date.getFullYear();
  const lastSundayInMarch = new Date(year, 2, 31);
  lastSundayInMarch.setUTCDate(
    lastSundayInMarch.getDate() - lastSundayInMarch.getDay(),
  );
  const lastSundayInOctober = new Date(year, 9, 31);
  lastSundayInOctober.setUTCDate(
    lastSundayInOctober.getDate() - lastSundayInOctober.getDay(),
  );
  return date >= lastSundayInMarch && date < lastSundayInOctober;
}
