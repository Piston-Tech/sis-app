"use client";

import { useState } from "react";
import { PROFICIENCY_LEVELS } from "@/constants/profile";
import type { StudentProfessionDetails } from "@/types/Student";
import useProfessionCategories from "@/hooks/useProfessionCategories";
import { SelectField, TextField } from "../FormControls";

const CUSTOM = "__custom__";

export type ProfessionErrors = Partial<
  Record<"category" | "subCategory" | "profession" | "level", string>
>;

interface Props {
  idPrefix: string;
  value: StudentProfessionDetails;
  onChange: (value: StudentProfessionDetails) => void;
  levelLabel: string;
  professionLabel?: string;
  required?: boolean;
  errors?: ProfessionErrors;
  categories: ReturnType<typeof useProfessionCategories>;
  className?: string;
}

/**
 * Category → sub-category → profession → level pickers, shared by
 * onboarding and the profile page. A profession that isn't in the list is
 * entered as free text ("Other").
 */
const ProfessionFields = ({
  idPrefix,
  value,
  onChange,
  levelLabel,
  professionLabel = "Profession",
  required,
  errors = {},
  categories: {
    categories,
    loading,
    getSubcategoriesByCategory,
    getProfessionsBySubcategory,
  },
  className = "grid grid-cols-1 gap-6 md:grid-cols-2",
}: Props) => {
  const subcategories = value.category ? getSubcategoriesByCategory(value.category) : [];
  const professions =
    value.category && value.subCategory
      ? getProfessionsBySubcategory(value.category, value.subCategory)
      : [];

  // null = decide from the data (a saved value that isn't in the list is custom).
  const [customChoice, setCustomChoice] = useState<boolean | null>(null);
  const isCustom =
    customChoice ??
    Boolean(value.profession && professions.length > 0 && !professions.includes(value.profession));

  return (
    <div className={className}>
      <SelectField
        id={`${idPrefix}-category`}
        label="Category"
        required={required}
        error={errors.category}
        value={value.category ?? ""}
        disabled={loading}
        onChange={(e) => {
          setCustomChoice(null);
          onChange({ category: e.target.value, level: value.level });
        }}
      >
        <option value="">{loading ? "Loading categories..." : "Select a category"}</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </SelectField>

      <SelectField
        id={`${idPrefix}-subcategory`}
        label="Sub-category"
        required={required}
        error={errors.subCategory}
        value={value.subCategory ?? ""}
        disabled={!value.category}
        onChange={(e) => {
          setCustomChoice(null);
          onChange({ ...value, subCategory: e.target.value, profession: "" });
        }}
      >
        <option value="">
          {value.category ? "Select a sub-category" : "Select a category first"}
        </option>
        {subcategories.map((subcategory) => (
          <option key={subcategory} value={subcategory}>
            {subcategory}
          </option>
        ))}
      </SelectField>

      <div>
        <SelectField
          id={`${idPrefix}-profession`}
          label={professionLabel}
          required={required}
          error={isCustom ? undefined : errors.profession}
          value={isCustom ? CUSTOM : (value.profession ?? "")}
          disabled={!value.subCategory}
          onChange={(e) => {
            if (e.target.value === CUSTOM) {
              setCustomChoice(true);
              onChange({ ...value, profession: "" });
            } else {
              setCustomChoice(false);
              onChange({ ...value, profession: e.target.value });
            }
          }}
        >
          <option value="">
            {value.subCategory ? "Select a profession" : "Select a sub-category first"}
          </option>
          {professions.map((profession) => (
            <option key={profession} value={profession}>
              {profession}
            </option>
          ))}
          {value.subCategory && <option value={CUSTOM}>Other (type it in)</option>}
        </SelectField>
        {isCustom && (
          <TextField
            id={`${idPrefix}-profession-custom`}
            label={`Your ${professionLabel.toLowerCase()}`}
            className="mt-3"
            required={required}
            error={errors.profession}
            value={value.profession ?? ""}
            onChange={(e) => onChange({ ...value, profession: e.target.value })}
          />
        )}
      </div>

      <SelectField
        id={`${idPrefix}-level`}
        label={levelLabel}
        required={required}
        error={errors.level}
        value={value.level ? String(value.level) : ""}
        onChange={(e) =>
          onChange({ ...value, level: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">Select a level</option>
        {PROFICIENCY_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label} – {level.description}
          </option>
        ))}
      </SelectField>
    </div>
  );
};

export default ProfessionFields;
