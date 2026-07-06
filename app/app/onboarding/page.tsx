"use client";

import { useEffect, useState } from "react";
import { UserRole, MembershipTier } from "@/types";
import apiClient from "@/services/apiClient";
import { useGlobal } from "@/app/GlobalProvider";
import handleRequestError from "@/utils/handleRequestError";
import { useRouter } from "next/navigation";
import Loading from "@/app/app/loading";
import { ErrorMsg } from "@/components/Form";
import {
  getCategories,
  getSubcategoriesByCategory,
  getProfessionsBySubcategory,
  getInterestsBySubcategory,
} from "@/utils/recommendationTreeUtils";

interface ProfessionDetails {
  category?: string;
  subCategory?: string;
  profession?: string;
  level?: number;
}

interface FormDataType {
  // Profile fields
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Career info
  careerStage: string;
  primaryGoal: string;
  
  // Persona & membership
  persona: string;
  membershipTier: string;
  
  // Metadata
  currentProfession: ProfessionDetails;
  goalProfession: ProfessionDetails;
  prioritise: "Goal Profession" | "Current Profession" | "Both";
  preferredTags: string[];
}

const OnboardingPage = () => {
  const { currentUser, getCurrentUser } = useGlobal();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [categories] = useState(getCategories());
  const [currentSubcategories, setCurrentSubcategories] = useState<string[]>([]);
  const [currentProfessions, setCurrentProfessions] = useState<string[]>([]);
  const [currentInterests, setCurrentInterests] = useState<string[]>([]);
  
  const [goalSubcategories, setGoalSubcategories] = useState<string[]>([]);
  const [goalProfessions, setGoalProfessions] = useState<string[]>([]);
  const [goalInterests, setGoalInterests] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormDataType>({
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    careerStage: "",
    primaryGoal: "",
    persona: "",
    membershipTier: MembershipTier.BASIC,
    currentProfession: {},
    goalProfession: {},
    prioritise: "Both",
    preferredTags: [],
  });

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.persona) {
      router.replace("/");
    } else if (currentUser.email) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
      }));
    }
  }, [currentUser, router]);

  const careerStageOptions = [
    "Student/Fresh Grad",
    "Working Professional",
    "SME Owner",
    "HR/Corporate Manager",
  ];

  const primaryGoalOptions = [
    "Land my first job",
    "Get a promotion",
    "Scale my business",
    "Train my team",
  ];

  const levelOptions = [
    { label: "Beginner", value: 1 },
    { label: "Intermediate", value: 2 },
    { label: "Advanced", value: 3 },
  ];

  const determinPersona = (stage: string): string => {
    if (stage === "Student/Fresh Grad") return UserRole.JOB_SEEKER;
    if (stage === "SME Owner") return UserRole.SME_OWNER;
    if (stage === "HR/Corporate Manager") return UserRole.CORPORATE_ADMIN;
    return UserRole.PROFESSIONAL;
  };

  const handleCurrentCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      currentProfession: { category },
    }));
    const subs = getSubcategoriesByCategory(category);
    setCurrentSubcategories(subs);
    setCurrentProfessions([]);
    setCurrentInterests([]);
  };

  const handleCurrentSubcategoryChange = (subcategory: string) => {
    setFormData((prev) => ({
      ...prev,
      currentProfession: { ...prev.currentProfession, subCategory: subcategory },
    }));
    const profs = getProfessionsBySubcategory(
      formData.currentProfession.category || "",
      subcategory
    );
    const interests = getInterestsBySubcategory(
      formData.currentProfession.category || "",
      subcategory
    );
    setCurrentProfessions(profs);
    setCurrentInterests(interests);
  };

  const handleGoalCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      goalProfession: { category },
    }));
    const subs = getSubcategoriesByCategory(category);
    setGoalSubcategories(subs);
    setGoalProfessions([]);
    setGoalInterests([]);
  };

  const handleGoalSubcategoryChange = (subcategory: string) => {
    setFormData((prev) => ({
      ...prev,
      goalProfession: { ...prev.goalProfession, subCategory: subcategory },
    }));
    const profs = getProfessionsBySubcategory(
      formData.goalProfession.category || "",
      subcategory
    );
    const interests = getInterestsBySubcategory(
      formData.goalProfession.category || "",
      subcategory
    );
    setGoalProfessions(profs);
    setGoalInterests(interests);
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredTags: prev.preferredTags.includes(tag)
        ? prev.preferredTags.filter((t) => t !== tag)
        : [...prev.preferredTags, tag],
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      if (!formData.phone.trim()) errors.phone = "Phone is required";
    } else if (currentStep === 2) {
      if (!formData.careerStage) errors.careerStage = "Career stage is required";
      if (!formData.primaryGoal) errors.primaryGoal = "Primary goal is required";
    } else if (currentStep === 3) {
      if (!formData.currentProfession.category)
        errors.currentCategory = "Current category is required";
      if (!formData.currentProfession.subCategory)
        errors.currentSubCategory = "Current sub-category is required";
      if (!formData.currentProfession.profession)
        errors.currentProfession = "Current profession is required";
      if (!formData.currentProfession.level)
        errors.currentLevel = "Current level is required";
    } else if (currentStep === 4) {
      if (!formData.goalProfession.category)
        errors.goalCategory = "Goal category is required";
      if (!formData.goalProfession.subCategory)
        errors.goalSubCategory = "Goal sub-category is required";
      if (!formData.goalProfession.profession)
        errors.goalProfession = "Goal profession is required";
      if (!formData.goalProfession.level)
        errors.goalLevel = "Goal level is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 2) {
        setFormData((prev) => ({
          ...prev,
          persona: determinPersona(formData.careerStage),
        }));
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(Math.max(1, step - 1));
  };

  const finalize = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      if (!currentUser) return;

      const { data } = await apiClient.put("/user", {
        id: currentUser.id,
        prefix: formData.prefix,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        membershipTier: formData.membershipTier,
        persona: formData.persona,
        metaData: {
          currentProfession: formData.currentProfession,
          goalProfession: formData.goalProfession,
          prioritise: formData.prioritise,
          preferredTags: formData.preferredTags,
        },
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to save profile");
      }

      getCurrentUser();
      router.replace("/");
    } catch (e: any) {
      handleRequestError(e, setError, (errors) =>
        setError((Object.values(errors)[0] as string) || "An error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <Loading />;
  }

  if (currentUser.persona) {
    return <Loading />;
  }

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        {/* Progress bar */}
        <div className="flex justify-between mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i + 1}
              className={`h-2 flex-1 mx-1 rounded-full ${
                step >= i + 1 ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Profile Information */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Your Profile
              </h2>
              <p className="text-slate-600 mb-6">
                Let's start with your basic information
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Prefix
                    </label>
                    <input
                      type="text"
                      placeholder="Mr., Ms., Dr., etc."
                      value={formData.prefix}
                      onChange={(e) =>
                        setFormData({ ...formData, prefix: e.target.value })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.firstName
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-blue-500"
                      }`}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      placeholder="Middle name"
                      value={formData.middleName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          middleName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.lastName
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-blue-500"
                      }`}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    disabled
                    className="w-full p-3 border border-slate-300 rounded-lg bg-slate-100 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This is your registered email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Career Stage & Goals */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Career Information
              </h2>
              <p className="text-slate-600 mb-6">
                Help us understand your professional background
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    What's your current career stage? *
                  </label>
                  <div className="space-y-2">
                    {careerStageOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setFormData({ ...formData, careerStage: option })
                        }
                        className={`w-full p-4 text-left border rounded-lg transition-all ${
                          formData.careerStage === option
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {formErrors.careerStage && (
                    <p className="text-red-500 text-xs mt-2">
                      {formErrors.careerStage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    What's your primary goal? *
                  </label>
                  <div className="space-y-2">
                    {primaryGoalOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setFormData({ ...formData, primaryGoal: option })
                        }
                        className={`w-full p-4 text-left border rounded-lg transition-all ${
                          formData.primaryGoal === option
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {formErrors.primaryGoal && (
                    <p className="text-red-500 text-xs mt-2">
                      {formErrors.primaryGoal}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Current Profession */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Current Profession
              </h2>
              <p className="text-slate-600 mb-6">
                Tell us about your current professional background
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.currentProfession.category || ""}
                    onChange={(e) => handleCurrentCategoryChange(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.currentCategory
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.currentCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.currentCategory}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sub-Category *
                  </label>
                  <select
                    value={formData.currentProfession.subCategory || ""}
                    onChange={(e) =>
                      handleCurrentSubcategoryChange(e.target.value)
                    }
                    disabled={!formData.currentProfession.category}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                      formErrors.currentSubCategory
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">
                      {formData.currentProfession.category
                        ? "Select a sub-category"
                        : "Select a category first"}
                    </option>
                    {currentSubcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  {formErrors.currentSubCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.currentSubCategory}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profession *
                  </label>
                  <select
                    value={formData.currentProfession.profession || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentProfession: {
                          ...formData.currentProfession,
                          profession: e.target.value,
                        },
                      })
                    }
                    disabled={!formData.currentProfession.subCategory}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                      formErrors.currentProfession
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">
                      {formData.currentProfession.subCategory
                        ? "Select a profession"
                        : "Select a sub-category first"}
                    </option>
                    {currentProfessions.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                  {formErrors.currentProfession && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.currentProfession}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Proficiency Level *
                  </label>
                  <select
                    value={formData.currentProfession.level || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentProfession: {
                          ...formData.currentProfession,
                          level: parseInt(e.target.value),
                        },
                      })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.currentLevel
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select your proficiency level</option>
                    {levelOptions.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.currentLevel && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.currentLevel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goal Profession */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Goal Profession
              </h2>
              <p className="text-slate-600 mb-6">
                What would you like to achieve professionally?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.goalProfession.category || ""}
                    onChange={(e) => handleGoalCategoryChange(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.goalCategory
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.goalCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.goalCategory}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sub-Category *
                  </label>
                  <select
                    value={formData.goalProfession.subCategory || ""}
                    onChange={(e) =>
                      handleGoalSubcategoryChange(e.target.value)
                    }
                    disabled={!formData.goalProfession.category}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                      formErrors.goalSubCategory
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">
                      {formData.goalProfession.category
                        ? "Select a sub-category"
                        : "Select a category first"}
                    </option>
                    {goalSubcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  {formErrors.goalSubCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.goalSubCategory}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profession *
                  </label>
                  <select
                    value={formData.goalProfession.profession || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goalProfession: {
                          ...formData.goalProfession,
                          profession: e.target.value,
                        },
                      })
                    }
                    disabled={!formData.goalProfession.subCategory}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                      formErrors.goalProfession
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">
                      {formData.goalProfession.subCategory
                        ? "Select a profession"
                        : "Select a sub-category first"}
                    </option>
                    {goalProfessions.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                  {formErrors.goalProfession && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.goalProfession}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Level *
                  </label>
                  <select
                    value={formData.goalProfession.level || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goalProfession: {
                          ...formData.goalProfession,
                          level: parseInt(e.target.value),
                        },
                      })
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.goalLevel
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select your target level</option>
                    {levelOptions.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.goalLevel && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.goalLevel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Preferences & Summary */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Preferences & Summary
              </h2>
              <p className="text-slate-600 mb-6">
                Choose your preferred focus and review your information
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    What should we prioritize?
                  </label>
                  <div className="space-y-2">
                    {["Goal Profession", "Current Profession", "Both"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              prioritise: option as
                                | "Goal Profession"
                                | "Current Profession"
                                | "Both",
                            })
                          }
                          className={`w-full p-3 text-left border rounded-lg transition-all ${
                            formData.prioritise === option
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Preferred Interests (Select relevant tags)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[...currentInterests, ...goalInterests]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            formData.preferredTags.includes(tag)
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    Profile Summary
                  </h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <strong>Name:</strong> {formData.prefix}{" "}
                      {formData.firstName} {formData.middleName}{" "}
                      {formData.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {formData.phone}
                    </p>
                    <p>
                      <strong>Career Stage:</strong> {formData.careerStage}
                    </p>
                    <p>
                      <strong>Primary Goal:</strong> {formData.primaryGoal}
                    </p>
                    <p>
                      <strong>Current Role:</strong>{" "}
                      {formData.currentProfession.profession}
                    </p>
                    <p>
                      <strong>Goal Role:</strong>{" "}
                      {formData.goalProfession.profession}
                    </p>
                    <p>
                      <strong>Priority:</strong> {formData.prioritise}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4">
                    <ErrorMsg message={error} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Next"}
            </button>
          ) : (
            <button
              onClick={finalize}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Finalizing..." : "Complete Onboarding"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
