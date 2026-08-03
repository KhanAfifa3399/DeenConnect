export function formatWallClockTime(isoLikeString) {
  if (!isoLikeString) return '';
  const timePart = isoLikeString.split('T')[1];
  if (!timePart) return '';
  const [hourStr, minuteStr] = timePart.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr} ${period}`;
}

export function formatWallClockDate(isoLikeString) {
  if (!isoLikeString) return '';
  const datePart = isoLikeString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
}