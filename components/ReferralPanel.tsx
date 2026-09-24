"use client";

import { Copy, Gift, Share2, Users } from "lucide-react";
import { useState } from "react";
import { useReferrals } from "@/components/student/queries";
import { useToast } from "@/components/student/Toast";

const foundationUrl = () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN_NAME;
  if (domain) return `https://foundation.${domain}/`;
  return typeof window === "object" ? `${window.location.origin}/foundation` : "/foundation";
};

const ReferralPanel = () => {
  const { data: summary, isPending, isError } = useReferrals();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // No referral programme data (error or no code): don't show the panel.
  if (isError || (!isPending && !summary?.referralCode)) return null;

  const referralCode = summary?.referralCode ?? "";
  const applicationLink = `${foundationUrl()}?ref=${encodeURIComponent(referralCode)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(applicationLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy the link. You can copy your code instead.");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Piston & Fusion Foundations Program",
          text: "Apply for the Piston & Fusion Foundations Program.",
          url: applicationLink,
        });
      } catch {
        // Share sheet dismissed.
      }
      return;
    }
    await copyLink();
  };

  return (
    <section
      aria-labelledby="referral-heading"
      className="rounded-2xl border border-primary-900 bg-[#064CA3] p-6 text-white shadow-sm"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-white/15 p-3">
            <Gift className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 id="referral-heading" className="text-xl font-bold">
              Refer someone to a Foundations Program
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-blue-50">
              Every completed application using your code earns one referral point.
            </p>
          </div>
        </div>
        <dl className="flex gap-5 text-left md:text-right">
          <div className="flex flex-col-reverse">
            <dt className="text-xs text-blue-50">Referral points</dt>
            <dd className="text-2xl font-bold">{isPending ? "…" : (summary?.referralPoints ?? 0)}</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="text-xs text-blue-50">Applications</dt>
            <dd className="text-2xl font-bold">{isPending ? "…" : (summary?.referrals?.length ?? 0)}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-white px-4 py-3 text-slate-900">
          <Users className="h-4 w-4 shrink-0 text-primary-800" aria-hidden />
          <span className="text-xs font-semibold">Your code</span>
          <code className="ml-auto truncate text-sm font-bold">
            {isPending ? "Loading..." : referralCode}
          </code>
        </div>
        <button
          type="button"
          onClick={copyLink}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-primary-900 hover:bg-blue-50 disabled:opacity-60"
        >
          <Copy className="h-4 w-4" aria-hidden />
          <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
        </button>
        <button
          type="button"
          onClick={shareLink}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </button>
      </div>
    </section>
  );
};

export default ReferralPanel;
