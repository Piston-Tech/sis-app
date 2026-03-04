import { MembershipTier } from ".";

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
  linkedinData: string;
  createdAt?: Date;
  updatedAt?: Date;
}
