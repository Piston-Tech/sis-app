import GlobalState from "./GlobalState";
import LoginCredentials from "./LoginCredentials";
import SignupCredentials from "./SignupCredentials";
import AuthResponse from "./SignupAuthResponse";
import UserDetails from "./UserDetails";
import Stats from "./Stats";
import Student from "./Student";
import Company from "./Company";
import Transaction, { CreateTransactionData } from "./Transaction";
import Enrollment, { CreateEnrollmentData } from "./Enrollment";
import Course from "./Course";
import Class from "./Class";
import Session from "./Session";
import Tier from "./Tier";
import SelectedClassSearch from "./SelectedClassSearch";
import Payment from "./Payment";

export enum UserRole {
  JOB_SEEKER = "JOB_SEEKER",
  PROFESSIONAL = "PROFESSIONAL",
  SME_OWNER = "SME_OWNER",
  CORPORATE_ADMIN = "CORPORATE_ADMIN",
}

export enum MembershipTier {
  BASIC = "BASIC",
  PRO = "PRO",
  ELITE = "ELITE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: MembershipTier;
  avatar?: string;
  bio?: string;
  skills: string[];
  goals: string[];
  onboarded: boolean;
  companyName?: string;
  parentId?: string; // For B2B employee hierarchy
  status: "Active" | "At Risk" | "Inactive";
  progress: number;
}

export interface Resource {
  id: string;
  title: string;
  type: "Template" | "Toolkit" | "Report";
  downloadUrl: string;
}

export interface CorporateAccount {
  id: string;
  name: string;
  adminName: string;
  employeeCount: number;
  subscriptionEnd: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "course" | "community" | "system" | "achievement";
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface Program {
  id: string;
  title: string;
  courses: string[]; // Course IDs
  progress: number;
  description: string;
  thumbnail: string;
}

export interface LearningPath {
  id: string;
  title: string;
  goal: string;
  milestones: {
    id: string;
    title: string;
    type: "course" | "activity" | "project";
    refId: string; // Course ID or other
    isCompleted: boolean;
  }[];
}

export interface AdminAttributes {
  id: number;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClassAttributes {
  id: number;
  classId: string;
  courseId: number;
  plannedStartDate: Date;
  schedule: string;
  isCustom: boolean;
  course?: CourseAttributes;
  sessions?: SessionAttributes[];
  enrollments?: EnrollmentAttributes[];
  customClass?: CustomClassAttributes;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyAttributes {
  id: number;
  companyId: string;
  name: string;
  industry: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseAttributes {
  id: number;
  code: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  subCategory: string;
  levelId: number;
  link: string;
  level?: CourseLevelAttributes;
  classes?: ClassAttributes[];
  prices?: PricingMatrixAttributes[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseLevelAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomClassAttributes {
  id: number;
  customClassId: string;
  classId: number;
  title: string;
  description: string;
  instructions: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnrollmentAttributes {
  id: number;
  enrollmentId: string;
  transactionId: number;
  studentId: number;
  classId: number;
  cba: string;
  delivery: string;
  tierId: number;
  status: string;
  transaction?: TransactionAttributes;
  student?: StudentAttributes;
  class?: ClassAttributes;
  tier?: TierAttributes;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentAttributes {
  id: number;
  paymentId: string;
  transactionId: number;
  category: string;
  amountPaid: number;
  status: string;
  receiptSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PricingMatrixAttributes {
  id: number;
  levelId: number;
  duration: number;
  tierId: number;
  price: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface SessionAttributes {
  id: number;
  sessionId: string;
  classId: number;
  date: Date;
  startTime: string;
  endTime: string;
  delivery: string;
  zoomLink: string;
  venueDetails: string;
  status: string;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentAttributes {
  id: number;
  studentId: string;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  companyId: number;
  membershipTier: string;
  persona: string;
  googleId?: string;
  linkedInId?: string;
  enrollments?: EnrollmentAttributes[];
  company?: CompanyAttributes;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TierAttributes {
  id: number;
  name: string;
  shortName: string;
  subTitle: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionAttributes {
  id: number;
  transactionId: string;
  payerId: number;
  payerType: string;
  total: number;
  discount: number;
  nextPaymentDate: Date;
  payments?: PaymentAttributes[];
  enrollments?: EnrollmentAttributes[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardData {
  student: StudentAttributes;
  enrollments: EnrollmentAttributes[];
  transactions: TransactionAttributes[];
  payments?: PaymentAttributes[];
  sessions: SessionAttributes[];
  nextSession?: SessionAttributes;
  programs: Program[];
  learningPath?: LearningPath;
  summary: {
    totalPaid: number;
    totalOutstanding: number;
    attendanceRate: number;
    completionRate: number;
    creditsEarned: number;
    gpa?: number; // Optional if they want to mimic UoPeople
  };
}

export type {
  Stats,
  Student,
  Company,
  Transaction,
  CreateTransactionData,
  Enrollment,
  CreateEnrollmentData,
  GlobalState,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  UserDetails,
  Course,
  Class,
  Session,
  Tier,
  SelectedClassSearch,
  Payment,
};
