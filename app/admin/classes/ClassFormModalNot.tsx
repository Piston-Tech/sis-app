import { X, Calendar, Users, BookOpen, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

const ClassFormModal = ({
  cls,
  onClose,
}: {
  cls: any;
  onClose: () => void;
}) => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/classes/${cls.id}/enrollments`)
      .then((res) => res.json())
      .then((data) => {
        setEnrollments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cls.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              {cls.course_title || cls.course_code}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Cohort {cls.course_code} • {cls.start_date} to {cls.end_date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Class Info
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Calendar size={16} className="text-zinc-400" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Users size={16} className="text-zinc-400" />
                  <span>
                    {cls.enrollment_count || 0} /{" "}
                    {(cls.capacity_physical || 0) + (cls.capacity_virtual || 0)}{" "}
                    Enrolled
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Location & Links
              </h4>
              <div className="space-y-2">
                {cls.delivery === "virtual" ? (
                  <div className="flex items-center gap-3 text-sm text-blue-600">
                    <BookOpen size={16} />
                    <a
                      href={cls.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {cls.zoom_link || "No link provided"}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Building2 size={16} className="text-zinc-400" />
                    <span>{cls.venue_details || "No venue details"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Enrolled Students
            </h4>
            {loading ? (
              <div className="py-10 text-center text-zinc-400 text-sm italic">
                Loading enrollments...
              </div>
            ) : enrollments.length > 0 ? (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {enrollments.map((e: any) => (
                      <tr key={e.id} className="text-sm">
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          {e.first_name} {e.last_name}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{e.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-sm">
                No students enrolled in this cohort yet.
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClassFormModal;
