import AppLayout from "@/components/AppLayout";
import { Clock } from "lucide-react";

const UserCertificatesPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Certificates are coming soon</h1>
            <p className="mt-2 text-sm text-slate-500">Your verified certificates will appear here when this feature launches.</p>
          </div>
        </div>
    </AppLayout>
  );
};

export default UserCertificatesPage;
