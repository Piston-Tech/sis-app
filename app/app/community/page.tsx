import AppLayout from "@/components/AppLayout";
import { Zap, Users } from "lucide-react";

const UserCommunityPage = () => {
  return (
    <AppLayout>
      <div className="space-y-12">
        <section className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?u=${i}`}
                    className="w-14 h-14 rounded-full border-4 border-indigo-600"
                    alt="avatar"
                  />
                ))}
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none">
              Share Your Academy Journey!
            </h2>
            <p className="text-indigo-100 text-lg font-medium mb-10">
              Connect with 15,000+ alumni and current students worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                Post an Update
              </button>
              <button className="px-10 py-5 bg-indigo-500/50 backdrop-blur-md rounded-[2rem] font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-indigo-400/50 transition-all">
                Join Discussion
              </button>
            </div>
          </div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500 rounded-full blur-[100px] opacity-20" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols- gap-8">
          {/* Feed Mock */}
          <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-900 dark:text-white px-4">
              Trending Discussions
            </h4>
            {[
              {
                author: "Sarah Ali",
                role: "Business Analyst",
                post: "Just passed my PMP on the first try! A huge thanks to the P&F prep team.",
                likes: 124,
                comments: 12,
              },
              {
                author: "Samuel Oke",
                role: "HR Manager",
                post: "Looking for study partners for the upcoming Digital Transformation cohort.",
                likes: 45,
                comments: 28,
              },
              {
                author: "Adekunle Gold",
                role: "DevOps Engineer",
                post: "The new Academy UI is smooth! Love the transparency on the dashboard.",
                likes: 89,
                comments: 8,
              },
            ].map((msg, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex gap-6"
              >
                <img
                  src={`https://i.pravatar.cc/100?u=post-${i}`}
                  className="w-16 h-16 rounded-2xl shrink-0"
                  alt="post author"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {msg.author}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {msg.role}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      2h ago
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800 italic">
                    "{msg.post}"
                  </p>
                  <div className="flex items-center gap-8">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-black">{msg.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-black">{msg.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserCommunityPage;
