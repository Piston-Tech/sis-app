"use client";

import apiClient from "@/services/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobal } from "@/app/GlobalProvider";
import type {
  Credential,
  DashboardResponse,
  RecommendedCourse,
  ReferralSummary,
  StudentEnrollment,
} from "./types";

/** Query keys for everything the student portal caches. */
export const studentKeys = {
  all: ["student"] as const,
  dashboard: () => [...studentKeys.all, "dashboard"] as const,
  enrollments: () => [...studentKeys.all, "enrollments"] as const,
  enrollment: (id: string) => [...studentKeys.all, "enrollments", id] as const,
  recommendations: () => [...studentKeys.all, "recommendations"] as const,
  certificates: () => [...studentKeys.all, "certificates"] as const,
  badges: () => [...studentKeys.all, "badges"] as const,
  referrals: () => [...studentKeys.all, "referrals"] as const,
  courses: () => ["courses"] as const,
};

/** Accepts `{ data: [...] }` (optionally with `pagination`) or a bare array. */
const listFrom = <T,>(body: unknown): T[] => {
  if (Array.isArray(body)) return body as T[];
  const data = (body as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
};

export const useDashboard = () =>
  useQuery({
    queryKey: studentKeys.dashboard(),
    queryFn: async (): Promise<DashboardResponse> => {
      const { data } = await apiClient.get("/student/dashboard");
      return {
        student: data?.student ?? null,
        enrollments: Array.isArray(data?.enrollments) ? data.enrollments : [],
        transactions: Array.isArray(data?.transactions) ? data.transactions : [],
        sessions: Array.isArray(data?.sessions) ? data.sessions : [],
      };
    },
  });

export const useEnrollments = () =>
  useQuery({
    queryKey: studentKeys.enrollments(),
    queryFn: async () => {
      // Match the dashboard route: fetch up to 100 so balances are complete.
      const { data } = await apiClient.get("/students/enrollments", {
        params: { limit: 100 },
      });
      return listFrom<StudentEnrollment>(data);
    },
  });

export const useEnrollment = (enrollmentId: string) =>
  useQuery({
    queryKey: studentKeys.enrollment(enrollmentId),
    enabled: Boolean(enrollmentId),
    queryFn: async (): Promise<StudentEnrollment | null> => {
      const { data } = await apiClient.get(
        `/students/enrollments/${encodeURIComponent(enrollmentId)}`,
      );
      return (data?.data as StudentEnrollment | undefined) ?? null;
    },
  });

export const useRecommendations = () =>
  useQuery({
    queryKey: studentKeys.recommendations(),
    queryFn: async () => {
      const { data } = await apiClient.post("/students/recommendations", {});
      return listFrom<RecommendedCourse>(data);
    },
  });

export const useCourses = () =>
  useQuery({
    queryKey: studentKeys.courses(),
    queryFn: async () => {
      const { data } = await apiClient.get("/courses");
      return listFrom<RecommendedCourse>(data);
    },
  });

export const useCertificates = () =>
  useQuery({
    queryKey: studentKeys.certificates(),
    queryFn: async () => {
      const { data } = await apiClient.get("/students/certificates", {
        timeout: 60_000,
      });
      return listFrom<Credential>(data);
    },
  });

export const useBadges = () =>
  useQuery({
    queryKey: studentKeys.badges(),
    queryFn: async () => {
      const { data } = await apiClient.get("/students/badges", {
        timeout: 60_000,
      });
      return listFrom<Credential>(data);
    },
  });

export const useReferrals = () =>
  useQuery({
    queryKey: studentKeys.referrals(),
    queryFn: async (): Promise<ReferralSummary | null> => {
      const { data } = await apiClient.get("/student/referrals");
      return (data?.data as ReferralSummary | undefined) ?? null;
    },
  });

/**
 * Updates the signed-in student's own profile (PUT /user -> PUT /students/me).
 * Never send `id`, `email` or `membershipTier`: the backend ignores them.
 */
export type ProfileUpdate = {
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  persona?: string;
  metaData?: Record<string, unknown>;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { getCurrentUser } = useGlobal();

  return useMutation({
    mutationFn: async (payload: ProfileUpdate) => {
      const { data } = await apiClient.put("/user", payload);
      if (!data?.success) {
        throw new Error(data?.error || "We couldn't save your profile.");
      }
      return data;
    },
    onSuccess: async () => {
      await getCurrentUser();
      // Profile answers drive recommendations.
      await queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
};
