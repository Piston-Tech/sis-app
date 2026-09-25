/**
 * Shared student-profile vocabularies.
 *
 * PROFICIENCY_LEVELS: the recommendation engine (sis-backend
 * services/recommendationService.ts) compares a student's
 * `metaData.currentProfession.level` / `goalProfession.level` directly with
 * `Course.levelId`, so these values MUST match the ids of the `courseLevels`
 * table. Courses are created with four levels (Associate, Supervisors,
 * Management, Executives - see the admin course form), i.e. ids 1-4.
 *
 * PERSONAS: `Student.persona` is free text in the backend. The student
 * onboarding flow has always stored the upper-case codes below, so those are
 * the canonical stored values; `label` is what we show to people.
 */

export interface ProficiencyLevel {
  value: number;
  label: string;
  description: string;
}

export const PROFICIENCY_LEVELS: readonly ProficiencyLevel[] = [
  { value: 1, label: "Associate", description: "Entry level / individual contributor" },
  { value: 2, label: "Supervisor", description: "Leads a small team or workstream" },
  { value: 3, label: "Manager", description: "Manages teams, budgets or functions" },
  { value: 4, label: "Executive", description: "Senior leadership / business owner" },
] as const;

export const getProficiencyLabel = (value?: number | null) =>
  PROFICIENCY_LEVELS.find((level) => level.value === Number(value))?.label;

export interface PersonaOption {
  value: string;
  label: string;
  /** Career-stage wording used in onboarding. */
  careerStage: string;
}

export const PERSONAS: readonly PersonaOption[] = [
  { value: "JOB_SEEKER", label: "Career Starter", careerStage: "Student / fresh graduate" },
  { value: "PROFESSIONAL", label: "Career Ascend", careerStage: "Working professional" },
  { value: "SME_OWNER", label: "Business Owner", careerStage: "SME / business owner" },
  { value: "CORPORATE_ADMIN", label: "Corporate / HR Manager", careerStage: "HR or corporate manager" },
] as const;

/**
 * Human label for a stored persona. Also understands the label strings the
 * admin panel has historically written (e.g. "Career Ascend").
 */
export const getPersonaLabel = (persona?: string | null) => {
  if (!persona) return "";
  const match = PERSONAS.find(
    (option) =>
      option.value === persona ||
      option.label.toLowerCase() === persona.toLowerCase(),
  );
  return match?.label ?? persona.replace(/_/g, " ");
};

export type PrioritiseOption = "Goal Profession" | "Current Profession" | "Both";

export const PRIORITISE_OPTIONS: readonly {
  value: PrioritiseOption;
  label: string;
}[] = [
  { value: "Goal Profession", label: "My goal profession" },
  { value: "Current Profession", label: "My current profession" },
  { value: "Both", label: "Both equally" },
] as const;
