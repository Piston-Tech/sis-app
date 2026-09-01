"use client";

import Card from "@/components/Card";
import { Search, Plus, Calendar, Users, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import ClassFormModal from "./ClassFormModal";
import useClass from "@/hooks/useClass";
import AdminLayout from "@/components/AdminLayout";
import getClassDateRange from "@/utils/getClassDateRange";

const ClassesList = () => {
  const { classes, refreshClasses, deleteClass } = useClass({ limit: 10000 });

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [newClass, setNewClass] = useState({
    course_id: "",
    course_code: "",
    start_date: "",
    end_date: "",
    schedule: "",
    delivery: "physical",
    capacity_physical: 20,
    capacity_virtual: 0,
    zoom_link: "",
    venue_details: "",
  });

  //   const fetchData = () => {
  //     Promise.all([
  //       fetch("/api/classes").then((res) => {
  //         if (!res.ok) throw new Error("Failed to fetch classes");
  //         return res.json();
  //       }),
  //       fetch("/api/courses").then((res) => {
  //         if (!res.ok) throw new Error("Failed to fetch courses");
  //         return res.json();
  //       }),
  //     ])
  //       .then(([classesData, coursesData]) => {
  //         setClasses(Array.isArray(classesData) ? classesData : []);
  //         setCourses(Array.isArray(coursesData) ? coursesData : []);
  //       })
  //       .catch((err) => setError(err.message));
  //   };

  //   useEffect(() => {
  //     fetchData();
  //   }, []);

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     const payload = {
  //       ...newClass,
  //       course_id: parseInt(newClass.course_id as string),
  //     };
  //     fetch("/api/classes", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     })
  //       .then((res) => {
  //         if (!res.ok) throw new Error("Failed to create class");
  //         return res.json();
  //       })
  //       .then(() => {
  //         setIsAdding(false);
  //         setNewClass({
  //           course_id: "",
  //           course_code: "",
  //           start_date: "",
  //           end_date: "",
  //           schedule: "",
  //           delivery: "physical",
  //           capacity_physical: 20,
  //           capacity_virtual: 0,
  //           zoom_link: "",
  //           venue_details: "",
  //         });
  //         fetchData();
  //       })
  //       .catch((err) => alert(err.message));
  //   };

  //   const handleDelete = (id: number) => {
  //     if (!confirm("Are you sure you want to delete this class?")) return;
  //     fetch(`/api/classes/${id}`, { method: "DELETE" })
  //       .then((res) => {
  //         if (!res.ok) throw new Error("Failed to delete class");
  //         return res.json();
  //       })
  //       .then(() => fetchData())
  //       .catch((err) => alert(err.message));
  //   };

  //   if (error)
  //     return <div className="p-10 text-center text-rose-600">Error: {error}</div>;

  if (!classes) {
    return <div className="p-10 text-center text-zinc-500">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Classes
            </h1>
            <p className="text-zinc-500 mt-1">
              Schedule and manage training cohorts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search classes..."
                className="pl-10 pr-4 py-2 bg-white border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Plus size={18} />
              New Class
            </button>
          </div>
        </header>

        {/* <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900">
                  Schedule New Class
                </h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-zinc-400 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Course
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.course_id}
                    onChange={(e) => {
                      const course = courses.find(
                        (c) => c.id === parseInt(e.target.value),
                      );
                      setNewClass({
                        ...newClass,
                        course_id: e.target.value,
                        course_code: course?.code || "",
                      });
                    }}
                  >
                    <option value="">Select a course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Cohort Code
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.course_code}
                    onChange={(e) =>
                      setNewClass({ ...newClass, course_code: e.target.value })
                    }
                    placeholder="e.g. PMP-2026-01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Delivery Mode
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.delivery}
                    onChange={(e) =>
                      setNewClass({ ...newClass, delivery: e.target.value })
                    }
                  >
                    <option value="physical">Physical</option>
                    <option value="virtual">Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.start_date}
                    onChange={(e) =>
                      setNewClass({ ...newClass, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.end_date}
                    onChange={(e) =>
                      setNewClass({ ...newClass, end_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Schedule
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.schedule}
                    onChange={(e) =>
                      setNewClass({ ...newClass, schedule: e.target.value })
                    }
                    placeholder="e.g. Mon-Fri 9am-5pm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Physical Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={
                      isNaN(newClass.capacity_physical)
                        ? ""
                        : newClass.capacity_physical
                    }
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setNewClass({
                        ...newClass,
                        capacity_physical: isNaN(val) ? 0 : val,
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Virtual Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={
                      isNaN(newClass.capacity_virtual)
                        ? ""
                        : newClass.capacity_virtual
                    }
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setNewClass({
                        ...newClass,
                        capacity_virtual: isNaN(val) ? 0 : val,
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Zoom Link
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.zoom_link}
                    onChange={(e) =>
                      setNewClass({ ...newClass, zoom_link: e.target.value })
                    }
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Venue Details
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={newClass.venue_details}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        venue_details: e.target.value,
                      })
                    }
                    placeholder="e.g. Room 302, Tech Hub"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Schedule Class
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence> */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes
            // .filter(
            //   (cls) =>
            //     cls.course_code
            //       .toLowerCase()
            //       .includes(searchTerm.toLowerCase()) ||
            //     (cls.course_title || "")
            //       .toLowerCase()
            //       .includes(searchTerm.toLowerCase()),
            // )
            .map((cls) => {
              const { min, max } = getClassDateRange(cls.sessions);
              return (
                <Card
                  key={cls.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="px-2 py-1 rounded bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                      {cls.course.code}
                    </div>
                    {/* <span
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        cls.delivery === "virtual"
                          ? "bg-blue-50 text-blue-700"
                          : cls.delivery === "physical"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {cls.delivery}
                    </span> */}
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2">
                    {cls.classId} - {cls.course.title || cls.course.code}
                  </h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar size={14} />
                      <span>
                        {min && min.toLocaleDateString()} -{" "}
                        {max && max.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Users size={14} />
                      <span>{cls.noOfEnrollments || 0} Enrolled</span>
                    </div>
                    {/* {cls.delivery === "virtual" && cls.zoom_link && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 truncate">
                        <BookOpen size={14} />
                        <a
                          href={cls.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Zoom Link
                        </a>
                      </div>
                    )} */}
                    {/* {cls.delivery !== "virtual" && cls.venue_details && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
                        <Building2 size={14} />
                        <span>{cls.venue_details}</span>
                      </div>
                    )} */}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setShowAddModal(true);
                      }}
                      className="flex-1 bg-zinc-100 text-zinc-900 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="p-2 border border-zinc-100 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-zinc-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              );
            })}
          {classes.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-zinc-200 text-zinc-400">
              No classes scheduled yet.
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddModal && (
            <ClassFormModal
              data={selectedClass}
              onClose={() => {
                setSelectedClass(null);
                refreshClasses();
                setShowAddModal(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* <AnimatePresence>
          {isAdding && (
            <ClassFormModal
              cls={selectedClass}
              onClose={() => setSelectedClass(null)}
            />
          )}
        </AnimatePresence> */}
      </div>
    </AdminLayout>
  );
};

export default ClassesList;
