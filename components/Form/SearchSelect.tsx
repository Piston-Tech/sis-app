"use client";

import { AdminResource } from "@/hooks/admin/api";
import {
  useSearchSelect,
  useSearchSelected,
} from "@/hooks/admin/useSearchSelect";
import cn from "@/utils/cn";
import { KeyboardEvent, ReactNode, useId, useState } from "react";
import ErrorMsg from "./ErrorMsg";
import { fieldClass, labelClass } from "./fieldProps";

export interface SearchSelectProps<T extends { id: number }> {
  resource: AdminResource;
  label: string;
  placeholder?: string;
  /** Currently selected record id (0 / undefined = none). */
  value: number | undefined;
  onSelect: (option: T) => void;
  renderOption: (option: T) => ReactNode;
  error?: string | null;
  disabled?: boolean;
}

/**
 * Accessible typeahead (ARIA combobox + listbox) backed by
 * GET /admin/<resource>/search?q=. Arrow keys move, Enter selects,
 * Escape closes the list.
 */
export default function SearchSelect<T extends { id: number }>({
  resource,
  label,
  placeholder = "Type at least 2 characters to search",
  value,
  onSelect,
  renderOption,
  error,
  disabled,
}: SearchSelectProps<T>) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const errorId = `${baseId}-error`;
  const statusId = `${baseId}-status`;

  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [picked, setPicked] = useState<T>();

  const {
    options,
    isSearching,
    error: searchError,
    active,
  } = useSearchSelect<T>(resource, term, { enabled: !disabled });

  // Resolve a pre-selected id we did not pick locally (e.g. editing a record).
  const needsLookup = !!value && picked?.id !== value;
  const { selected: fetched } = useSearchSelected<T>(
    resource,
    needsLookup ? value : undefined,
  );
  const selected = !value ? undefined : needsLookup ? fetched : picked;

  const showList = open && options.length > 0;

  const choose = (option: T) => {
    setPicked(option);
    onSelect(option);
    setTerm("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      if (options.length)
        setActiveIndex((i) => (i + 1 >= options.length ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (options.length)
        setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (showList && activeIndex >= 0 && options[activeIndex]) {
        e.preventDefault();
        choose(options[activeIndex]);
      } else if (showList) {
        // Never submit the surrounding form from the search box.
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      if (open || term) {
        // Handled here: keep the surrounding dialog open.
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  const statusText = searchError
    ? searchError.message
    : isSearching
      ? "Searching..."
      : open && active && options.length === 0
        ? "No matches found."
        : "";

  return (
    <div className="relative w-full space-y-1">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>

      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-activedescendant={
          showList && activeIndex >= 0
            ? `${listboxId}-opt-${activeIndex}`
            : undefined
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={[statusId, error ? errorId : ""]
          .filter(Boolean)
          .join(" ")}
        autoComplete="off"
        disabled={disabled}
        className={fieldClass}
        placeholder={placeholder}
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />

      <p
        id={statusId}
        aria-live="polite"
        className={cn(
          "text-xs px-1",
          searchError ? "text-rose-500" : "text-zinc-400",
          !statusText && "sr-only",
        )}
      >
        {statusText}
      </p>

      <ul
        id={listboxId}
        role="listbox"
        aria-label={`${label} results`}
        hidden={!showList}
        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5"
      >
        {options.map((option, index) => (
          <li
            key={option.id}
            id={`${listboxId}-opt-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            className={cn(
              "relative cursor-pointer select-none py-2 pl-3 pr-9",
              index === activeIndex
                ? "bg-indigo-600 text-white"
                : "hover:bg-indigo-50",
            )}
            // Keep focus in the input so blur does not close the list first.
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => choose(option)}
          >
            {renderOption(option)}
          </li>
        ))}
      </ul>

      {selected && (
        <div
          className="flex justify-between border border-neutral-300 rounded-lg mt-2 select-none py-2 px-3 text-sm"
          aria-label={`Selected ${label.toLowerCase()}`}
        >
          <p>{renderOption(selected)}</p>
        </div>
      )}

      <ErrorMsg id={errorId} message={error} />
    </div>
  );
}
