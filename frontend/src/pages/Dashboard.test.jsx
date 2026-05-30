import { describe, it, expect } from "vitest";

// ── Pure utility functions extracted for unit testing ──────────────────────
// These are the same functions defined in Dashboard.jsx

function parseDateValue(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 12, minute = 0] = value;
    return new Date(year, (month || 1) - 1, day || 1, hour, minute);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a, b) {
  const x = parseDateValue(a);
  const y = parseDateValue(b);
  if (!x || !y) return false;
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

function taskDateValue(task) {
  return task.dueDate || task.scheduledDate || task.date || task.createdAt || null;
}

function taskBelongsToDay(task, day, dayPlans = []) {
  const linkedPlan =
    task.dailyPlanId &&
    dayPlans.some((plan) => String(plan.id) === String(task.dailyPlanId));
  if (linkedPlan) return true;
  const dateValue = taskDateValue(task);
  if (dateValue) return isSameDay(dateValue, day);
  return isSameDay(day, new Date());
}

// ── parseDateValue ─────────────────────────────────────────────────────────

describe("parseDateValue", () => {
  it("returns null for null/undefined", () => {
    expect(parseDateValue(null)).toBeNull();
    expect(parseDateValue(undefined)).toBeNull();
    expect(parseDateValue("")).toBeNull();
  });

  it("parses ISO date string correctly", () => {
    const d = parseDateValue("2026-05-28");
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // May = 4
    expect(d.getDate()).toBe(28);
  });

  it("parses array format [year, month, day]", () => {
    const d = parseDateValue([2026, 5, 28]);
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(28);
  });

  it("parses array format with hour and minute", () => {
    const d = parseDateValue([2026, 5, 28, 9, 30]);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(30);
  });

  it("returns null for invalid string", () => {
    expect(parseDateValue("not-a-date")).toBeNull();
  });

  it("parses full ISO datetime string", () => {
    const d = parseDateValue("2026-05-28T14:00:00");
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
  });
});

// ── isSameDay ──────────────────────────────────────────────────────────────

describe("isSameDay", () => {
  it("returns true for same ISO date strings", () => {
    expect(isSameDay("2026-05-28", "2026-05-28")).toBe(true);
  });

  it("returns false for different dates", () => {
    expect(isSameDay("2026-05-28", "2026-05-29")).toBe(false);
  });

  it("returns false when either value is null", () => {
    expect(isSameDay(null, "2026-05-28")).toBe(false);
    expect(isSameDay("2026-05-28", null)).toBe(false);
  });

  it("matches ISO string with array format for the same date", () => {
    expect(isSameDay("2026-05-28", [2026, 5, 28])).toBe(true);
  });

  it("returns false for different months", () => {
    expect(isSameDay("2026-04-28", "2026-05-28")).toBe(false);
  });
});

// ── taskDateValue ──────────────────────────────────────────────────────────

describe("taskDateValue", () => {
  it("returns dueDate first", () => {
    const task = { dueDate: "2026-05-28", scheduledDate: "2026-05-29", createdAt: "2026-05-27" };
    expect(taskDateValue(task)).toBe("2026-05-28");
  });

  it("falls back to scheduledDate when dueDate absent", () => {
    const task = { scheduledDate: "2026-05-29", createdAt: "2026-05-27" };
    expect(taskDateValue(task)).toBe("2026-05-29");
  });

  it("falls back to createdAt as last resort", () => {
    const task = { createdAt: "2026-05-27" };
    expect(taskDateValue(task)).toBe("2026-05-27");
  });

  it("returns null when no date fields present", () => {
    expect(taskDateValue({ title: "Task" })).toBeNull();
  });
});

// ── taskBelongsToDay ───────────────────────────────────────────────────────

describe("taskBelongsToDay", () => {
  it("returns true when task dueDate matches day", () => {
    const task = { dueDate: "2026-05-28" };
    expect(taskBelongsToDay(task, "2026-05-28")).toBe(true);
  });

  it("returns false when task dueDate does not match day", () => {
    const task = { dueDate: "2026-05-27" };
    expect(taskBelongsToDay(task, "2026-05-28")).toBe(false);
  });

  it("returns true when task is linked to a plan on the given day", () => {
    const task = { dailyPlanId: 42 };
    const plans = [{ id: 42, planDate: "2026-05-28" }];
    expect(taskBelongsToDay(task, "2026-05-28", plans)).toBe(true);
  });

  it("falls back to date comparison when linked plan id does not match any plan", () => {
    // dailyPlanId 99 not in plans, no dateValue on task → falls back to isSameDay(day, today)
    const task = { dailyPlanId: 99 };
    const plans = [{ id: 42, planDate: "2026-05-28" }];
    // Result depends on whether passed day equals today; just assert it returns a boolean
    const result = taskBelongsToDay(task, "2000-01-01", plans);
    expect(result).toBe(false); // "2000-01-01" is never today
  });
});
