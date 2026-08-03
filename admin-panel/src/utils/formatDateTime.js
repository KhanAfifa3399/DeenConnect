export function formatWallClockTime(isoLikeString) {
  if (!isoLikeString) return '';
  const timePart = isoLikeString.split('T')[1];
  if (!timePart) return '';
  const [hourStr, minuteStr] = timePart.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

export function formatWallClockDate(isoLikeString) {
  if (!isoLikeString) return '';
  const datePart = isoLikeString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${month}/${day}/${year}`;
}