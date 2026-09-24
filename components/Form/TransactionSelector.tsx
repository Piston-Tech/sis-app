import SearchSelect from "./SearchSelect";

export interface TransactionOption {
  id: number;
  transactionId: string;
  payerType?: string;
  payer?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const transactionPayerName = (t: TransactionOption) =>
  t.payer
    ? t.payerType === "B2B"
      ? (t.payer.name ?? "")
      : [t.payer.firstName, t.payer.lastName].filter(Boolean).join(" ")
    : "";

export default function TransactionSelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value: number | undefined;
  onChange: (option: TransactionOption) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <SearchSelect<TransactionOption>
      resource="transactions"
      label="Select Transaction"
      placeholder="Search by transaction ID or payer"
      value={value}
      disabled={disabled}
      error={error}
      onSelect={onChange}
      renderOption={(t) => (
        <>
          <span className="font-semibold">{t.transactionId}</span>
          {transactionPayerName(t) ? ` - ${transactionPayerName(t)}` : ""}
        </>
      )}
    />
  );
}
