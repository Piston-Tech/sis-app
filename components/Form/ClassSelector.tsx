import useClassSelector from "@/hooks/useClassSelector";
import ErrorMsg from "./ErrorMsg";
import { SelectedClassSearch } from "@/types";

export default function ClassSelector({
  value,
  onChange,
  error,
}: {
  value: number | undefined;
  onChange: (data: SelectedClassSearch) => void;
  error: string | undefined;
}) {
  const {
    searchTerm,
    setSearchTerm,
    options,
    onSelected,
    isSearching,
    selectedClass,
  } = useClassSelector(value);

  return (
    <div className="relative w-full max-w-md">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        Select Class
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

      {selectedClass && (
        <div
          className="flex justify-between border border-neutral-300 rounded-lg mt-2 select-none py-2 px-3"
          //   onClick={() => {
          //     onChange(value.id);
          //     onSelected(class);
          //   }}
        >
          <p>
            <span className="font-semibold">
              {new Date(selectedClass.plannedStartDate).toDateString()}
            </span>{" "}
            - {selectedClass.course.title} ({selectedClass.course.code})
          </p>
          {/* <button type="button" onClick={() => onChange()} className="cursor-pointer">
            <Trash2 size={16} className="stroke-red-500" />
          </button> */}
        </div>
      )}

      <ErrorMsg message={error} />

      {options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-height-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((data: SelectedClassSearch) => (
            <li
              key={data.id}
              className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
              onClick={() => {
                onChange(data);
                onSelected(data);
              }}
            >
              <span className="font-semibold">
                {new Date(data.plannedStartDate).toDateString()}
              </span>{" "}
              - {data.course.title} ({data.course.code})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
