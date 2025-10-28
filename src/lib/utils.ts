export function round(num: number, digits: number) {
  return Math.round(num * 10 ** digits) / 10 ** digits
}
