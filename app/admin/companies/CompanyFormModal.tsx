import Modal from "@/components/Modal";
import useCompanyForm from "@/hooks/useCompanyForm";
import { Company } from "@/types";

const CompanyFormModal = ({
  company,
  onClose,
}: {
  company: Company | null;
  onClose: () => void;
}) => {
  const { companies, handleSubmit, formData, setFormData, loading, errors } =
    useCompanyForm(company, onClose);

  return (
    <Modal
      title={company ? "Edit Company" : "Add New Company"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Name
          </label>
          <input
            required
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Industry
          </label>
          <select
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
            value={formData.industry}
            onChange={(e) =>
              setFormData({ ...formData, industry: e.target.value })
            }
          >
            <option value="">- None -</option>
            {["IT", "Education", "Oil & Gas"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-xl font-bold mt-4"
        >
          {loading ? "Loading..." : company ? "Edit Company" : "Create Company"}
        </button>
      </form>
    </Modal>
  );
};

export default CompanyFormModal;
