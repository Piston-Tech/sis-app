import AppLayout from "@/components/AppLayout";
import { Clock, Users } from "lucide-react";

const UserCommunityPage = () => {
  return (
    <AppLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-6 rounded-xl bg-primary-50 p-4 text-primary-900"><Users className="h-8 w-8" /></div>
        <h1 className="text-xl font-bold text-slate-900">Community is coming soon</h1>
        <p className="mt-2 text-sm text-slate-500">A place to connect with fellow learners will be available soon.</p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500"><Clock className="h-4 w-4" />Preparing the experience</div>
      </div>
    </AppLayout>
  );
};

export default UserCommunityPage;
