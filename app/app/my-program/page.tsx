import AppLayout from "@/components/AppLayout";
import { BookOpen } from "lucide-react";
import { data } from "motion/react-client";

const UserMyProgramPage = () => {
  return (
    <AppLayout>
    <div className="space-y-12">
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[].map(prog => (
            <div key={prog.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-full">
               <div className="md:w-1/2 h-64 md:h-full bg-slate-100 dark:bg-slate-800 relative">
                  <img src={prog.thumbnail} className="w-full h-full object-cover" alt={prog.title} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent" />
               </div>
               <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
                  <span className="text-[9px] font-black uppercase text-blue-500 tracking-[0.2em] mb-4">Program Hub</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-3 leading-tight">{prog.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">{prog.description}</p>
                  
                  <div className="space-y-4 mt-auto">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Completion</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{prog.progress}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${prog.progress}%` }} />
                     </div>
                     <button className="w-full py-4 mt-6 border-2 border-slate-900 dark:border-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all">
                        Open Academy Hub
                     </button>
                  </div>
               </div>
            </div>
          ))}
       </div>

       <section className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div className="max-w-md">
                <h3 className="text-3xl font-black tracking-tighter mb-6 leading-none">Need a Specialized Diploma?</h3>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed">P&F Academy offers specialized programs tailored for industry requirements. Schedule a call with an advisor to customize your curriculum.</p>
                <div className="flex gap-4">
                   <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Contact Advisor</button>
                   <button className="px-8 py-4 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">View Brochure</button>
                </div>
             </div>
             <div className="flex justify-center lg:justify-end">
                <div className="relative">
                   <div className="w-48 h-48 bg-blue-600/20 rounded-[3rem] blur-3xl absolute inset-0 animate-pulse" />
                   <BookOpen className="w-32 h-32 text-white/10 relative z-10" />
                </div>
             </div>
          </div>
       </section>
    </div>
    </AppLayout>
  );
};

export default UserMyProgramPage;
