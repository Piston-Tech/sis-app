import { MembershipTier } from ".";

export interface StudentProfessionDetails {
  category?: string;
  subCategory?: string;
  profession?: string;
  level?: number;
}

export interface StudentMetaData {
  currentProfession?: StudentProfessionDetails;
  goalProfession?: StudentProfessionDetails;
  prioritise?: "Goal Profession" | "Current Profession" | "Both";
  preferredTags?: string[];
}

export default interface Student {
  id: number;
  studentId: string;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  companyId?: number;
  membershipTier: MembershipTier | string;
  persona: string;
  metaData?: StudentMetaData;
  linkedinData: string;
  createdAt?: Date;
  updatedAt?: Date;
}
