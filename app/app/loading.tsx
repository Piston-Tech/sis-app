const Loading = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl rotate-12 flex items-center justify-center shadow-2xl mb-8">
        <span className="text-white text-3xl font-black -rotate-12">PF</span>
      </div>
      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 animate-[progress_1.5s_ease-in-out_infinite]"
          style={{ width: "60%" }}
        ></div>
      </div>
    </div>
  );
};

export default Loading;
