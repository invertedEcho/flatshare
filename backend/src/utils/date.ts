import { DefaultPostgresInterval } from './interval';

// TODO: this will only work for UTC+2, overall we need to add a local time zone in the recurring task group and do all the stuff dynamic.
export function getStartOfInterval(interval: DefaultPostgresInterval): Date {
  //HOTFIX: This seems very hacky. We should think of something more elegant to handle this in the future, also consider the case when
  //  assignment scheduler runs during the changing days of DST.
  // Function to check if the current date is in the DST period (from last Sunday in March to last Sunday in October)
  const isDSTPeriod = (date: Date) => {
    const year = date.getFullYear();
    const lastSundayInMarch = new Date(year, 2, 31); // Start from March 31
    lastSundayInMarch.setDate(
      lastSundayInMarch.getDate() - lastSundayInMarch.getDay(),
    ); // Find the last Sunday in March
    const lastSundayInOctober = new Date(year, 9, 31); // Start from October 31
    lastSundayInOctober.setDate(
      lastSundayInOctober.getDate() - lastSundayInOctober.getDay(),
    ); // Find the last Sunday in October
    return date >= lastSundayInMarch && date < lastSundayInOctober;
  };

  // Determine target hour based on whether it's DST period
  const targetHour = isDSTPeriod(new Date()) ? 22 : 23; // 22:00 during DST, 23:00 afterward

  switch (interval) {
    // Go back to previous day at the calculated target hour
    case '1 day': {
      const todayTargetTime = new Date();
      todayTargetTime.setHours(targetHour, 0, 0, 0); // Set to target hour (22 or 23 based on DST)

      // Go back to previous day
      return new Date(todayTargetTime.setDate(todayTargetTime.getDate() - 1));
    }

    // Go back to previous Sunday at the calculated target hour
    case '7 days': {
      const now = new Date();
      const todayTargetTime = new Date(now);
      todayTargetTime.setHours(targetHour, 0, 0, 0); // Set to target hour (22 or 23 based on DST)

      if (now.getDay() === 0 && now.getTime() >= todayTargetTime.getTime()) {
        // If it's Sunday and past target hour, return today at the target hour
        return todayTargetTime;
      } else {
        // Otherwise, find the previous Sunday at target hour
        const previousSundayTargetTime = new Date(todayTargetTime);
        const daysSinceSunday = (now.getDay() + 7) % 7;
        previousSundayTargetTime.setDate(
          previousSundayTargetTime.getDate() - daysSinceSunday,
        );

        if (now.getDay() === 0 && now.getTime() < todayTargetTime.getTime()) {
          // If it's Sunday but before target hour, go back to the previous Sunday
          previousSundayTargetTime.setDate(
            previousSundayTargetTime.getDate() - 7,
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
        now.getFullYear(),
        now.getMonth(),
        1,
      );
      const dayBeforeFirstDayOfCurrentMonth = new Date(firstDayOfCurrentMonth);
      dayBeforeFirstDayOfCurrentMonth.setDate(
        dayBeforeFirstDayOfCurrentMonth.getDate() - 1,
      );
      dayBeforeFirstDayOfCurrentMonth.setHours(targetHour, 0, 0, 0); // Set to target hour (22 or 23 based on DST)
      return dayBeforeFirstDayOfCurrentMonth;
  }
}

export function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setUTCDate(date.getUTCDate() + days);
  return newDate;
}
