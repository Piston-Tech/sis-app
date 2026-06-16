import {
  Button,
  Checkbox,
  CourseSelector,
  Input,
  Select,
  TextArea,
} from "@/components/Form";
import Modal from "@/components/Modal";
import useClassForm from "@/hooks/useClassForm";
import { Class, Session } from "@/types";
import { Plus, Trash2 } from "lucide-react";

const ClassFormModal = ({
  data,
  onClose,
}: {
  data: Class | null;
  onClose: () => void;
}) => {
  const {
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
  } = useClassForm(data, onClose);

  return (
    <Modal title={data ? "Edit Class" : "Add New Class"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CourseSelector
          value={formData.courseId}
          onChange={(id) => setFormData({ ...formData, courseId: id })}
          error={errors.courseId}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Planned Start Date"
            name="plannedStartDate"
            data={formData}
            setData={setFormData}
          />
          <Select
            label={"Schedule"}
            name={"schedule"}
            options={["Weekday", "Weekend"]}
            data={formData}
            setData={setFormData}
            error={undefined}
          />
        </div>

        <Checkbox
          label="Is this a custom class?"
          name={"isCustom"}
          data={formData}
          setData={setFormData}
        />

        {formData.isCustom && (
          <>
            <Input
              type="text"
              label="Title"
              name="title"
              data={customClassFormData}
              setData={setCustomClassFormData}
            />
            <TextArea
              label="Description"
              name="description"
              data={customClassFormData}
              setData={setCustomClassFormData}
            />
            <Input
              type="number"
              label="Price"
              name="price"
              data={customClassFormData}
              setData={setCustomClassFormData}
            />
            <TextArea
              label="Instructions"
              name="instructions"
              data={customClassFormData}
              setData={setCustomClassFormData}
            />
          </>
        )}

        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
              Sessions
            </h3>
            <button
              type="button"
              onClick={addSessionRow}
              className="text-[10px] font-bold text-black flex items-center gap-1 hover:underline"
            >
              <Plus size={12} /> Add Session
            </button>
          </div>

          {sessions.map((session, index) => {
            const setSession = (session: Session) => {
              const newSession = [...sessions];
              newSession[index] = session;
              setSessions(newSession);
            };

            const deleteSession = (index: number) => {
              setSessions(sessions.filter((_, i) => i !== index));
            };

            return (
              <div
                key={index}
                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4"
              >
                <div className="flex justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
                    Day {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => deleteSession(index)}
                    className=""
                  >
                    <Trash2 size={14} className="stroke-red-500" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="date"
                    data={session}
                    name={"date"}
                    label={"Session Date"}
                    setData={setSession}
                  />
                  <Input
                    type="time"
                    data={session}
                    name={"startTime"}
                    label={"Session Starts"}
                    setData={setSession}
                  />
                  <Input
                    type="time"
                    data={session}
                    name={"endTime"}
                    label={"Session Ends"}
                    setData={setSession}
                  />
                </div>
                <Input
                  type="text"
                  data={session}
                  name={"venueDetails"}
                  label={"Venue"}
                  setData={setSession}
                />
                <TextArea
                  data={session}
                  name={"zoomLink"}
                  label={"Zoom Link"}
                  setData={setSession}
                />
              </div>
            );
          })}
        </div>

        <Button loading={loading}>
          {data ? "Edit Class" : "Create Class"}
        </Button>
      </form>
    </Modal>
  );
};

export default ClassFormModal;
