export const MILLISECOND_UNITS = ['Ms', 'Msec', 'Msecs', 'Millisecond', 'Milliseconds'] as const
export const SECOND_UNITS = ['S', 'Sec', 'Second', 'Secs', 'Seconds'] as const
export const MINUTE_UNITS = ['M', 'Min', 'Mins', 'Minute', 'Minutes'] as const
export const HOUR_UNITS = ['H', 'Hour', 'Hours'] as const
export const DAY_UNITS = ['D', 'Day', 'Days'] as const
export const WEEK_UNITS = ['W', 'Week', 'Weeks'] as const
export const MONTH_UNITS = ['Month', 'Months'] as const
export const YEAR_UNITS = ['Year', 'Years'] as const

export const ALL_UNITS = [
  ...MILLISECOND_UNITS,
  ...MINUTE_UNITS,
  ...HOUR_UNITS,
  ...DAY_UNITS,
  ...WEEK_UNITS,
  ...MONTH_UNITS,
  ...YEAR_UNITS,
] as const
