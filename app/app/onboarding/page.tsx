"use client";

import { useEffect, useState } from "react";
import { UserRole, MembershipTier } from "@/types";
import { getPersonalizedRecommendation } from "@/services/geminiService";
import apiClient from "@/services/apiClient";
import { useGlobal } from "@/app/GlobalProvider";
import handleRequestError from "@/utils/handleRequestError";
import { useRouter } from "next/navigation";
import Loading from "@/app/app/loading";
import { ErrorMsg } from "@/components/Form";

const OnboardingPage = () => {
  const { currentUser, getCurrentUser } = useGlobal();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    careerStage: "",
    primaryGoal: "",
    industry: "",
    companySize: "",
    skills: [] as string[],
  });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(currentUser);
    if (!currentUser) return;
    if (currentUser && currentUser.persona) {
      router.replace("/");
    }
  }, [currentUser]);

  const steps = [
    {
      title: "Current Stage",
      field: "careerStage",
      options: [
        "Student/Fresh Grad",
        "Working Professional",
        "SME Owner",
        "HR/Corporate Manager",
      ],
    },
    {
      title: "Primary Goal",
      field: "primaryGoal",
      options: [
        "Land my first job",
        "Get a promotion",
        "Scale my business",
        "Train my team",
      ],
    },
    {
      title: "Interest Area",
      field: "industry",
      options: [
        "Project Management",
        "Business Analysis",
        "Tech/Software",
        "Leadership",
      ],
    },
  ];

  const handleNext = async () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const rec = await getPersonalizedRecommendation(formData);
      setRecommendation(rec);
      setLoading(false);
      setStep(4);
    }
  };

  const finalize = async () => {
    setLoading(true);

    try {
      // Determine Role
      let role = UserRole.PROFESSIONAL;
      if (formData.careerStage === "Student/Fresh Grad")
        role = UserRole.JOB_SEEKER;
      if (formData.careerStage === "SME Owner") role = UserRole.SME_OWNER;
      if (formData.careerStage === "HR/Corporate Manager")
        role = UserRole.CORPORATE_ADMIN;

      if (!currentUser) return;

      const { data } = await apiClient.put("/user", {
        id: currentUser.id,
        membershipTier: MembershipTier.BASIC,
        persona: role,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to save persona");
      }

      getCurrentUser();
    } catch (e: any) {
      handleRequestError(e, setError, (errors) =>
        setError((Object.values(errors)[0] as string) || "An error occurred"),
      );
    } finally {
      setLoading(false);
      router.replace("/");
    }
  };

  if (!currentUser || currentUser.persona) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-full mx-1 rounded-full ${step >= s ? "bg-blue-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {step <= 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {steps[step - 1].title}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {steps[step - 1].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    setFormData({ ...formData, [steps[step - 1].field]: opt })
                  }
                  className={`p-4 text-left border rounded-xl transition-all ${
                    (formData as any)[steps[step - 1].field] === opt
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              disabled={!(formData as any)[steps[step - 1].field]}
              onClick={handleNext}
              className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? step === 3
                  ? "Getting Recommendation..."
                  : "Continuing..."
                : step === 3
                  ? "Get Recommendation"
                  : "Continue"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in zoom-in duration-500 text-center">
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600">
                  Curating your personalized path...
                </p>
              </div>
            ) : (
              <>
                <div className="inline-block p-2 px-4 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                  Recommended for You
                </div>
                <h2 className="text-3xl font-extrabold mb-4 text-slate-900">
                  {recommendation?.recommendedPlan || "Career Path Optimized"}
                </h2>
                <p className="text-slate-600 mb-8 leading-relaxed px-4">
                  {recommendation?.rationale}
                </p>

                <div className="bg-slate-50 p-6 rounded-xl text-left mb-8 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3">
                    Key Focus Areas:
                  </h3>
                  <ul className="space-y-2">
                    {recommendation?.keyActions?.map(
                      (action: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center text-slate-700"
                        >
                          <span className="mr-2 text-blue-500">✓</span> {action}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className={error ? "mb-4" : ""}>
                  <ErrorMsg message={error} />
                </div>

                <button
                  onClick={finalize}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  {loading ? "Finalising..." : "Enter Dashboard"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
