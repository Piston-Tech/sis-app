import apiClient from "@/services/apiClient";
import { Class, Session } from "@/types";
import CustomClass from "@/types/CustomClass";
import { useEffect, useState } from "react";

type ClassForm = Omit<
  Class,
  "id" | "classId" | "sessionId" | "updatedAt" | "createdAt"
>;
type CustomClassForm = Omit<
  CustomClass,
  "id" | "customClassId" | "updatedAt" | "createdAt"
>;
type SessionForm = Omit<
  Session,
  "id" | "sessionId" | "updatedAt" | "createdAt"
>;

const useClassForm = (
  data:
    | (Class & {
        noOfEnrollments?: number;
        customClass?: CustomClass;
        sessions?: Session[];
      })
    | null,
  close: () => void,
) => {
  const initialFormData: ClassForm = {
    courseId: 0,
    plannedStartDate: new Date(),
    isCustom: false,
    schedule: "",
  };

  const [formData, setFormData] = useState<ClassForm>(initialFormData);

  const [errors, setErrors] = useState<Record<keyof ClassForm, string>>({
    courseId: "",
    plannedStartDate: "",
    isCustom: "",
    schedule: "",
  });

  const initialCustomClassFormData: CustomClassForm = {
    classId: 0,
    title: "",
    description: "",
    instructions: "",
    price: 0,
  };
  const [customClassFormData, setCustomClassFormData] =
    useState<CustomClassForm>(initialCustomClassFormData);

  const [loading, setLoading] = useState(false);

  const initSessionData: SessionForm = {
    classId: 0,
    date: new Date(),
    startTime: "09:00",
    endTime: "15:00",
    zoomLink: "",
    venueDetails: "",
    status: "Confirmed",
    notes: "",
    delivery: "Hybrid",
  };

  const [sessions, setSessions] = useState<SessionForm[]>([initSessionData]);

  useEffect(() => {
    setFormData(data ?? initialFormData);
    if (data?.isCustom) {
      setCustomClassFormData({
        classId: data.id,
        title: data.customClass?.title ?? "",
        description: "",
        instructions: "",
        price: 0,
      });
    }

    const sessionsData =
      data?.sessions?.map((s) => ({
        classId: s.classId,
        date: new Date(s.date),
        startTime: s.startTime,
        endTime: s.endTime,
        zoomLink: s.zoomLink,
        venueDetails: s.venueDetails,
        status: s.status,
        notes: s.notes,
        delivery: s.delivery,
      })) ?? [];

    console.log(sessionsData);

    if (data?.sessions && sessionsData.length) {
      setSessions(sessionsData);
    }
  }, [data]);

  // useEffect(() => {
  //   console.log("Sessions updated:", sessions);
  // }, [sessions]);

  useEffect(() => {
    if (!data) {
      const newSessions = [...sessions];
      newSessions[0].date = formData.plannedStartDate;
      setSessions(newSessions);
    }
  }, [formData.plannedStartDate, sessions[0]]);

  const addSessionRow = () => {
    const date = sessions.length
      ? new Date(sessions[sessions.length - 1].date)
      : new Date(formData.plannedStartDate ?? "");

    if (sessions.length) date?.setDate(date.getDate() + 1);

    setSessions([
      ...sessions,
      {
        ...initSessionData,
        date,
      },
    ]);
    // setFormData((prev) => ({ ...prev, no_students: prev.no_students + 1 }));
  };

  const addClass = async (
    formData: Partial<Class> & {
      customClass?: CustomClassForm;
      sessions: SessionForm[];
    },
  ) => {
    setLoading(true);

    try {
      const { data } = await apiClient.post("/admin/classes", formData);

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

  const updateClass = async (id: number, formData: Partial<Class>) => {
    setLoading(true);

    try {
      const { data } = await apiClient.put("/admin/classes", formData);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.courseId ||
      !formData.schedule ||
      !formData.plannedStartDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (data) {
      updateClass(data.id, formData);
    } else {
      addClass({
        ...formData,
        sessions,
        ...(formData.isCustom ? { customClass: customClassFormData } : {}),
      });
    }
  };

  return {
    sessions,
    setSessions,
    addSessionRow,
    handleSubmit,
    formData,
    setFormData,
    loading,
    errors,
    customClassFormData,
    setCustomClassFormData,
  };
};

export default useClassForm;
