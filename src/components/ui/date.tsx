type DateValue = string | number | Date;

interface DateDisplayProps {
  value?: DateValue | null;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  locale?: string;
  className?: string;
}

export const formatDateText = (
  value?: DateValue | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = '-',
  locale = 'ko-KR'
): string => {
  if (value === null || value === undefined || value === '') return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, options).format(date).replace(/\.\s*$/, '');
};

export function DateDisplay({
  value,
  options,
  fallback = '-',
  locale = 'ko-KR',
  className,
}: DateDisplayProps) {
  const text = formatDateText(value, options, fallback, locale);
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  const dateTime = date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined;

  return (
    <time dateTime={dateTime} className={className}>
      {text}
    </time>
  );
}
