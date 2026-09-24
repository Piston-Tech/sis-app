import { AuthField, FormAlert, linkButtonClass, primaryButtonClass } from "./fields";

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
      <AuthField
        id="auth-password"
        label={
          <>
            Password for <span className="normal-case">{email}</span>
          </>
        }
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormAlert message={error} />
      <button disabled={isSubmitting} type="submit" className={primaryButtonClass}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleForgotPassword}
        className={linkButtonClass}
      >
        Forgot password?
      </button>

      <button type="button" onClick={useDifferentEmail} className={linkButtonClass}>
        Use a different email
      </button>
    </form>
  );
};

export default AuthPassword;
