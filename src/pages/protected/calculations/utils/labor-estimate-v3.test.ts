import { describe, expect, it } from "vitest";
import { estimateLaborV3, type EstimateV3Input } from "./labor-estimate-v3";

const base: EstimateV3Input = {
  startDate: "2023-01-01",
  endDate: "2025-06-30",
  lastSalary: 3000,
  baseSalary: 3000,
  unpaid13ths: 0,
  vacationCount: 0,
  vacationVencidasCount: 0,
  priorNoticeWorked: false,
  extraHours: 0,
  nightHours: 0,
  insalubrityLevel: 0,
  dangerousWork: false,
  lastThreeSalariesAvg: 3000,
  terminationType: "sem_justa_causa",
  applyArt477Fine: false,
};

describe("estimateLaborV3", () => {
  it("returns 0 for invalid dates", () => {
    expect(estimateLaborV3({ ...base, startDate: "", endDate: "" })).toBe(0);
  });

  it("returns a positive estimate for a valid dismissal", () => {
    expect(estimateLaborV3(base)).toBeGreaterThan(0);
  });

  it("adds the transfer additional (25% × months)", () => {
    const withTransfer = estimateLaborV3({
      ...base,
      transferAdditionalMonths: 4,
    });
    expect(withTransfer).toBeGreaterThan(estimateLaborV3(base));
  });

  it("subtracts deductions from the total", () => {
    const withoutDed = estimateLaborV3(base);
    const withDed = estimateLaborV3({ ...base, deductions: 500 });
    expect(withDed).toBeCloseTo(withoutDed - 500, 1);
  });

  it("com justa causa yields less than sem justa causa", () => {
    const sem = estimateLaborV3(base);
    const com = estimateLaborV3({ ...base, terminationType: "com_justa_causa" });
    expect(com).toBeLessThan(sem);
  });
});
