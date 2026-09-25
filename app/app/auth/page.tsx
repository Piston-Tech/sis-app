"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import AuthOptions from "./AuthOptions";
import AuthOTP from "./AuthOTP";
import AuthCreatePassword from "./AuthCreatePassword";
import AuthCreateAccount from "./AuthCreateAccount";
import AuthPassword from "./AuthPassword";
import { FormNotice } from "./fields";

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
    notice,
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] opacity-60"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] opacity-50"
      />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo-48.png"
              alt="Piston & Fusion Business Academy"
              width={64}
              height={64}
              priority
              className="rounded-md"
            />
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Student portal
          </h1>
          <p className="text-slate-600 mb-10 text-sm font-medium">
            Sign in to Piston &amp; Fusion Business Academy
          </p>

          <div className="space-y-4">
            <FormNotice message={notice} />

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
        </div>
      </div>
    </main>
  );
};

export default AppLogin;
