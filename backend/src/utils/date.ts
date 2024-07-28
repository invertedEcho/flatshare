// TODO: this will only work for UTC+2, overall we need to add a local time zone in the recurring task group and do all the stuff dynamic.
export function getDefaultInitialStartDateForInterval(interval: string) {
  switch (interval) {
    case '1 day': {
      const today10Pm = new Date().setUTCHours(22, 0, 0, 0);
      return new Date(today10Pm).setDate(new Date(today10Pm).getDate() - 1);
    }
    case '7 days': {
      const today10Pm = new Date().setUTCHours(22, 0, 0, 0);
      return new Date(today10Pm).setDate(new Date(today10Pm).getDate() - 1);
    }
  }
}
