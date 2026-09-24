import { GoogleIcon, LinkedInIcon } from "@/components/student/SocialIcons";
import { AuthField, FormAlert, primaryButtonClass } from "./fields";

interface AuthOptionsProps {
  handleEmailSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (email: string) => void;
  error: string | null;
  isSubmitting: boolean;
  handleSocialLogin: (provider: "google" | "linkedin") => void;
}

const socialButtonClass =
  "w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50";

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
        <AuthField
          id="auth-email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
        />
        <FormAlert message={error} />
        <button disabled={isSubmitting} type="submit" className={primaryButtonClass}>
          {isSubmitting ? "Checking..." : "Continue"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-slate-500" aria-hidden>
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => handleSocialLogin("linkedin")}
        className={socialButtonClass}
      >
        <LinkedInIcon />
        Sign in with LinkedIn
      </button>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => handleSocialLogin("google")}
        className={socialButtonClass}
      >
        <GoogleIcon />
        Sign in with Google
      </button>
    </>
  );
};

export default AuthOptions;
