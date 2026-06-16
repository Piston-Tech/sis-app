import { Input, Select, StudentSelector } from "@/components/Form";
import ClassSelector from "@/components/Form/ClassSelector";
import { SelectedClassSearch } from "@/types";
import { CreateEnrollmentData } from "@/types/Enrollment";
import formatMoney from "@/utils/formatMoney";
import { Trash2 } from "lucide-react";
import { format } from "path";
import { useEffect, useState } from "react";

const SingleEnrollment = ({
  corporate,
  enrollment,
  setEnrollment,
  subTotal,
  setSubTotal,
  remove,
  errors,
}: {
  corporate: boolean;
  enrollment: CreateEnrollmentData;
  setEnrollment: (enrollment: CreateEnrollmentData) => void;
  subTotal: number | undefined;
  setSubTotal: (value: number) => void;
  remove: () => void;
  errors?: Record<keyof CreateEnrollmentData, string>;
}) => {
  const [selectedClass, setSelectedClass] = useState<SelectedClassSearch>();

  useEffect(() => {
    if (selectedClass && enrollment.tierId) {
      const plan = selectedClass.course.prices.find(
        (p) => p.tierId === enrollment.tierId,
      );
      setSubTotal(plan ? parseFloat(plan.price) : 0);
    }
  }, [selectedClass, enrollment.tierId]);

  return (
    <div className="flex flex-col p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
      <button
        type="button"
        className="relative -mb-4 self-end z-10 text-neutral-400 hover:text-red-500 transition-colors duration-100 cursor-pointer"
        onClick={remove}
      >
        <Trash2 size={16} />
      </button>
      <div className="grid grid-cols-1 gap-4">
        {corporate && (
          <StudentSelector
            value={enrollment.studentId}
            onChange={(id) => setEnrollment({ ...enrollment, studentId: id })}
            error={errors ? errors.studentId : undefined}
          />
        )}
        <div className="col-span-2">
          <ClassSelector
            value={enrollment.classId}
            onChange={(data) => {
              setEnrollment({ ...enrollment, classId: data.id });
              setSelectedClass(data);
            }}
            error={errors ? errors.classId : undefined}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Select
          label="Plan"
          required
          name="tierId"
          data={enrollment}
          error={errors ? errors.tierId : undefined}
          options={
            selectedClass?.course.prices.map((p) => ({
              value: p.tierId,
              title: p.tier.name,
            })) ?? []
          }
          setData={(data) =>
            setEnrollment({ ...enrollment, tierId: parseInt(data.tierId) })
          }
        />
        <Select
          label="CBA"
          required
          name="cba"
          data={enrollment}
          error={errors ? errors.cba : undefined}
          options={["PA", "PC", "PA-D", "PA-G"]}
          setData={setEnrollment}
        />
        {/* <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            CBA
          </label>
          <select
            className="w-full px-3 py-1.5 bg-white border border-zinc-100 rounded-lg text-xs"
            value={enrollment.cba}
            onChange={(e) =>
              setEnrollment({ ...enrollment, cba: e.target.value })
            }
          >
            <option value="">Select CBA...</option>
            <option value="PA">PA</option>
            <option value="PC">PC</option>
            <option value="PA-D">PA-D</option>
            <option value="PA-G">PA-G</option>
          </select>
        </div> */}
        <Select
          label="Delivery"
          required
          name="delivery"
          data={enrollment}
          error={errors ? errors.delivery : undefined}
          options={["Hybrid", "Classroom", "Virtual"]}
          setData={setEnrollment}
        />
        {/* <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Delivery
          </label>
          <select
            className="w-full px-3 py-1.5 bg-white border border-zinc-100 rounded-lg text-xs"
            value={enrollment.delivery}
            onChange={(e) =>
              setEnrollment({ ...enrollment, delivery: e.target.value })
            }
          >
            <option value="Hybrid">Hybrid</option>
            <option value="Classroom">Classroom</option>
            <option value="Virtual">Virtual</option>
          </select>
        </div> */}
      </div>
      <div>
        <Input
          disabled
          value={subTotal ? formatMoney(subTotal, true, "Nigerian Naira") : ""}
          label={"Subtotal"}
          placeholder={formatMoney(0, true, "Nigerian Naira")}
        />
      </div>
    </div>
  );
};

export default SingleEnrollment;
