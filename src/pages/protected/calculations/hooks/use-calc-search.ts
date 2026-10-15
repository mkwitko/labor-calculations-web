import type { ListLaborCalculation200DataItem } from "@/http/generated/lexlaboral-server.schemas";
import Fuse from "fuse.js";
import { useMemo } from "react";

const FUSE_OPTIONS = {
  keys: ["clientName", "terminationType"],
  threshold: 0.4,
};

export function useCalcSearch(items: ListLaborCalculation200DataItem[], query: string) {
  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);
  return useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, items, query]);
}
