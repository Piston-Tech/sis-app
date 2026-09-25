import Image from "next/image";
import { ArrowRight, GraduationCap, LogIn } from "lucide-react";
import { FOUNDATION_PATH, PORTAL_SIGN_IN_PATH, PROGRAMS_URL } from "@/constants/links";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 py-6">
        <Image src="/logo-48.png" alt="" width={40} height={40} priority className="rounded-xs" />
        <span>
          <span className="block font-extrabold leading-tight text-slate-900">Piston &amp; Fusion</span>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Business Academy
          </span>
        </span>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20">
        <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
          Piston &amp; Fusion Business Academy
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
          Sign in to the student portal to follow your classes, payments and certificates, or apply
          for a place on our Foundations Program.
        </p>

        <div className="mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <a
            href={PORTAL_SIGN_IN_PATH}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-800 hover:shadow-md"
          >
            <LogIn className="h-7 w-7 text-primary-900" aria-hidden />
            <span className="mt-4 text-lg font-bold text-slate-900">Student portal</span>
            <span className="mt-1 text-sm text-slate-600">
              Enrolled with us? Sign in to your account.
            </span>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-900">
              Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </a>

          <a
            href={FOUNDATION_PATH}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-800 hover:shadow-md"
          >
            <GraduationCap className="h-7 w-7 text-primary-900" aria-hidden />
            <span className="mt-4 text-lg font-bold text-slate-900">Foundations Program</span>
            <span className="mt-1 text-sm text-slate-600">
              Apply for a place in an open Foundations cohort.
            </span>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-900">
              Apply now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </a>
        </div>

        <p className="mt-10 text-sm text-slate-600">
          Looking for our programmes?{" "}
          <a href={PROGRAMS_URL} className="font-semibold text-primary-900 underline" rel="noopener noreferrer">
            Browse them on our website
          </a>
          .
        </p>
      </section>
    </main>
  );
}
