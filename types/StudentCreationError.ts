import Student from "./Student";

type StudentCreationErrors = Record<
  keyof Omit<
    Student,
    | "id"
    | "studentId"
    | "passwordHash"
    | "companyId"
    | "membershipTier"
    | "persona"
    | "linkedinData"
    | "createdAt"
    | "updatedAt"
  >,
  string
> & {
  password: string;
  confirmPassword: string;
  verificationToken: string;
};

export default StudentCreationErrors;
