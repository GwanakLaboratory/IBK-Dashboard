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
