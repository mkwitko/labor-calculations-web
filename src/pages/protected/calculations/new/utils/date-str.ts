export function toDateStr(value: string | Date | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}
