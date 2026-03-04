import GlobalState from "./GlobalState";
import LoginCredentials from "./LoginCredentials";
import SignupCredentials from "./SignupCredentials";
import AuthResponse from "./SignupAuthResponse";
import UserDetails from "./UserDetails";
import Stats from "./Stats";
import Student from "./Student";
import Company from "./Company";

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

export interface Course {
  id: string;
  title: string;
  category: string;
  progress: number;
  thumbnail: string;
  tierRequired: MembershipTier;
  segments: UserRole[];
  dripDate?: string;
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
  GlobalState,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  UserDetails,
};
