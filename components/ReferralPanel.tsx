"use client";

import { Copy, Gift, Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface ReferralSummary {
  referralCode: string;
  referralPoints: number;
  referrals: { id: number; firstName: string; lastName: string; status: string }[];
}

const ReferralPanel = () => {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/student/referrals")
      .then((response) => response.json())
      .then((response) => setSummary(response.data ?? null))
      .catch(() => setSummary(null));
  }, []);

  const applicationLink = `foundation.${process.env.NEXT_PUBLIC_DOMAIN_NAME}/?ref=${summary?.referralCode ?? ""}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(applicationLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Piston & Fusion Foundations Program",
        text: "Experience the Piston & Fusion Foundations Program.",
        url: applicationLink,
      });
      return;
    }
    await copyLink();
  };

  return (
    <section className="bg-[#064CA3] text-white border border-primary-900 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-white/15 p-3"><Gift className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Share the foundations experience</p>
            <h2 className="mt-1 text-xl font-bold">Refer someone to a Foundations Program</h2>
            <p className="mt-2 max-w-2xl text-sm text-blue-100">Every completed application using your code earns one referral point.</p>
          </div>
        </div>
        <div className="flex gap-5 text-left md:text-right">
          <div><p className="text-2xl font-bold">{summary?.referralPoints ?? 0}</p><p className="text-xs text-blue-100">Referral points</p></div>
          <div><p className="text-2xl font-bold">{summary?.referrals.length ?? 0}</p><p className="text-xs text-blue-100">Applications</p></div>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-white px-4 py-3 text-slate-900">
          <Users className="h-4 w-4 shrink-0 text-primary-800" />
          <span className="text-xs font-semibold">Your code</span>
          <code className="ml-auto truncate text-sm font-bold">{summary?.referralCode ?? "Loading..."}</code>
        </div>
        <button onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-primary-900 hover:bg-blue-50">
          <Copy className="h-4 w-4" />{copied ? "Copied" : "Copy link"}
        </button>
        <button onClick={shareLink} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold hover:bg-white/10">
          <Share2 className="h-4 w-4" />Share
        </button>
      </div>
    </section>
  );
};

export default ReferralPanel;