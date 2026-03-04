"use client";

import { useAuth } from "@/hooks/useAuth";
import AuthOptions from "./AuthOptions";
import AuthOTP from "./AuthOTP";
import AuthCreatePassword from "./AuthCreatePassword";
import AuthCreateAccount from "./AuthCreateAccount";
import AuthPassword from "./AuthPassword";

const AppLogin = () => {
  const {
    loginStep,
    email,
    setEmail,
    otp,
    setOtp,
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

    handleEmailSubmit,
    handleOtpSubmit,
    handleCreateAccount,
    handleCreatePassword,
    handlePasswordLogin,
    handleSocialLogin,

    useDifferentEmail,
    handleForgotPassword,
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] opacity-50"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl rotate-12 flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl font-black -rotate-12">
                PF
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Academy Membership
          </h1>
          <p className="text-slate-500 mb-10 text-sm font-medium">
            Premium Professional Training & Career Growth
          </p>

          <div className="space-y-4">
            {loginStep === "options" && (
              <AuthOptions
                handleEmailSubmit={handleEmailSubmit}
                email={email}
                setEmail={setEmail}
                error={error}
                isSubmitting={isSubmitting}
                handleSocialLogin={handleSocialLogin}
              />
            )}

            {loginStep === "otp" && (
              <AuthOTP
                handleOtpSubmit={handleOtpSubmit}
                email={email}
                otp={otp}
                setOtp={setOtp}
                error={error}
                isSubmitting={isSubmitting}
                useDifferentEmail={useDifferentEmail}
              />
            )}

            {loginStep === "create-password" && (
              <AuthCreatePassword
                handleCreatePassword={handleCreatePassword}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                error={error}
                isSubmitting={isSubmitting}
              />
            )}

            {loginStep === "create-account" && (
              <AuthCreateAccount
                handleCreateAccount={handleCreateAccount}
                prefix={prefix}
                setPrefix={setPrefix}
                firstName={firstName}
                setFirstName={setFirstName}
                middleName={middleName}
                setMiddleName={setMiddleName}
                lastName={lastName}
                setLastName={setLastName}
                phone={phone}
                setPhone={setPhone}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                error={error}
                errors={errors}
                isSubmitting={isSubmitting}
              />
            )}

            {loginStep === "password" && (
              <AuthPassword
                handlePasswordLogin={handlePasswordLogin}
                email={email}
                password={password}
                setPassword={setPassword}
                error={error}
                isSubmitting={isSubmitting}
                useDifferentEmail={useDifferentEmail}
                handleForgotPassword={handleForgotPassword}
              />
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Protected by Piston & Fusion Security Operations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLogin;
