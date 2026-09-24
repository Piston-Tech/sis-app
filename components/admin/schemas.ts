import { z } from "zod";

/**
 * Client-side validation for admin forms. Field names match the request
 * bodies sent to the API; backend `errors: { field: msg }` use the same keys.
 */

const requiredText = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => v ?? "");

const requiredId = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .int()
    .positive(`${label} is required`);

const requiredDate = (label: string) =>
  z.date({ error: `${label} is required` }).refine((d) => !isNaN(d.getTime()), {
    message: `${label} is required`,
  });

const time = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, `${label} is required`);

const money = (label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .min(0, `${label} cannot be negative`);

export const studentSchema = z.object({
  prefix: optionalText,
  firstName: requiredText("First name"),
  middleName: optionalText,
  lastName: requiredText("Last name"),
  email: z.email("Enter a valid email address"),
  phone: optionalText.refine((v) => !v || /^[+\d][\d\s()-]{6,}$/.test(v), {
    message: "Enter a valid phone number",
  }),
  companyId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .transform((v) => v ?? null),
  membershipTier: optionalText,
  persona: optionalText,
});
export type StudentInput = z.input<typeof studentSchema>;
export type StudentPayload = z.output<typeof studentSchema>;

export const companySchema = z.object({
  name: requiredText("Name"),
  industry: requiredText("Industry"),
});
export type CompanyPayload = z.output<typeof companySchema>;

export const courseSchema = z.object({
  title: requiredText("Title"),
  code: requiredText("Code"),
  category: requiredText("Category"),
  subCategory: optionalText,
  description: optionalText,
  duration: z
    .number({ error: "Duration is required" })
    .positive("Duration must be greater than 0"),
  /** Course.levelId (select value is a string). Required: pricing depends on it. */
  levelId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) =>
      v === "" || v === null || v === undefined ? null : Number(v),
    )
    .refine((v) => v !== null && Number.isInteger(v) && v > 0, {
      message: "Select a level",
    }),
  link: optionalText.refine((v) => !v || /^https?:\/\/\S+$/i.test(v), {
    message: "Enter a valid URL (https://...)",
  }),
});
export type CoursePayload = z.output<typeof courseSchema>;

export const sessionSchema = z
  .object({
    id: z.number().optional(),
    date: requiredDate("Session date"),
    startTime: time("Start time"),
    endTime: time("End time"),
    delivery: optionalText,
    zoomLink: optionalText.refine((v) => !v || /^https?:\/\/\S+$/i.test(v), {
      message: "Enter a valid URL (https://...)",
    }),
    venueDetails: optionalText,
    status: optionalText,
    notes: optionalText,
  })
  .refine((s) => s.endTime > s.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const customClassSchema = z.object({
  title: requiredText("Title"),
  description: optionalText,
  instructions: optionalText,
  price: money("Price"),
});

export const classSchema = z
  .object({
    courseId: requiredId("Course"),
    plannedStartDate: requiredDate("Planned start date"),
    schedule: requiredText("Schedule"),
    isCustom: z.boolean(),
    customClass: z.unknown().optional(),
    sessions: z.array(sessionSchema).min(1, "Add at least one session"),
  })
  .superRefine((value, ctx) => {
    if (!value.isCustom) return;
    const result = customClassSchema.safeParse(value.customClass);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: ["customClass", ...issue.path.map(String)],
        }),
      );
    }
  })
  .transform((value) => ({
    ...value,
    customClass: value.isCustom
      ? customClassSchema.parse(value.customClass)
      : undefined,
  }));
export type ClassPayload = z.output<typeof classSchema>;

export const enrollmentSchema = z.object({
  studentId: requiredId("Student"),
  classId: requiredId("Class"),
  cba: requiredText("CBA"),
  delivery: requiredText("Delivery"),
  tierId: requiredId("Plan"),
  status: requiredText("Status"),
});

export const addEnrollmentSchema = enrollmentSchema.extend({
  transactionId: requiredId("Transaction"),
});
export type AddEnrollmentPayload = z.output<typeof addEnrollmentSchema>;

export const transactionSchema = z
  .object({
    payerType: z.enum(["B2C", "B2B"], { error: "Payer type is required" }),
    payerId: requiredId("Payer"),
    total: money("Total"),
    discount: money("Discount"),
    enrollments: z
      .array(enrollmentSchema)
      .min(1, "At least one enrollment is required"),
  })
  .refine((t) => t.discount <= t.total, {
    message: "Discount cannot exceed the total",
    path: ["discount"],
  });
export type TransactionPayload = z.output<typeof transactionSchema>;

export const transactionUpdateSchema = z.object({
  discount: money("Discount"),
  nextPaymentDate: z.date().nullable().optional(),
});

export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Card"] as const;

export const paymentSchema = z.object({
  transactionId: requiredId("Transaction"),
  category: optionalText,
  amountPaid: z
    .number({ error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  status: z.literal("PENDING"),
  receiptSent: z.boolean(),
  method: optionalText,
  paymentDate: z.date().nullable().optional(),
});
export type PaymentPayload = z.output<typeof paymentSchema>;
