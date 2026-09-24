import { AuthField, FormAlert, primaryButtonClass } from "./fields";

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
      <AuthField
        id="auth-new-password"
        label="Create a password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <AuthField
        id="auth-confirm-password"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <FormAlert message={error} />
      <button disabled={isSubmitting} type="submit" className={primaryButtonClass}>
        {isSubmitting ? "Saving..." : "Set password"}
      </button>
    </form>
  );
};

export default AuthCreatePassword;
