import { useState } from "react";
import { Select, StudentSelector } from "@/components/Form";
import Modal from "@/components/Modal";
import apiClient from "@/services/apiClient";
import {
  Enrollment,
  CreateEnrollmentData,
  Payment,
  SelectedClassSearch,
} from "@/types";
import ClassSelector from "@/components/Form/ClassSelector";

const AddEnrollmentModal = ({
  close,
  transactionId,
  studentId,
}: {
  close: () => void;
  transactionId: number;
  studentId: number | undefined;
}) => {
  const [formData, setFormData] = useState<
    Omit<Enrollment, "id" | "enrollmentId" | "createdAt" | "updatedAt">
  >({
    transactionId,
    studentId: studentId ?? 0,
    classId: 0,
    cba: "",
    delivery: "",
    tierId: 0,
    status: "PROCESSING",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Record<keyof CreateEnrollmentData, string>
  >({
    transactionId: "",
    studentId: "",
    classId: "",
    cba: "",
    delivery: "",
    tierId: "",
    status: "",
  });

  const [selectedClass, setSelectedClass] = useState<SelectedClassSearch>();

  const handleAddEnrollment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addEnrollment(formData);
  };

  const addEnrollment = async (formData: CreateEnrollmentData) => {
    setLoading(true);

    try {
      const { data } = await apiClient.post("/admin/enrollments", formData);

      console.log(data);

      if (data.success) {
        alert(data.message);
        close();
      } else {
        if (data.errors) {
          setErrors({ ...data.errors });
        } else if (data.error) {
          alert(data.error);
        }
      }
    } catch (e: any) {
      console.log(e);
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Enrollment" onClose={close}>
      <form onSubmit={handleAddEnrollment} className="space-y-4">
        <StudentSelector
          disabled={studentId !== undefined}
          value={formData.studentId}
          onChange={(id) =>
            setFormData({
              ...formData,
              studentId: id,
            })
          }
          error={errors ? errors.studentId : undefined}
        />
        <ClassSelector
          value={formData.classId}
          onChange={(data) => {
            setFormData({
              ...formData,
              classId: data.id,
            });
            setSelectedClass(data);
          }}
          error={undefined}
        />
        <Select
          label="Plan"
          required
          name="tierId"
          data={formData}
          error={errors ? errors.tierId : undefined}
          options={
            selectedClass?.course.prices.map((p) => ({
              value: p.tierId,
              title: p.tier.name,
            })) ?? []
          }
          setData={(data) =>
            setFormData({ ...formData, tierId: parseInt(data.tierId) })
          }
        />
        <Select
          label="CBA"
          required
          name="cba"
          data={formData}
          error={errors ? errors.cba : undefined}
          options={["PA", "PC", "PA-D", "PA-G"]}
          setData={setFormData}
        />
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-xl font-bold mt-4"
        >
          Add Enrollment
        </button>
      </form>
    </Modal>
  );
};

export default AddEnrollmentModal;
