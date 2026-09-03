/**
 * Converts a number to words using the Indian numbering system
 * (Crore / Lakh / Thousand / Hundred), e.g. 18382412 ->
 * "One Crore Eighty Three Lakh Eighty Two Thousand Four Hundred Twelve".
 *
 * Used by the Generate Receipt page to render the "Total Invoice amount
 * in words" line the same way the real Laxmi Jewellery delivery challan
 * does. Only handles the rupee (integer) part — paise aren't shown on
 * that document either.
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]} ${ONES[ones]}`;
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return twoDigits(rest);
  if (rest === 0) return `${ONES[hundreds]} Hundred`;
  return `${ONES[hundreds]} Hundred ${twoDigits(rest)}`;
}

export function numberToWordsIndian(value: number): string {
  const n = Math.round(Math.abs(value));
  if (n === 0) return "Zero";

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(" ");
}

/** e.g. 18382412 -> "One Crore Eighty Three Lakh Eighty Two Thousand Four Hundred Twelve Rupees Only" */
export function amountInWords(value: number): string {
  return `${numberToWordsIndian(value)} Rupees Only`;
}
