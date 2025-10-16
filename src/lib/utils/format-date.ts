export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  locale: string = 'en-US',
): string => {
  const value = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid date supplied to formatDate');
  }

  return new Intl.DateTimeFormat(locale, options).format(value);
};
