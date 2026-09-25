/**
 * Shapes of the student-facing API responses, as returned by sis-backend
 * (controllers/enrollmentController.ts, recommendationService.ts, ...).
 * Everything the backend may omit is optional so the UI has to guard it.
 */

export type Numeric = number | string;

export interface StudentPayment {
  id: number;
  paymentId?: string;
  category?: string;
  amountPaid: Numeric;
  status?: string;
  createdAt?: string;
}

export interface StudentTransaction {
  id: number;
  transactionId?: string;
  payerId?: number;
  payerType?: string;
  total?: Numeric | null;
  discount?: Numeric | null;
  /** Sum of RECEIVED payments, computed by the backend. */
  totalPaid?: Numeric | null;
  nextPaymentDate?: string | null;
  payments?: StudentPayment[];
  createdAt?: string;
}

export interface StudentSession {
  id: number;
  sessionId?: string;
  classId: number;
  date: string;
  startTime?: string;
  endTime?: string;
  delivery?: string;
  zoomLink?: string | null;
  venueDetails?: string | null;
  status?: string;
  notes?: string | null;
}

export interface StudentCourse {
  id: number;
  code?: string;
  title?: string;
  description?: string;
  duration?: Numeric;
  category?: string;
  link?: string | null;
}

export interface StudentClass {
  id: number;
  classId?: string;
  plannedStartDate?: string | null;
  course?: StudentCourse | null;
  customClass?: {
    title?: string;
    description?: string;
    price?: Numeric;
  } | null;
  sessions?: StudentSession[];
}

export interface StudentTier {
  id: number;
  name?: string;
  shortName?: string;
}

export interface StudentEnrollment {
  id: number;
  enrollmentId: string;
  classId: number;
  transactionId?: number | null;
  delivery?: string;
  status?: string;
  cba?: string | null;
  createdAt?: string;
  class?: StudentClass | null;
  tier?: StudentTier | null;
  transaction?: StudentTransaction | null;
}

export interface DashboardResponse {
  student?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    company?: { name?: string } | null;
  } | null;
  enrollments: StudentEnrollment[];
  transactions: StudentTransaction[];
  sessions: StudentSession[];
}

export interface RecommendedCourse {
  id: number;
  code?: string;
  title: string;
  description?: string;
  duration?: Numeric;
  link?: string | null;
  recommendationScore?: Numeric;
  category?: string;
  subCategory?: { name?: string; category?: { name?: string } } | null;
  level?: { id?: number; name?: string; prices?: { price: Numeric }[] } | null;
}

export interface Credential {
  enrollmentId: string;
  courseTitle: string;
  issueDate: string;
  issued: boolean;
  owing: boolean;
  /** data: URL preview image */
  preview: string;
  /** API path for the downloadable file */
  download: string;
}

export interface ReferralSummary {
  referralCode: string;
  referralPoints: number;
  referrals: { id: number; firstName: string; lastName: string; status: string }[];
}
