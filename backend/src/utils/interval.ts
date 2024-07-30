export type DefaultPostgresInterval = '1 day' | '7 days' | '1 month';
export type DefaultDisplayInterval = 'Daily' | 'Weekly' | 'Monthly';

/** Maps the default display intervals we use in the frontend to the format that postgres expects. */
export const displayIntervalToPostgresInterval = {
  Daily: '1 day',
  Weekly: '7 days',
  Monthly: '1 month',
} satisfies Record<DefaultDisplayInterval, DefaultPostgresInterval>;

// TODO: Right now, we just use a nicely formatted interval for the title for recurring task groups
// In the future we will allow the user to specify the title for a task group.
export function getLongNameFromPostgresInterval(
  interval: DefaultPostgresInterval,
) {
  switch (interval) {
    case '1 day':
      return 'Every day';
    case '7 days':
      return 'Every week';
    case '1 month':
      return 'Every month';
  }
}
