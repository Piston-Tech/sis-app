interface Props {
  firstName?: string;
  enrollmentCount: number;
  completedCount: number;
}

/** Hero for a student with no ongoing course. */
const WelcomeHero = ({ firstName, enrollmentCount, completedCount }: Props) => (
  <section
    aria-labelledby="welcome-heading"
    className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-12"
  >
    <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
      <div className="max-w-2xl space-y-3">
        <h1 id="welcome-heading" className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
          Welcome{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="max-w-xl text-base text-slate-600">
          {enrollmentCount === 0
            ? "You're not enrolled in a course yet. Explore the recommendations below to find your next programme."
            : "You don't have a course in progress right now. Download your certificates or plan your next programme."}
        </p>
      </div>

      {enrollmentCount > 0 && (
        <dl className="flex flex-wrap items-center gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <div className="flex flex-col-reverse border-r border-slate-200 pr-6">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-600">Enrollments</dt>
            <dd className="text-xl font-black text-slate-900">{enrollmentCount}</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-600">Completed</dt>
            <dd className="text-xl font-black text-slate-900">{completedCount}</dd>
          </div>
        </dl>
      )}
    </div>
    <div aria-hidden className="absolute right-0 top-0 h-80 w-80 translate-x-1/2 rounded-full bg-blue-600/5 blur-3xl" />
  </section>
);

export default WelcomeHero;
