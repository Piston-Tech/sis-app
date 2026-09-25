const ProgressRing = ({
  percentage,
  color = "#2563eb",
  label,
}: {
  percentage: number;
  color?: string;
  label: string;
}) => {
  const value = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`${label}: ${value}%`}
    >
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="text-sm font-black text-slate-900">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-600" aria-hidden>
        {label}
      </span>
    </div>
  );
};

export default ProgressRing;
