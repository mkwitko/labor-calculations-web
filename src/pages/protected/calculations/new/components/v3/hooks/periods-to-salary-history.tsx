export function periodsToSalaryHistory(
  periods: { startDate: string; endDate: string; salary: string }[],
): { month: string; baseSalary: number; lastSalary: number }[] {
  const entries: { month: string; baseSalary: number; lastSalary: number }[] =
    [];
  for (const p of periods) {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    const salary = Number(p.salary.replace(",", ".")) || 0;
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= endMonth) {
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      entries.push({ month: monthStr, baseSalary: salary, lastSalary: salary });
      current.setMonth(current.getMonth() + 1);
    }
  }
  return entries;
}
