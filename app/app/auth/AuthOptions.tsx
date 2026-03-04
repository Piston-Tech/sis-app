import { GoogleLogin } from "@react-oauth/google";

interface AuthOptionsProps {
  handleEmailSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (email: string) => void;
  error: string | null;
  isSubmitting: boolean;
  handleSocialLogin: (provider: "google" | "linkedin") => void;
}

const AuthOptions = ({
  handleEmailSubmit,
  email,
  setEmail,
  error,
  isSubmitting,
  handleSocialLogin,
}: AuthOptionsProps) => {
  return (
    <>
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Continue"}
        </button>
      </form>
      <hr className="my-6 border-slate-200" />

      <button
        onClick={() => handleSocialLogin("linkedin")}
        className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5"
      >
        <img
          src="https://www.svgrepo.com/show/475661/linkedin-color.svg"
          className="w-5 h-5 mr-3"
          alt="LinkedIn"
        />
        Sign in with LinkedIn
      </button>
      <button
        onClick={() => handleSocialLogin("google")}
        className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          className="w-5 h-5 mr-3"
          alt="Google"
        />
        Sign in with Google
      </button>
      <button
        // onClick={() => handleLogin(UserRole.SME_OWNER)}
        className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
      >
        Login as SME Business Owner
      </button>
    </>
  );
};

export default AuthOptions;
