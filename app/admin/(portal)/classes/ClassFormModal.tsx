import {
  Button,
  Checkbox,
  CourseSelector,
  ErrorMsg,
  Input,
  Select,
  TextArea,
} from "@/components/Form";
import Modal from "@/components/Modal";
import { CopyableId } from "@/components/common/CopyButton";
import FormError from "@/components/admin/FormError";
import { useToast } from "@/components/admin/Toast";
import { useAdminGlobal } from "@/app/AdminProvider";
import useClassForm, {
  ClassWithRelations,
  SessionFormValues,
} from "@/hooks/admin/useClassForm";
import { Plus, Trash2 } from "lucide-react";

const ClassFormModal = ({
  data,
  onClose,
}: {
  data: ClassWithRelations | null;
  onClose: () => void;
}) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const {
    values,
    setClassFields,
    setCustomClass,
    setSession,
    removeSession,
    addSessionRow,
    handleSubmit,
    loading,
    errors,
    formError,
  } = useClassForm(data, (message) => {
    toast.success(message || (data ? "Class updated." : "Class created."));
    onClose();
  });

  return (
    <Modal
      title={
        data ? (canWrite ? "Edit Class" : "Class Details") : "Add New Class"
      }
      onClose={onClose}
    >
      {data?.classId && (
        <p className="mb-4 text-xs text-zinc-500 flex flex-wrap items-center gap-x-3">
          <span>
            Class ID:{" "}
            <CopyableId
              value={data.classId}
              label="class ID"
              className="font-mono font-semibold text-zinc-700"
            />
          </span>
          {data.course?.code && (
            <span>
              Course:{" "}
              <CopyableId
                value={data.course.code}
                label="course code"
                className="font-mono font-semibold text-zinc-700"
              />
            </span>
          )}
        </p>
      )}
      <form
        onSubmit={canWrite ? handleSubmit : (e) => e.preventDefault()}
        noValidate
        className="space-y-4"
      >
        <FormError message={formError} />
        <fieldset disabled={!canWrite} className="space-y-4">
          <CourseSelector
            value={values.courseId || undefined}
            onChange={(courseId) => setClassFields({ ...values, courseId })}
            error={errors.courseId}
            disabled={!canWrite}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Planned Start Date"
              name="plannedStartDate"
              required
              data={values}
              setData={setClassFields}
              error={errors.plannedStartDate}
            />
            <Select
              label="Schedule"
              name="schedule"
              required
              options={["Weekday", "Weekend"]}
              data={values}
              setData={setClassFields}
              error={errors.schedule}
            />
          </div>

          <Checkbox
            label="Is this a custom class?"
            name="isCustom"
            data={values}
            setData={setClassFields}
          />

          {values.isCustom && (
            <>
              <Input
                type="text"
                label="Title"
                name="title"
                required
                data={values.customClass}
                setData={setCustomClass}
                error={errors["customClass.title"]}
              />
              <TextArea
                label="Description"
                name="description"
                data={values.customClass}
                setData={setCustomClass}
                error={errors["customClass.description"]}
              />
              <Input
                type="number"
                label="Price"
                name="price"
                min={0}
                data={values.customClass}
                setData={setCustomClass}
                error={errors["customClass.price"]}
              />
              <TextArea
                label="Instructions"
                name="instructions"
                data={values.customClass}
                setData={setCustomClass}
                error={errors["customClass.instructions"]}
              />
            </>
          )}

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
                Sessions
              </h3>
              {canWrite && (
                <button
                  type="button"
                  onClick={addSessionRow}
                  className="text-[10px] font-bold text-black flex items-center gap-1 hover:underline"
                >
                  <Plus size={12} aria-hidden="true" /> Add Session
                </button>
              )}
            </div>
            <ErrorMsg message={errors.sessions} />

            {values.sessions.map((session, index) => {
              const update = (next: SessionFormValues) =>
                setSession(index, next);
              const err = (field: string) =>
                errors[`sessions.${index}.${field}`];
              return (
                <div
                  key={session.id ?? `new-${index}`}
                  className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4"
                  role="group"
                  aria-label={`Day ${index + 1}`}
                >
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
                      Day {index + 1}
                    </h4>
                    {canWrite && values.sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSession(index)}
                        aria-label={`Remove day ${index + 1}`}
                      >
                        <Trash2
                          size={14}
                          className="stroke-red-500"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="date"
                      data={session}
                      name="date"
                      label="Session Date"
                      setData={update}
                      error={err("date")}
                    />
                    <Input
                      type="time"
                      data={session}
                      name="startTime"
                      label="Session Starts"
                      setData={update}
                      error={err("startTime")}
                    />
                    <Input
                      type="time"
                      data={session}
                      name="endTime"
                      label="Session Ends"
                      setData={update}
                      error={err("endTime")}
                    />
                  </div>
                  <Input
                    type="text"
                    data={session}
                    name="venueDetails"
                    label="Venue"
                    setData={update}
                    error={err("venueDetails")}
                  />
                  <TextArea
                    data={session}
                    name="zoomLink"
                    label="Zoom Link"
                    setData={update}
                    error={err("zoomLink")}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        {canWrite && (
          <Button loading={loading}>
            {data ? "Save Changes" : "Create Class"}
          </Button>
        )}
      </form>
    </Modal>
  );
};

export default ClassFormModal;
