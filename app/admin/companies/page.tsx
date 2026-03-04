"use client";

import Card from "@/components/Card";
import {
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  Building2,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import useCompany from "@/hooks/useCompany";
import CompanyFormModal from "./CompanyFormModal";
import { Company } from "@/types";

const AdminCompanies = () => {
  const { companies, refreshCompanies } = useCompany();

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  if (error)
    return <div className="p-10 text-center text-rose-600">Error: {error}</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Companies
            </h1>
            <p className="text-zinc-500 mt-1">
              Manage corporate clients and partnerships.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
            Add Company
          </button>
        </header>

        <Card className="p-0">
          <div className="p-4 border-b border-zinc-100 flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search companies by name or industry..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                          <Building2 size={20} />
                        </div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {company.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">
                        {company.industry}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">0</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowAddModal(true);
                        }}
                        className="text-zinc-400 hover:text-black transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-zinc-500"
                    >
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {showAddModal && (
            <CompanyFormModal
              company={selectedCompany}
              onClose={() => {
                setShowAddModal(false);
                // fetchCompanies();
                refreshCompanies();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanies;
