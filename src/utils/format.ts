export function formatDaysAgo(dateString: string, today: Date = new Date()) {
  const targetDate = new Date(dateString);
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const normalizedTarget = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );
  const diffDays = Math.round(
    (normalizedToday.getTime() - normalizedTarget.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return '오늘';
  }
  return `${diffDays}일 전`;
}

export function maskPhoneNumber(phoneNumber: string) {
  const segments = phoneNumber.split('-');
  if (segments.length !== 3) {
    return phoneNumber;
  }
  const [areaCode, middle, last] = segments;
  return `${areaCode}-${'*'.repeat(middle.length)}-${last}`;
}

export function maskName(name: string) {
  if (name.length <= 1) {
    return name;
  }
  if (name.length === 2) {
    return `${name[0]}*`;
  }
  const middleMaskLength = name.length - 2;
  return `${name[0]}${'*'.repeat(middleMaskLength)}${name[name.length - 1]}`;
}
