const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function threeDigits(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + threeDigits(n % 100) : "");
}

function intToWords(n: number): string {
  if (n === 0) return "zero";
  const parts: string[] = [];
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;
  if (billions) parts.push(threeDigits(billions) + " billion");
  if (millions) parts.push(threeDigits(millions) + " million");
  if (thousands) parts.push(threeDigits(thousands) + " thousand");
  if (remainder) parts.push(threeDigits(remainder));
  return parts.join(" ");
}

const CURRENCY_NAMES: Record<string, { major: string; minor: string }> = {
  USD: { major: "dollar", minor: "cent" },
  CAD: { major: "Canadian dollar", minor: "cent" },
  EUR: { major: "euro", minor: "cent" },
  BRL: { major: "real", minor: "centavo" },
};

export function numberToWords(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  const intPart = Math.floor(rounded);
  const decPart = Math.round((rounded - intPart) * 100);
  const names = CURRENCY_NAMES[currency] ?? { major: "dollar", minor: "cent" };

  const majorWord = intPart === 1 ? names.major : names.major + "s";
  const minorWord = decPart === 1 ? names.minor : names.minor + "s";

  const majorStr = intToWords(intPart) + " " + majorWord;
  const minorStr = decPart > 0 ? " and " + intToWords(decPart) + " " + minorWord : "";

  // Capitalize only the first letter
  const result = `${currency} ${majorStr}${minorStr}`;
  return result.replace(/^(\S+\s)(.)/, (_, prefix, ch) => prefix + ch.toUpperCase());
}
