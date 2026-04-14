/**
 * Sunday 00:00:00.000 UTC for the UTC week containing `d`
 * (week runs Sunday–Saturday).
 */

// It finds the start of the current week (Sunday 00:00 UTC)
export function startOfUtcWeekSunday(d: Date): Date {
  // gets value of the day, ex sunday=0, monday=1, ... saturday=6
  const day = d.getUTCDay();
  // We avoid mutating original date, so copy the date
  const x = new Date(d);
  // If today is Thursday (day = 4): subtract 4 days → Sunday
  // x.getUTCDate() → gives the day of the month
  x.setUTCDate(x.getUTCDate() - day);
  // Reset time, now it becomes Sunday 00:00:00 UTC
  x.setUTCHours(0, 0, 0, 0);
  return x;
}


// we need this for comparison of last week vs this week, to calculate the percent change