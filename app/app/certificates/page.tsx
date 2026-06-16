import AppLayout from "@/components/AppLayout";
import { Award, Download, Clock } from "lucide-react";

const UserCertificatesPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Project Management Core",
              date: "March 2024",
              id: "PF-CERT-8821",
            },
            {
              title: "Business Strategy Foundation",
              date: "Dec 2023",
              id: "PF-CERT-7712",
            },
          ].map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-500 transition-all text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Award className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">
                {cert.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
                Issued {cert.date}
              </p>

              <div className="space-y-4">
                <button className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button className="w-full py-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Verify: {cert.id}
                </button>
              </div>
            </div>
          ))}

          <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] p-8 border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Ongoing Programs
            </p>
            <p className="text-xs font-bold text-slate-300 mt-2">
              Certificates generate upon 100% completion
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserCertificatesPage;
