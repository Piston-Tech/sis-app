import Modal from "@/components/Modal";
import { Button, Input, Select, TextArea } from "@/components/Form";
import FormError from "@/components/admin/FormError";
import { useToast } from "@/components/admin/Toast";
import { courseSchema } from "@/components/admin/schemas";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { Course } from "@/types";
import { PROFICIENCY_LEVELS } from "@/constants/profile";

const CATEGORIES = [
  "Business Development Courses",
  "Customer Management Courses",
  "Data Management Courses",
  "Finance Management Courses",
  "Health & Safety Courses",
  "Hospitality & Restaurant Courses",
  "Human Resource Mgt Courses",
  "Legal & Regulatory Courses",
  "Marketing & Branding Courses",
  "Operations Management Courses",
  "Project Management Courses",
  "Sales Professionals Courses",
  "Training & Facilitation Courses",
  "Employee Programmes",
  "Leadership Programmes",
  "Tech & IT Programmes",
];

// Values are Course.levelId (courseLevels ids), shared with the student portal
const LEVELS = PROFICIENCY_LEVELS.map(({ value, label }) => ({ value, title: label }));

const withCurrent = (options: string[], current: string | undefined) =>
  current && !options.includes(current) ? [...options, current] : options;

const CourseFormModal = ({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const form = useFormState<{
    title: string;
    code: string;
    category: string;
    subCategory: string;
    description: string;
    duration: number | null;
    levelId: string;
    link: string;
  }>(() => ({
    title: course?.title ?? "",
    code: course?.code ?? "",
    category: course?.category ?? "",
    subCategory: course?.subCategory ?? "",
    description: course?.description ?? "",
    duration:
      course?.duration !== undefined && course?.duration !== null
        ? Number(course.duration)
        : null,
    levelId: course?.level?.id ? String(course.level.id) : "",
    link: course?.link ?? "",
  }));
  const { values, setValues, errors, formError } = form;
  const { create, update } = useResourceMutation<unknown>("courses");
  const saving = create.isPending || update.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || saving) return;
    const parsed = form.validate(courseSchema);
    if (!parsed) return;
    const { levelId, ...rest } = parsed;
    const payload = levelId ? { ...rest, levelId } : rest;

    try {
      const res = course
        ? await update.mutateAsync({ id: course.id, body: payload })
        : await create.mutateAsync(payload);
      toast.success(
        res.message || (course ? "Course updated." : "Course created."),
      );
      onClose();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <Modal
      title={
        course
          ? canWrite
            ? "Edit Course"
            : "Course Details"
          : "Add New Course"
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        <fieldset disabled={!canWrite} className="space-y-4">
          <Input
            label="Title"
            name="title"
            required
            data={values}
            setData={setValues}
            error={errors.title}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              name="code"
              required
              data={values}
              setData={setValues}
              error={errors.code}
            />
            <Select
              label="Category"
              name="category"
              required
              options={withCurrent(CATEGORIES, values.category)}
              data={values}
              setData={setValues}
              error={errors.category}
            />
          </div>
          <TextArea
            label="Description"
            name="description"
            data={values}
            setData={setValues}
            error={errors.description}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (days)"
              name="duration"
              type="number"
              min={1}
              required
              data={values}
              setData={setValues}
              error={errors.duration}
            />
            <Select
              label="Level"
              name="levelId"
              options={
                course?.level?.id &&
                !LEVELS.some((l) => l.value === course.level?.id)
                  ? [
                      ...LEVELS,
                      { value: course.level.id, title: course.level.name },
                    ]
                  : LEVELS
              }
              data={values}
              setData={setValues}
              error={errors.levelId}
            />
          </div>
          <Input
            label="Link"
            name="link"
            type="url"
            placeholder="https://..."
            data={values}
            setData={setValues}
            error={errors.link}
          />
        </fieldset>
        {canWrite && (
          <Button loading={saving}>
            {course ? "Save Changes" : "Create Course"}
          </Button>
        )}
      </form>
    </Modal>
  );
};

export default CourseFormModal;
