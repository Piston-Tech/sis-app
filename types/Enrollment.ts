export default interface Enrollment {
  id: number;
  enrollmentId: string;
  transactionId: number;
  studentId: number;
  classId: number;
  cba: string;
  delivery: string;
  tierId: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateEnrollmentData = Pick<
  Enrollment,
  | "studentId"
  | "classId"
  | "cba"
  | "delivery"
  | "tierId"
  | "status"
> & {
  transactionId?: number;
};
