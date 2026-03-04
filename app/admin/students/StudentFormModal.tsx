import Modal from "@/components/Modal";
import useStudentForm from "@/hooks/useStudentForm";
import { Student } from "@/types";

const StudentFormModal = ({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) => {
  const { companies, handleSubmit, formData, setFormData, loading, errors } =
    useStudentForm(student, onClose);

  return (
    <Modal
      title={student ? "Edit Student" : "Add New Student"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Prefix (Optional)
            </label>
            <input
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.prefix}
              onChange={(e) =>
                setFormData({ ...formData, prefix: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              First Name
            </label>
            <input
              required
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Middle Name (Optional)
            </label>
            <input
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.middleName}
              onChange={(e) =>
                setFormData({ ...formData, middleName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Last Name
            </label>
            <input
              required
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Email Address
            </label>
            <input
              required
              type="email"
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Phone Number (Optional)
            </label>
            <input
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Company (Optional)
          </label>
          <select
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
            value={formData.companyId}
            onChange={(e) =>
              setFormData({
                ...formData,
                companyId: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
          >
            <option value="">Individual</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.companyId})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Membership Tier (Optional)
            </label>
            <select
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.membershipTier}
              onChange={(e) =>
                setFormData({ ...formData, membershipTier: e.target.value })
              }
            >
              <option value="">- None -</option>
              {["Basic", "Pro", "Elite"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Persona (Optional)
            </label>
            <select
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.persona}
              onChange={(e) =>
                setFormData({ ...formData, persona: e.target.value })
              }
            >
              <option value="">- None -</option>
              {["Career Ascend", "Career Starter", "Business Owner"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-xl font-bold mt-4"
        >
          {loading ? "Loading..." : student ? "Edit Student" : "Create Student"}
        </button>
      </form>
    </Modal>
  );
};

export default StudentFormModal;
