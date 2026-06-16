import Modal from "@/components/Modal";
import useCourseForm from "@/hooks/useCourseForm";
import { Course } from "@/types";

const CourseFormModal = ({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) => {
  const { courses, handleSubmit, formData, setFormData, loading, errors } =
    useCourseForm(course, onClose);

  return (
    <Modal title={course ? "Edit Course" : "Add New Course"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Title
          </label>
          <input
            required
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Code
            </label>
            <input
              required
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Category
            </label>
            <select
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">- None -</option>
              {[
                "Business Development Courses",
                "Customer Management Courses",
                "Data Management Courses",
                "Finance Management Courses",
                "Health & Safety Courses",
                "Hospitality & Restaurant Courses",
                "Human Resource Mgt Courses",
                "Legal & Regulatory Courses",
                "Marketing & Branding Courses",
                "Operations Management Courses",
                "Project Management Courses",
                "Sales Professionals Courses",
                "Training & Facilitation Courses",
                "Employee Programmes",
                "Leadership Programmes",
                "Tech & IT Programmes",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Duration
            </label>
            <input
              required
              type="number"
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Level
            </label>
            <select
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
            >
              <option value="">- None -</option>
              {["Associate", "Supervisors", "Management", "Executives"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Link
          </label>
          <textarea
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-xl font-bold mt-4"
        >
          {loading ? "Loading..." : course ? "Edit Course" : "Create Course"}
        </button>
      </form>
    </Modal>
  );
};

export default CourseFormModal;
