"use client";

import { useEffect, useState } from "react";
import { sessionEnd, sessionStart } from "../format";
import type { StudentSession } from "../types";

const pad = (value: number) => value.toString().padStart(2, "0");

const describe = (session: StudentSession, now: number) => {
  const start = sessionStart(session)?.getTime();
  const end = sessionEnd(session)?.getTime();
  if (start === undefined) return { text: "Time to be announced", live: false };
  if (now >= start) {
    return end !== undefined && now <= end
      ? { text: "In progress", live: true }
      : { text: "Session ended", live: false };
  }

  const total = Math.floor((start - now) / 1000);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return { text: days > 0 ? `${days}d ${clock}` : clock, live: false };
};

/**
 * Self-contained countdown so only this component re-renders every second,
 * not the whole dashboard.
 */
const SessionCountdown = ({ session }: { session: StudentSession }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { text, live } = describe(session, now);

  return (
    <div className="flex min-w-[220px] flex-col justify-center self-start rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-xl xl:self-center">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-blue-200">
        {live ? "Live now" : "Starts in"}
      </span>
      {/* Visual clock ticks every second; screen readers get a static label. */}
      <span className="block font-mono text-3xl font-black tracking-tighter text-white" aria-hidden>
        {text}
      </span>
      <span className="sr-only">
        {live ? "This session is in progress" : `Next session starts ${sessionStart(session)?.toLocaleString() ?? "soon"}`}
      </span>
    </div>
  );
};

export default SessionCountdown;
