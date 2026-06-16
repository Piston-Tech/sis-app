import Image from "next/image";

const Loading = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-primary-50">
      {/* <div className="w-16 h-16 bg-blue-600 rounded-2xl rotate-12 flex items-center justify-center shadow-2xl mb-8">
        <span className="text-white text-3xl font-black -rotate-12">PF</span>
      </div> */}
      <Image
        src="/logo-48.png"
        alt="Piston & Fusion Logo"
        width={64}
        height={64}
        className="rounded-xs mb-8 animate-pulse shadow-2xl"
      />
      <div className="w-48 h-1.5 bg-primary-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-900 animate-[progress_1.5s_ease-in-out_infinite]"
          style={{ width: "60%" }}
        ></div>
      </div>
    </div>
  );
};

export default Loading;
