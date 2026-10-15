import { useState } from "react";

export function useCursorPagination() {
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIdx, setPageIdx] = useState(0);

  function reset() {
    setCursorStack([undefined]);
    setPageIdx(0);
  }

  function goNext(nextCursor: string) {
    setCursorStack((prev) => [...prev.slice(0, pageIdx + 1), nextCursor]);
    setPageIdx((i) => i + 1);
  }

  function goPrev() {
    if (pageIdx === 0) return;
    setPageIdx((i) => i - 1);
  }

  return {
    cursor: cursorStack[pageIdx],
    cursorStack,
    pageIdx,
    goNext,
    goPrev,
    reset,
  };
}
