import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });

export const getPersonalizedRecommendation = async (surveyData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the following user survey data, suggest the best Piston & Fusion membership plan (Launchpad, Career Ascend, or SME Scale) and provide a 2-sentence rationale. Data: ${JSON.stringify(surveyData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedPlan: { type: Type.STRING },
            rationale: { type: Type.STRING },
            keyActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["recommendedPlan", "rationale", "keyActions"],
        },
      },
    });

    if (!response.text) throw new Error("No response from Gemini");

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return null;
  }
};

export const analyzeSkillGap = async (
  currentSkills: string[],
  targetRole: string,
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Compare these skills [${currentSkills.join(", ")}] against the role of "${targetRole}". Identify 3 missing skills and suggest P&F courses.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedCourses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["gaps", "suggestedCourses"],
        },
      },
    });

    if (!response.text) throw new Error("No response from Gemini");

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return null;
  }
};
