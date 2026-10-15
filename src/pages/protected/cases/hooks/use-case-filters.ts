import { useState } from "react";
import type { CasePhase } from "../utils/case-phase";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";

export function useCaseFilters() {
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<CasePhase | undefined>(undefined);
  const { cursor, pageIdx, goNext, goPrev, reset: resetPagination } = useCursorPagination();

  function handleSearch(value: string) {
    setSearch(value);
    resetPagination();
  }

  function handlePhase(value: CasePhase | undefined) {
    setPhase(value);
    resetPagination();
  }

  function clearFilters() {
    setSearch("");
    setPhase(undefined);
    resetPagination();
  }

  return {
    search,
    phase,
    cursor,
    pageIdx,
    handleSearch,
    handlePhase,
    clearFilters,
    goNext,
    goPrev,
    isFiltered: !!search.trim() || !!phase,
  };
}
