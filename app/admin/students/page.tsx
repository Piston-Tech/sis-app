"use client";

import Card from "@/components/Card";
import { Plus, Search, Filter, Download, ChevronRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import StudentFormModal from "./StudentFormModal";
import useStudent from "@/hooks/useStudent";
import { Student } from "@/types";

const AdminStudents = () => {
  const { students, refreshStudents } = useStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  if (error)
    return <div className="p-10 text-center text-rose-600">Error: {error}</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Students
            </h1>
            <p className="text-zinc-500 mt-1">
              Manage your student directory and profiles.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
            Add Student
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
                placeholder="Search students by name, email, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-zinc-100 rounded-xl hover:bg-zinc-50 text-zinc-600">
              <Filter size={18} />
            </button>
            <button className="p-2 border border-zinc-100 rounded-xl hover:bg-zinc-50 text-zinc-600">
              <Download size={18} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono uppercase">
                            {/* ID: STU-{student.id.toString().padStart(4, "0")} */}
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">{student.email}</p>
                      <p className="text-xs text-zinc-400">{student.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">
                        {student.companyId || "Individual"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowAddModal(true);
                        }}
                        className="text-zinc-400 hover:text-black transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {showAddModal && (
            <StudentFormModal
              student={selectedStudent}
              onClose={() => {
                setShowAddModal(false);
                // fetchStudents();
                refreshStudents();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;
