/**
 * Maps a display interval we use in the frontend to the format that postgres expects.
 *
 * @param interval The display interval to format
 *
 * @returns A string compatible with the format that postgres expects, or undefined if the interval doesn't exist
 */
export function getPgIntervalFromDisplayInterval(interval: string) {
  switch (interval) {
    case 'Daily':
      return '1 day';
    case 'Weekly':
      return '7 days';
    case 'Monthly':
      return '1 month';
    default:
      return undefined;
  }
}

// TODO: Right now, we just use a nicely formatted interval for the title for recurring task groups
// In the future we will allow the user to specify the title for a task group.
export function getTaskGroupTitleFromInterval(interval: string) {
  switch (interval) {
    case '1 day':
      return 'Every day';
    case '7 days':
      return 'Every week';
    case '1 month':
      return 'Every month';
    default:
      return undefined;
  }
}
