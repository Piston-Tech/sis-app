/**
 * Column definitions for the admin bulk imports. `key` is the API field name
 * (and the exact template header); `aliases` are extra spellings accepted in
 * uploaded files (matched case/space/underscore/punctuation-insensitively).
 */

export type ImportKind = "students" | "enrollments";

export interface ImportField {
  key: string;
  label: string;
  required?: boolean;
  aliases?: readonly string[];
  example: string;
  hint?: string;
}

const STUDENT_FIELDS: readonly ImportField[] = [
  { key: "prefix", label: "Prefix", aliases: ["title", "salutation"], example: "Mr" },
  {
    key: "firstName",
    label: "First name",
    required: true,
    aliases: ["first name", "first_name", "given name", "forename"],
    example: "Chidi",
  },
  {
    key: "middleName",
    label: "Middle name",
    aliases: ["middle name", "middle_name", "other names"],
    example: "",
  },
  {
    key: "lastName",
    label: "Last name",
    required: true,
    aliases: ["last name", "last_name", "surname", "family name"],
    example: "Okafor",
  },
  {
    key: "email",
    label: "Email",
    required: true,
    aliases: ["email address", "e-mail", "mail"],
    example: "chidi.okafor@example.com",
  },
  {
    key: "phone",
    label: "Phone",
    aliases: ["phone number", "mobile", "mobile number", "telephone", "phone no"],
    example: "+2348012345678",
  },
  {
    key: "company",
    label: "Company",
    aliases: [
      "company id",
      "corporate id",
      "company name",
      "company code",
      "organisation",
      "organization",
      "org",
    ],
    example: "",
    hint: "ORG code, id or exact company name",
  },
  {
    key: "membershipTier",
    label: "Membership tier",
    aliases: ["membership tier", "membership"],
    example: "BASIC",
  },
  { key: "persona", label: "Persona", example: "PROFESSIONAL" },
];

const ENROLLMENT_FIELDS: readonly ImportField[] = [
  {
    key: "studentId",
    label: "Student ID",
    aliases: ["student id", "std", "student code", "student_id"],
    example: "",
    hint: "STD code of an existing student (or leave empty and give email)",
  },
  {
    key: "email",
    label: "Email",
    aliases: ["email address", "e-mail", "mail"],
    example: "ada.eze@example.com",
  },
  {
    key: "firstName",
    label: "First name",
    aliases: ["first name", "first_name", "given name", "forename"],
    example: "Ada",
  },
  {
    key: "lastName",
    label: "Last name",
    aliases: ["last name", "last_name", "surname", "family name"],
    example: "Eze",
  },
  {
    key: "phone",
    label: "Phone",
    aliases: ["phone number", "mobile", "mobile number", "telephone", "phone no"],
    example: "+2348098765432",
  },
  {
    key: "class",
    label: "Class",
    required: true,
    aliases: ["class id", "cls", "class code", "class_id"],
    example: "CLS261000",
    hint: "CLS code",
  },
  {
    key: "tier",
    label: "Tier",
    required: true,
    aliases: ["package", "plan", "tier name"],
    example: "Standard",
    hint: "Tier name, short name or id",
  },
  {
    key: "delivery",
    label: "Delivery",
    aliases: ["mode", "training mode", "delivery mode"],
    example: "Hybrid",
  },
  { key: "cba", label: "CBA", example: "PA" },
  { key: "status", label: "Status", aliases: ["enrollment status"], example: "" },
];

export const IMPORT_FIELDS: Readonly<Record<ImportKind, readonly ImportField[]>> = {
  students: STUDENT_FIELDS,
  enrollments: ENROLLMENT_FIELDS,
};

/** Human description of the "required" rule for a kind. */
export const REQUIRED_RULE: Readonly<Record<ImportKind, string>> = {
  students: "firstName, lastName and email are required.",
  enrollments:
    "class and tier are required, plus studentId or email (new students also need firstName and lastName).",
};

/**
 * Required columns that are missing from `headers` (canonical keys). For
 * enrollments a student identifier column (studentId or email) is needed too.
 */
export const missingRequiredColumns = (
  kind: ImportKind,
  headers: readonly string[],
): string[] => {
  const present = new Set(headers);
  const missing = IMPORT_FIELDS[kind]
    .filter((f) => f.required && !present.has(f.key))
    .map((f) => f.key);
  if (kind === "enrollments" && !present.has("studentId") && !present.has("email")) {
    missing.push("studentId or email");
  }
  return missing;
};
