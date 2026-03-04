interface AuthCreatePasswordProps {
  handleCreatePassword: (e: React.FormEvent) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  error: string | null;
  isSubmitting: boolean;
}

const AuthCreatePassword = ({
  handleCreatePassword,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  isSubmitting,
}: AuthCreatePasswordProps) => {
  return (
    <form onSubmit={handleCreatePassword} className="space-y-4">
      <div className="text-left">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
          Create a Password
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
      <div className="text-left">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
          Confirm Password
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {isSubmitting ? "Saving..." : "Set Password"}
      </button>
    </form>
  );
};

export default AuthCreatePassword;
