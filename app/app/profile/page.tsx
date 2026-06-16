"use client";

import { useEffect, useState, useRef } from "react";
import { useGlobal } from "@/app/GlobalProvider";
import AppLayout from "@/components/AppLayout";
import TagInput from "@/components/TagInput";
import { BookOpen, Moon, User } from "lucide-react";
import apiClient from "@/services/apiClient";
import handleRequestError from "@/utils/handleRequestError";
import {
  getCategories,
  getSubcategoriesByCategory,
  getProfessionsBySubcategory,
  getInterestsBySubcategory,
  getAllProfessions,
  getAllInterests,
} from "@/utils/recommendationTreeUtils";

const UserProfilePage = () => {
  const { currentUser: user, getCurrentUser } = useGlobal();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dropdown options
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [allProfessions, setAllProfessions] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState<string[]>([]);
  const [subcategoryInterests, setSubcategoryInterests] = useState<string[]>([]);

  // Track previous category to detect manual changes vs initial load
  const prevCategoryRef = useRef<string>("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    currentCategory: "",
    currentSubCategory: "",
    interests: [] as string[],
    currentProfession: "",
    currentLevel: 0,
    nextProfession: "",
    nextLevel: 0,
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Load dropdown options
    const cats = getCategories();
    const profs = getAllProfessions();
    const ints = getAllInterests();
    console.log("🚀 Initializing component with categories:", cats);
    console.log("🚀 All professions:", profs);
    console.log("🚀 All interests:", ints);
    setCategories(cats);
    setAllProfessions(profs);
    setAllInterests(ints);
  }, []);

  useEffect(() => {
    if (!user) return;
    const meta = (user as any).metaData || {};
    setFormData({
      firstName: (user as any).firstName || "",
      lastName: (user as any).lastName || "",
      email: (user as any).email || "",
      phone: (user as any).phone || "",
      currentCategory: meta.currentCategory || "",
      currentSubCategory: meta.currentSubCategory || "",
      interests: meta.interests || [],
      currentProfession: meta.currentProfession || "",
      currentLevel: meta.currentLevel || 0,
      nextProfession: meta.nextProfession || "",
      nextLevel: meta.nextLevel || 0,
    });

    // Set this as the "previous" category so the third effect knows not to reset
    prevCategoryRef.current = meta.currentCategory || "";

    // Load subcategories and professions from saved data
    if (meta.currentCategory) {
      const newSubcategories = getSubcategoriesByCategory(meta.currentCategory);
      setSubcategories(newSubcategories);

      if (meta.currentSubCategory) {
        const newProfessions = getProfessionsBySubcategory(meta.currentCategory, meta.currentSubCategory);
        const newInterests = getInterestsBySubcategory(meta.currentCategory, meta.currentSubCategory);
        setProfessions(newProfessions);
        setSubcategoryInterests(newInterests);
      }
    }
  }, [user]);

  // Update subcategories when category changes
  useEffect(() => {
    console.log("📌 currentCategory changed:", formData.currentCategory);
    
    // Only reset subcategory if category actually changed (not on initial load)
    const categoryActuallyChanged = prevCategoryRef.current !== "" && prevCategoryRef.current !== formData.currentCategory;
    
    if (formData.currentCategory) {
      const newSubcategories = getSubcategoriesByCategory(formData.currentCategory);
      console.log("📌 newSubcategories received:", newSubcategories);
      setSubcategories(newSubcategories);
      
      // Only reset if this is a manual category change, not initial load
      if (categoryActuallyChanged) {
        console.log("📌 Category changed, resetting subcategory");
        setFormData((prev) => ({ ...prev, currentSubCategory: "" }));
        setProfessions([]);
        setSubcategoryInterests([]);
      }
    } else {
      setSubcategories([]);
      setProfessions([]);
      setSubcategoryInterests([]);
    }
    
    // Update the ref for next time
    prevCategoryRef.current = formData.currentCategory;
  }, [formData.currentCategory]);

  // Update professions and interests when subcategory changes
  useEffect(() => {
    if (formData.currentCategory && formData.currentSubCategory) {
      const newProfessions = getProfessionsBySubcategory(
        formData.currentCategory,
        formData.currentSubCategory
      );
      const newInterests = getInterestsBySubcategory(
        formData.currentCategory,
        formData.currentSubCategory
      );
      setProfessions(newProfessions);
      setSubcategoryInterests(newInterests);
      // Reset profession if it's not in the new list
      if (!newProfessions.includes(formData.currentProfession)) {
        setFormData((prev) => ({ ...prev, currentProfession: "" }));
      }
    } else {
      setProfessions([]);
      setSubcategoryInterests([]);
    }
  }, [formData.currentCategory, formData.currentSubCategory]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        id: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        metaData: {
          currentCategory: formData.currentCategory,
          currentSubCategory: formData.currentSubCategory,
          interests: formData.interests,
          currentProfession: formData.currentProfession,
          currentLevel: formData.currentLevel,
          nextProfession: formData.nextProfession,
          nextLevel: formData.nextLevel,
        },
      } as any;

      const { data } = await apiClient.put("/user", payload);

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to update profile");
      }

      setSuccess("Profile updated");
      getCurrentUser();
    } catch (e: any) {
      handleRequestError(e, setError, (errs) => setError((Object.values(errs)[0] as string) || "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return user && (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <div className="relative inline-block mb-8">
              {/* <img
                src={`https://picsum.photos/seed/${user.id}/200/200`}
                className="w-32 h-32 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-xl"
                alt="Avatar"
              /> */}
              <div className="flex items-center justify-center w-32 h-32 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/20 border-4 border-white dark:border-slate-800 shadow-xl">
                <User className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg cursor-pointer">
                <Moon className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-8">
              {user.persona || "Professional Explorer"}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Status
                </p>
                <p className="text-xs font-black text-emerald-500">
                  {/* {user.status} */}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Tier
                </p>
                <p className="text-xs font-black text-slate-900 dark:text-white underline">
                  {user.membershipTier || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <button className="w-full py-5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-3">
            Delete Account Data
          </button>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3 underline decoration-blue-500 decoration-4 underline-offset-8">
            Account Details
          </h4>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Company/Organization</label>
              <input
                disabled
                type="text"
                value={user.companyId ? "Associated Partner" : "Individual Account"}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Membership ID</label>
              <input
                disabled
                type="text"
                value={user.studentId || "N/A"}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Current Category
              </label>
              <select
                value={formData.currentCategory}
                onChange={(e) => setFormData({ ...formData, currentCategory: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Current Sub Category
              </label>
              <select
                value={formData.currentSubCategory}
                onChange={(e) => setFormData({ ...formData, currentSubCategory: e.target.value })}
                disabled={!formData.currentCategory}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.currentCategory ? "Select a category first" : "Select a subcategory..."}
                </option>
                {/* {console.log("🎯 Rendering subcategories dropdown. subcategories:", subcategories)} */}
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Current Profession
              </label>
              <select
                value={formData.currentProfession}
                onChange={(e) => setFormData({ ...formData, currentProfession: e.target.value })}
                disabled={!formData.currentSubCategory}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.currentSubCategory ? "Select a subcategory first" : "Select a profession..."}
                </option>
                {professions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Current Level
              </label>
              <select
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: Number(e.target.value) })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value={0}>Select a level...</option>
                <option value={1}>Associate</option>
                <option value={2}>Supervisor</option>
                <option value={3}>Manager</option>
                <option value={4}>Executive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Next Profession
              </label>
              <select
                value={formData.nextProfession}
                onChange={(e) => setFormData({ ...formData, nextProfession: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Select a profession...</option>
                {allProfessions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Next Level
              </label>
              <select
                value={formData.nextLevel}
                onChange={(e) => setFormData({ ...formData, nextLevel: Number(e.target.value) })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value={0}>Select a level...</option>
                <option value={1}>Associate</option>
                <option value={2}>Supervisor</option>
                <option value={3}>Manager</option>
                <option value={4}>Executive</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                Interests
              </label>
              <TagInput
                value={formData.interests}
                onChange={(interests) => setFormData({ ...formData, interests })}
                suggestions={subcategoryInterests.length > 0 ? subcategoryInterests : allInterests}
                placeholder="Type to search interests, press Enter or comma to add..."
              />
            </div>

            <div className="md:col-span-2 pt-6 space-y-3">
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-emerald-600">{success}</div>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Saving..." : "Update Profile Information"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfilePage;
