const Loading = () => {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-live="polite">
      <span className="sr-only">Loading...</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-hidden>
        <div className="md:col-span-2 h-64 bg-slate-100 rounded-[2.5rem]" />
        <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" aria-hidden>
        <div className="lg:col-span-8 h-96 bg-slate-100 rounded-[2.5rem]" />
        <div className="lg:col-span-4 h-96 bg-slate-100 rounded-[2.5rem]" />
      </div>
    </div>
  );
};

export default Loading;
