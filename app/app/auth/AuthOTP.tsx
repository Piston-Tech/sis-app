import { FormAlert, inputClass, labelClass, linkButtonClass, primaryButtonClass } from "./fields";

interface AuthOTPProps {
  handleOtpSubmit: (e: React.FormEvent) => void;
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  error: string | null;
  isSubmitting: boolean;
  useDifferentEmail: () => void;
}

const AuthOTP = ({
  handleOtpSubmit,
  email,
  otp,
  setOtp,
  error,
  isSubmitting,
  useDifferentEmail,
}: AuthOTPProps) => {
  return (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      <div className="text-left">
        <label htmlFor="auth-otp" className={labelClass}>
          Enter the code sent to <span className="normal-case">{email}</span>
        </label>
        <input
          id="auth-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.trim())}
          placeholder="123456"
          className={`${inputClass} text-center tracking-[0.5em] text-2xl`}
        />
      </div>
      <FormAlert message={error} />
      <button disabled={isSubmitting} type="submit" className={primaryButtonClass}>
        {isSubmitting ? "Verifying..." : "Verify code"}
      </button>
      <button type="button" onClick={useDifferentEmail} className={linkButtonClass}>
        Use a different email
      </button>
    </form>
  );
};

export default AuthOTP;
