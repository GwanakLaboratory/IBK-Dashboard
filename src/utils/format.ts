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
