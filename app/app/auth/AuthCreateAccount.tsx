import { ErrorMsg } from "@/components/Form";
import StudentCreationErrors from "@/types/StudentCreationError";

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
      <div className="flex gap-4">
        <div className="text-left w-max">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
            Prefix (Optional)
          </label>
          <select
            required
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
          >
            <option value="">None</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>
          <ErrorMsg message={errors.prefix} />
        </div>
        <div className="text-left flex-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
            First Name
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
          />
          <ErrorMsg message={errors.firstName} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
            Middle Name (Optional)
          </label>
          <input
            type="text"
            required
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Michael"
            className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
          />
          <ErrorMsg message={errors.middleName} />
        </div>
        <div className="text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
            Last Name
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
          />
          <ErrorMsg message={errors.lastName} />
        </div>
      </div>
      <div className="text-left">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+2348012345678"
          className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
        />
        <ErrorMsg message={errors.phone} />
      </div>
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
        <ErrorMsg message={errors.password} />
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
        <ErrorMsg message={errors.confirmPassword} />
      </div>
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
};

export default AuthCreateAccount;
