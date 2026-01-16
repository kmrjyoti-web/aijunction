
export function maskString(
  value: string | undefined | null,
  config: { visibleStart?: number; visibleEnd?: number; maskChar?: string }
): string {
  if (!value) {
    return '';
  }

  const visibleStart = config.visibleStart ?? 0;
  const visibleEnd = config.visibleEnd ?? 0;
  const maskChar = config.maskChar ?? '*';

  if (value.length <= visibleStart + visibleEnd) {
    return value; // Not enough characters to mask
  }

  const start = value.substring(0, visibleStart);
  const end = value.substring(value.length - visibleEnd);
  const middleLength = value.length - visibleStart - visibleEnd;
  
  // Ensure middleLength is not negative
  const middle = maskChar.repeat(Math.max(0, middleLength));

  return `${start}${middle}${end}`;
}
