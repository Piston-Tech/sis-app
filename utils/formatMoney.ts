import formatNumber from "./formatNumber";

const formatMoney = (
  amount: string | number,
  toFixed: boolean = false,
  currency: "Nigerian Naira" | "US Dollar" | "Euro" | "Pound",
) => {
  return (
    (currency === "Nigerian Naira"
      ? "₦"
      : currency === "US Dollar"
        ? "$"
        : currency === "Euro"
          ? "€"
          : currency === "Pound"
            ? "£"
            : "") + formatNumber(amount, toFixed)
  );
  // "$"
};

export default formatMoney;
