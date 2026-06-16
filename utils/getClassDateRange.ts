import { Session } from "@/types";

const getClassDateRange = (sessions: Array<Session>) => {
  if (!sessions.length) return { min: null, max: null };

  const dates = sessions.map((s) => new Date(s.date).getTime());
  return {
    min: new Date(Math.min(...dates)),
    max: new Date(Math.max(...dates)),
  };
};

export default getClassDateRange;