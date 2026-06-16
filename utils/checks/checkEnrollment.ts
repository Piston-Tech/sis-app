import { CreateEnrollmentData } from "@/types";

const checkEnrollment = (enrollment: CreateEnrollmentData, type: string) => {
  const errors: Record<
    keyof Omit<CreateEnrollmentData, "transactionId">,
    string
  > = {
    studentId: "",
    classId: "",
    cba: "",
    delivery: "",
    tierId: "",
    status: "",
  };

  if (!enrollment.studentId && type === "B2B") {
    errors.studentId = "Student is required";
  }

  if (!enrollment.classId) {
    errors.classId = "Class is required";
  }

  if (!enrollment.cba) {
    errors.cba = "CBA is required";
  }

  if (!enrollment.delivery) {
    errors.delivery = "Delivery method is required";
  }

  if (!enrollment.tierId) {
    errors.tierId = "Tier is required";
  }

  if (!enrollment.status) {
    errors.status = "Status is required";
  }

  return errors;
};

export default checkEnrollment;
