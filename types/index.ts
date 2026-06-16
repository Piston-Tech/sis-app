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
