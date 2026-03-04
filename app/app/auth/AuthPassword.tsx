interface AuthPasswordProps {
  handlePasswordLogin: (e: React.FormEvent) => void;
  email: string;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
  isSubmitting: boolean;
  useDifferentEmail: () => void;
  handleForgotPassword: () => void;
}

const AuthPassword = ({
  handlePasswordLogin,
  email,
  password,
  setPassword,
  error,
  isSubmitting,
  useDifferentEmail,
  handleForgotPassword,
}: AuthPasswordProps) => {
  return (
    <form onSubmit={handlePasswordLogin} className="space-y-4">
      <div className="text-left">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
          Enter Password for {email}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
        />
      </div>
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : "Sign In"}
      </button>

      <button
        type="button"
        onClick={handleForgotPassword}
        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
      >
        Forgot password?
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

export default AuthPassword;
