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
  getAllInterests,
} from "@/utils/recommendationTreeUtils";

const UserProfilePage = () => {
  const { currentUser: user, getCurrentUser } = useGlobal();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dropdown options
  const [categories, setCategories] = useState<string[]>([]);
  const [currentSubcategories, setCurrentSubcategories] = useState<string[]>(
    [],
  );
  const [goalSubcategories, setGoalSubcategories] = useState<string[]>([]);
  const [currentProfessions, setCurrentProfessions] = useState<string[]>([]);
  const [goalProfessions, setGoalProfessions] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState<string[]>([]);
  const [currentSubcategoryInterests, setCurrentSubcategoryInterests] =
    useState<string[]>([]);
  const [goalSubcategoryInterests, setGoalSubcategoryInterests] = useState<
    string[]
  >([]);

  const currentCategoryRef = useRef<string>("");
  const goalCategoryRef = useRef<string>("");

  type PrioritiseOption = "Goal Profession" | "Current Profession" | "Both";
  const prioritiseOptions: PrioritiseOption[] = [
    "Goal Profession",
    "Current Profession",
    "Both",
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentProfessionCategory: "",
    currentProfessionSubCategory: "",
    currentProfession: "",
    currentProfessionLevel: 0,
    goalProfessionCategory: "",
    goalProfessionSubCategory: "",
    goalProfession: "",
    goalProfessionLevel: 0,
    prioritise: "Both" as PrioritiseOption,
    preferredTags: [] as string[],
  });

  const [isCustomCurrent, setIsCustomCurrent] = useState(false);
  const [isCustomGoal, setIsCustomGoal] = useState(false);

  useEffect(() => {
    // Load dropdown options
    const cats = getCategories();
    const ints = getAllInterests();
    setCategories(cats);
    setAllInterests(ints);
  }, []);

  useEffect(() => {
    if (!user) return;

    const meta = (user as any).metaData || {};
    const currentMeta = meta.currentProfession || {};
    const goalMeta = meta.goalProfession || {};

    // 1. Fetch available lists early to run an intersection check
    const currentProfList =
      currentMeta.category && currentMeta.subCategory
        ? getProfessionsBySubcategory(
            currentMeta.category,
            currentMeta.subCategory,
          )
        : [];

    const goalProfList =
      goalMeta.category && goalMeta.subCategory
        ? getProfessionsBySubcategory(goalMeta.category, goalMeta.subCategory)
        : [];

    // 2. If a profession exists but isn't part of the regular option pool, mark as custom
    const isCurrentCustomVal =
      currentMeta.profession &&
      !currentProfList.includes(currentMeta.profession);
    const isGoalCustomVal =
      goalMeta.profession && !goalProfList.includes(goalMeta.profession);

    setIsCustomCurrent(!!isCurrentCustomVal);
    setIsCustomGoal(!!isGoalCustomVal);

    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      currentProfessionCategory: currentMeta.category || "",
      currentProfessionSubCategory: currentMeta.subCategory || "",
      currentProfession: currentMeta.profession || "",
      currentProfessionLevel: currentMeta.level || 0,
      goalProfessionCategory: goalMeta.category || "",
      goalProfessionSubCategory: goalMeta.subCategory || "",
      goalProfession: goalMeta.profession || "",
      goalProfessionLevel: goalMeta.level || 0,
      prioritise: meta.prioritise || "Both",
      preferredTags: meta.preferredTags || [],
    });

    currentCategoryRef.current = currentMeta.category || "";
    goalCategoryRef.current = goalMeta.category || "";

    if (currentMeta.category) {
      setCurrentSubcategories(getSubcategoriesByCategory(currentMeta.category));
      if (currentMeta.subCategory) {
        setCurrentProfessions(currentProfList);
        setCurrentSubcategoryInterests(
          getInterestsBySubcategory(
            currentMeta.category,
            currentMeta.subCategory,
          ),
        );
      }
    }

    if (goalMeta.category) {
      setGoalSubcategories(getSubcategoriesByCategory(goalMeta.category));
      if (goalMeta.subCategory) {
        setGoalProfessions(goalProfList);
        setGoalSubcategoryInterests(
          getInterestsBySubcategory(goalMeta.category, goalMeta.subCategory),
        );
      }
    }
  }, [user]);

  useEffect(() => {
    const categoryChanged =
      currentCategoryRef.current !== "" &&
      currentCategoryRef.current !== formData.currentProfessionCategory;

    if (formData.currentProfessionCategory) {
      const newSubcategories = getSubcategoriesByCategory(
        formData.currentProfessionCategory,
      );
      setCurrentSubcategories(newSubcategories);

      if (categoryChanged) {
        setFormData((prev) => ({
          ...prev,
          currentProfessionSubCategory: "",
          currentProfession: "",
          currentProfessionLevel: 0,
        }));
        setCurrentProfessions([]);
        setCurrentSubcategoryInterests([]);
        setIsCustomCurrent(false); // Reset custom toggle on branch changes
      }
    } else {
      setCurrentSubcategories([]);
      setCurrentProfessions([]);
      setCurrentSubcategoryInterests([]);
      setIsCustomCurrent(false);
    }

    currentCategoryRef.current = formData.currentProfessionCategory;
  }, [formData.currentProfessionCategory]);

  useEffect(() => {
    if (
      formData.currentProfessionCategory &&
      formData.currentProfessionSubCategory
    ) {
      const newProfessions = getProfessionsBySubcategory(
        formData.currentProfessionCategory,
        formData.currentProfessionSubCategory,
      );
      setCurrentProfessions(newProfessions);
      const newInterests = getInterestsBySubcategory(
        formData.currentProfessionCategory,
        formData.currentProfessionSubCategory,
      );
      setCurrentSubcategoryInterests(newInterests);

      // PROTECT CUSTOM VALUE: Only clear standard selections if they don't match the pool
      if (
        !isCustomCurrent &&
        !newProfessions.includes(formData.currentProfession)
      ) {
        setFormData((prev) => ({ ...prev, currentProfession: "" }));
      }
    } else {
      setCurrentProfessions([]);
      setCurrentSubcategoryInterests([]);
      setIsCustomCurrent(false);
    }
  }, [
    formData.currentProfessionCategory,
    formData.currentProfessionSubCategory,
    isCustomCurrent,
  ]);

  useEffect(() => {
    const categoryChanged =
      goalCategoryRef.current !== "" &&
      goalCategoryRef.current !== formData.goalProfessionCategory;

    if (formData.goalProfessionCategory) {
      const newSubcategories = getSubcategoriesByCategory(
        formData.goalProfessionCategory,
      );
      setGoalSubcategories(newSubcategories);

      if (categoryChanged) {
        setFormData((prev) => ({
          ...prev,
          goalProfessionSubCategory: "",
          goalProfession: "",
          goalProfessionLevel: 0,
        }));
        setGoalProfessions([]);
        setGoalSubcategoryInterests([]);
        setIsCustomGoal(false); // Reset custom toggle on branch changes
      }
    } else {
      setGoalSubcategories([]);
      setGoalProfessions([]);
      setGoalSubcategoryInterests([]);
      setIsCustomGoal(false);
    }

    goalCategoryRef.current = formData.goalProfessionCategory;
  }, [formData.goalProfessionCategory]);

  useEffect(() => {
    if (formData.goalProfessionCategory && formData.goalProfessionSubCategory) {
      const newProfessions = getProfessionsBySubcategory(
        formData.goalProfessionCategory,
        formData.goalProfessionSubCategory,
      );
      setGoalProfessions(newProfessions);
      const newInterests = getInterestsBySubcategory(
        formData.goalProfessionCategory,
        formData.goalProfessionSubCategory,
      );
      setGoalSubcategoryInterests(newInterests);

      // PROTECT CUSTOM VALUE: Only clear standard selections if they don't match the pool
      if (!isCustomGoal && !newProfessions.includes(formData.goalProfession)) {
        setFormData((prev) => ({ ...prev, goalProfession: "" }));
      }
    } else {
      setGoalProfessions([]);
      setGoalSubcategoryInterests([]);
      setIsCustomGoal(false);
    }
  }, [
    formData.goalProfessionCategory,
    formData.goalProfessionSubCategory,
    isCustomGoal,
  ]);

  // const interestSuggestions =
  //   currentSubcategoryInterests.length > 0 || goalSubcategoryInterests.length > 0
  //     ? Array.from(
  //         new Set([
  //           ...currentSubcategoryInterests,
  //           ...goalSubcategoryInterests,
  //         ]),
  //       )
  //     : allInterests;

  const interestSuggestions = allInterests;

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
          currentProfession: {
            category: formData.currentProfessionCategory,
            subCategory: formData.currentProfessionSubCategory,
            profession: formData.currentProfession,
            level: formData.currentProfessionLevel,
          },
          goalProfession: {
            category: formData.goalProfessionCategory,
            subCategory: formData.goalProfessionSubCategory,
            profession: formData.goalProfession,
            level: formData.goalProfessionLevel,
          },
          prioritise: formData.prioritise,
          preferredTags: formData.preferredTags,
        },
      } as any;

      const { data } = await apiClient.put("/user", payload);

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to update profile");
      }

      setSuccess("Profile updated");
      getCurrentUser();
    } catch (e: any) {
      handleRequestError(e, setError, (errs) =>
        setError((Object.values(errs)[0] as string) || "An error occurred"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    user && (
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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Company/Organization
                </label>
                <input
                  disabled
                  type="text"
                  value={
                    user.companyId ? "Associated Partner" : "Individual Account"
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Membership ID
                </label>
                <input
                  disabled
                  type="text"
                  value={user.studentId || "N/A"}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Current Profession Category
                </label>
                <select
                  value={formData.currentProfessionCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentProfessionCategory: e.target.value,
                    }))
                  }
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
                  Current Profession Sub Category
                </label>
                <select
                  value={formData.currentProfessionSubCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentProfessionSubCategory: e.target.value,
                    }))
                  }
                  disabled={!formData.currentProfessionCategory}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.currentProfessionCategory
                      ? "Select a category first"
                      : "Select a subcategory..."}
                  </option>
                  {currentSubcategories.map((subcategory) => (
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
                  value={isCustomCurrent ? "Other" : formData.currentProfession}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      setIsCustomCurrent(true);
                      setFormData((prev) => ({
                        ...prev,
                        currentProfession: "",
                      })); // Initialize clean text input space
                    } else {
                      setIsCustomCurrent(false);
                      setFormData((prev) => ({
                        ...prev,
                        currentProfession: val,
                      }));
                    }
                  }}
                  disabled={!formData.currentProfessionSubCategory}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.currentProfessionSubCategory
                      ? "Select a subcategory first"
                      : "Select a profession..."}
                  </option>
                  {currentProfessions.map((profession) => (
                    <option key={profession} value={profession}>
                      {profession}
                    </option>
                  ))}
                  {formData.currentProfessionSubCategory && (
                    <option value="Other">
                      Other (Type custom profession)
                    </option>
                  )}
                </select>

                {/* Conditionally Render Custom Profession Input Field */}
                {isCustomCurrent && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your current profession title..."
                    value={formData.currentProfession}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentProfession: e.target.value,
                      }))
                    }
                    className="w-full p-4 mt-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Current Level
                </label>
                <select
                  value={formData.currentProfessionLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentProfessionLevel: Number(e.target.value),
                    }))
                  }
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
                  Goal Profession Category
                </label>
                <select
                  value={formData.goalProfessionCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      goalProfessionCategory: e.target.value,
                    }))
                  }
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
                  Goal Profession Sub Category
                </label>
                <select
                  value={formData.goalProfessionSubCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      goalProfessionSubCategory: e.target.value,
                    }))
                  }
                  disabled={!formData.goalProfessionCategory}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.goalProfessionCategory
                      ? "Select a category first"
                      : "Select a subcategory..."}
                  </option>
                  {goalSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Goal Profession
                </label>
                <select
                  value={isCustomGoal ? "Other" : formData.goalProfession}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      setIsCustomGoal(true);
                      setFormData((prev) => ({ ...prev, goalProfession: "" })); // Initialize clean text input space
                    } else {
                      setIsCustomGoal(false);
                      setFormData((prev) => ({ ...prev, goalProfession: val }));
                    }
                  }}
                  disabled={!formData.goalProfessionSubCategory}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.goalProfessionSubCategory
                      ? "Select a subcategory first"
                      : "Select a profession..."}
                  </option>
                  {goalProfessions.map((profession) => (
                    <option key={profession} value={profession}>
                      {profession}
                    </option>
                  ))}
                  {formData.goalProfessionSubCategory && (
                    <option value="Other">
                      Other (Type custom profession)
                    </option>
                  )}
                </select>

                {/* Conditionally Render Custom Goal Profession Input Field */}
                {isCustomGoal && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your target profession title..."
                    value={formData.goalProfession}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        goalProfession: e.target.value,
                      }))
                    }
                    className="w-full p-4 mt-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Goal Level
                </label>
                <select
                  value={formData.goalProfessionLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      goalProfessionLevel: Number(e.target.value),
                    }))
                  }
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
                  Recommendation Priority
                </label>
                <select
                  value={formData.prioritise}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prioritise: e.target.value as PrioritiseOption,
                    }))
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {prioritiseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                  Preferred Tags
                </label>
                <TagInput
                  value={formData.preferredTags}
                  onChange={(preferredTags) =>
                    setFormData((prev) => ({ ...prev, preferredTags }))
                  }
                  suggestions={interestSuggestions}
                  placeholder="Type to search tags, press Enter or comma to add..."
                />
              </div>

              <div className="md:col-span-2 pt-6 space-y-3">
                {error && <div className="text-sm text-red-600">{error}</div>}
                {success && (
                  <div className="text-sm text-emerald-600">{success}</div>
                )}
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
    )
  );
};

export default UserProfilePage;
