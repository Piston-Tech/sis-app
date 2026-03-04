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
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
          Enter OTP sent to {email}
        </label>
        <input
          type="text"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-center tracking-[0.5em] text-2xl"
        />
        {/* <p className="mt-2 text-[10px] text-slate-400 font-medium italic text-center">
          Demo: Check the browser console (F12) for the OTP code.
        </p> */}
      </div>
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
      >
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </button>
      <button
        type="button"
        onClick={useDifferentEmail}
        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
      >
        ← Use different email
      </button>
    </form>
  );
};

export default AuthOTP;
