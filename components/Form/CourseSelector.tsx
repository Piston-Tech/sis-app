import useCourseSelector from "@/hooks/useCourseSelector";
import { Trash, Trash2 } from "lucide-react";
import ErrorMsg from "./ErrorMsg";

export default function CourseSelector({
  value,
  onChange,
  error,
}: {
  value: number | undefined;
  onChange: (id: number) => void;
  error: string | undefined;
}) {
  const {
    searchTerm,
    setSearchTerm,
    options,
    onSelected,
    isSearching,
    selectedCourse,
  } = useCourseSelector(value);

  return (
    <div className="relative w-full max-w-md">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        Select Course
      </label>

      <input
        type="text"
        className="w-full px-4 py-2 bg-white border border-zinc-100 rounded-xl text-sm"
        placeholder="Search by code or title (e.g. CS101)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isSearching && (
        <div className="absolute right-3 top-9 text-xs text-gray-400">
          Searching...
        </div>
      )}

      {selectedCourse && (
        <div
          className="flex justify-between border border-neutral-300 rounded-lg mt-2 select-none py-2 px-3"
          //   onClick={() => {
          //     onChange(value.id);
          //     onSelected(course);
          //   }}
        >
          <p>
            <span className="font-semibold">{selectedCourse.code}</span> -{" "}
            {selectedCourse.title}
          </p>
          {/* <button type="button" onClick={() => onChange()} className="cursor-pointer">
            <Trash2 size={16} className="stroke-red-500" />
          </button> */}
        </div>
      )}

      <ErrorMsg message={error} />

      {options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-height-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((course) => (
            <li
              key={course.id}
              className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
              onClick={() => {
                onChange(course.id);
                onSelected(course);
              }}
            >
              <span className="font-semibold">{course.code}</span> -{" "}
              {course.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
