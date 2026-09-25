const groupThousands = (digits: string) =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * "1234567" → "1,234,567"; with toFixed, "1234.5" → "1,234.50".
 * Decimals and negatives keep their fraction/sign; non-numeric input is
 * returned unchanged.
 */
const formatNumber = (amount: string | number, toFixed: boolean = false) => {
  const value = toFixed
    ? parseFloat(amount.toString()).toFixed(2)
    : amount.toString().trim();

  const match = /^(-?)(\d+)(\.\d+)?$/.exec(value);
  if (!match) return value;

  const [, sign, integer, fraction = ""] = match;
  return sign + groupThousands(integer) + fraction;
};

export default formatNumber;
