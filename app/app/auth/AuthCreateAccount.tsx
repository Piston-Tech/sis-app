import StudentCreationErrors from "@/types/StudentCreationError";
import { AuthField, FieldError, FormAlert, inputClass, labelClass, primaryButtonClass } from "./fields";

interface AuthCreateAccountProps {
  handleCreateAccount: (e: React.FormEvent) => void;
  prefix: string;
  setPrefix: (prefix: string) => void;
  firstName: string;
  setFirstName: (firstName: string) => void;
  middleName: string;
  setMiddleName: (middleName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  phone: string;
  setPhone: (phoneNumber: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  error: string | null;
  errors: StudentCreationErrors;
  isSubmitting: boolean;
}

const AuthCreateAccount = ({
  handleCreateAccount,
  prefix,
  setPrefix,
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  lastName,
  setLastName,
  phone,
  setPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  errors,
  isSubmitting,
}: AuthCreateAccountProps) => {
  return (
    <form onSubmit={handleCreateAccount} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
        <div className="text-left">
          <label htmlFor="signup-prefix" className={labelClass}>
            Prefix <span className="font-medium normal-case text-slate-500">(optional)</span>
          </label>
          <select
            id="signup-prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            aria-describedby={errors.prefix ? "signup-prefix-error" : undefined}
            className={inputClass}
          >
            <option value="">None</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>
          <FieldError id="signup-prefix-error" message={errors.prefix} />
        </div>
        <AuthField
          id="signup-first-name"
          label="First name"
          type="text"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthField
          id="signup-middle-name"
          label="Middle name"
          optional
          type="text"
          autoComplete="additional-name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          error={errors.middleName}
        />
        <AuthField
          id="signup-last-name"
          label="Last name"
          type="text"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.lastName}
        />
      </div>
      <AuthField
        id="signup-phone"
        label="Phone number"
        optional
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+2348012345678"
        error={errors.phone}
      />
      <AuthField
        id="signup-password"
        label="Create a password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <AuthField
        id="signup-confirm-password"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />
      <FormAlert message={error || errors.email || errors.verificationToken} />
      <button disabled={isSubmitting} type="submit" className={primaryButtonClass}>
        {isSubmitting ? "Creating..." : "Create account"}
      </button>
    </form>
  );
};

export default AuthCreateAccount;
