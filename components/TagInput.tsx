"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (values: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  /** id for the text input, so a <label htmlFor> can point at it */
  id?: string;
  "aria-describedby"?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = "Type to search and select...",
  className = "",
  id = "tag-input",
  "aria-describedby": describedBy,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = `${id}-suggestions`;

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];
    return suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(query) &&
        !value.some((selected) => selected.toLowerCase() === suggestion.toLowerCase()),
    );
  }, [inputValue, suggestions, value]);

  const showSuggestions = open && filteredSuggestions.length > 0;

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleAddTag(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemoveTag(value.length - 1);
    } else if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp" && filteredSuggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex min-h-[48px] w-full flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-colors focus-within:border-blue-500">
        {value.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              aria-label={`Remove ${tag}`}
              className="text-blue-700 transition-colors hover:text-blue-900"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={listId}
          aria-activedescendant={
            showSuggestions && highlightedIndex >= 0 ? `${listId}-${highlightedIndex}` : undefined
          }
          aria-describedby={describedBy}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-500"
        />
      </div>

      <ul
        id={listId}
        role="listbox"
        hidden={!showSuggestions}
        className="absolute left-0 right-0 top-full z-10 mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-lg"
      >
        {filteredSuggestions.map((suggestion, index) => (
          <li
            key={suggestion}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === highlightedIndex}
            onMouseDown={(e) => {
              // Keep focus in the input.
              e.preventDefault();
              handleAddTag(suggestion);
            }}
            className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-colors ${
              index === highlightedIndex
                ? "bg-blue-600 text-white"
                : "text-slate-900 hover:bg-slate-100"
            }`}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagInput;
