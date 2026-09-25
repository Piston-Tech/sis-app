/** Form-level error banner (announced when it appears). */
const FormError = ({ message }: { message: string | null | undefined }) =>
  message ? (
    <div
      role="alert"
      className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl font-medium border border-rose-100"
    >
      {message}
    </div>
  ) : null;

export default FormError;
