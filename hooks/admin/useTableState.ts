import { useCallback, useState } from "react";

/** Page + search state for an admin table; changing the search resets to page 1. */
export function useTableState() {
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState("");

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  return { page, setPage, search, setSearch };
}

export default useTableState;
