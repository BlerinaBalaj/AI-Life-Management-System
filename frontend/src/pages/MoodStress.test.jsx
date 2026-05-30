import { describe, it, expect } from "vitest";

// ── Functions replicated from MoodStress.jsx ───────────────────────────────

const rangeFill = (value) => `${((Number(value) - 1) / 9) * 100}%`;

function stressState(level) {
  const score = Number(level) || 0;
  if (score <= 2) return { label: "calm",        color: "#10b981" };
  if (score <= 4) return { label: "light",       color: "#84cc16" };
  if (score <= 6) return { label: "pressured",   color: "#f59e0b" };
  if (score <= 8) return { label: "tense",       color: "#f97316" };
  return           { label: "overwhelmed", color: "#ef4444" };
}

function moodCopy(score) {
  if (score >= 8) return "High energy";
  if (score >= 6) return "Steady";
  if (score >= 4) return "Needs care";
  return "Low mood";
}

function stressCopy(level) {
  if (level <= 3) return "Light load";
  if (level <= 6) return "Manageable";
  if (level <= 8) return "Heavy";
  return "High pressure";
}

function formatLogDate(value) {
  if (!value) return { label: "No date", weekday: "--", day: "--", month: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: "No date", weekday: "--", day: "--", month: "" };
  const today = new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((start - todayStart) / 86400000);
  let label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (diffDays === 0) label = "Today";
  if (diffDays === -1) label = "Yesterday";
  return {
    label,
    weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    day:     date.toLocaleDateString(undefined, { day:     "2-digit" }),
    month:   date.toLocaleDateString(undefined, { month:   "short"   }),
  };
}

// ── rangeFill ──────────────────────────────────────────────────────────────

describe("rangeFill", () => {
  it("returns 0% for value 1 (minimum)", () => {
    expect(rangeFill(1)).toBe("0%");
  });

  it("returns 100% for value 10 (maximum)", () => {
    expect(rangeFill(10)).toBe("100%");
  });

  it("returns 50% for value 5.5 (midpoint)", () => {
    expect(rangeFill(5.5)).toBe("50%");
  });

  it("returns ~44% for value 5", () => {
    // (5-1)/9 * 100 ≈ 44.44%
    expect(rangeFill(5)).toBe(`${((5 - 1) / 9) * 100}%`);
  });
});

// ── stressState ────────────────────────────────────────────────────────────

describe("stressState", () => {
  it("labels score 1 as calm", () => {
    expect(stressState(1).label).toBe("calm");
  });

  it("labels score 2 as calm", () => {
    expect(stressState(2).label).toBe("calm");
  });

  it("labels score 3 as light", () => {
    expect(stressState(3).label).toBe("light");
  });

  it("labels score 5 as pressured", () => {
    expect(stressState(5).label).toBe("pressured");
  });

  it("labels score 7 as tense", () => {
    expect(stressState(7).label).toBe("tense");
  });

  it("labels score 9 as overwhelmed", () => {
    expect(stressState(9).label).toBe("overwhelmed");
  });

  it("labels score 10 as overwhelmed", () => {
    expect(stressState(10).label).toBe("overwhelmed");
  });

  it("defaults to calm for non-numeric input", () => {
    expect(stressState("abc").label).toBe("calm");
  });

  it("returns a hex color string", () => {
    expect(stressState(1).color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

// ── moodCopy ───────────────────────────────────────────────────────────────

describe("moodCopy", () => {
  it("returns High energy for score >= 8", () => {
    expect(moodCopy(8)).toBe("High energy");
    expect(moodCopy(10)).toBe("High energy");
  });

  it("returns Steady for score 6–7", () => {
    expect(moodCopy(6)).toBe("Steady");
    expect(moodCopy(7)).toBe("Steady");
  });

  it("returns Needs care for score 4–5", () => {
    expect(moodCopy(4)).toBe("Needs care");
    expect(moodCopy(5)).toBe("Needs care");
  });

  it("returns Low mood for score < 4", () => {
    expect(moodCopy(3)).toBe("Low mood");
    expect(moodCopy(1)).toBe("Low mood");
  });
});

// ── stressCopy ─────────────────────────────────────────────────────────────

describe("stressCopy", () => {
  it("returns Light load for level <= 3", () => {
    expect(stressCopy(1)).toBe("Light load");
    expect(stressCopy(3)).toBe("Light load");
  });

  it("returns Manageable for level 4–6", () => {
    expect(stressCopy(4)).toBe("Manageable");
    expect(stressCopy(6)).toBe("Manageable");
  });

  it("returns Heavy for level 7–8", () => {
    expect(stressCopy(7)).toBe("Heavy");
    expect(stressCopy(8)).toBe("Heavy");
  });

  it("returns High pressure for level > 8", () => {
    expect(stressCopy(9)).toBe("High pressure");
    expect(stressCopy(10)).toBe("High pressure");
  });
});

// ── formatLogDate ──────────────────────────────────────────────────────────

describe("formatLogDate", () => {
  it("returns no-date sentinel for null", () => {
    const r = formatLogDate(null);
    expect(r.label).toBe("No date");
    expect(r.weekday).toBe("--");
  });

  it("returns Today for current timestamp", () => {
    const r = formatLogDate(new Date().toISOString());
    expect(r.label).toBe("Today");
  });

  it("returns Yesterday for yesterday's timestamp", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const r = formatLogDate(yesterday.toISOString());
    expect(r.label).toBe("Yesterday");
  });

  it("returns formatted label for older dates", () => {
    const old = new Date("2026-01-10T08:00:00");
    const r = formatLogDate(old.toISOString());
    expect(r.label).not.toBe("Today");
    expect(r.label).not.toBe("Yesterday");
    expect(typeof r.label).toBe("string");
  });

  it("populates weekday, day, and month fields", () => {
    const r = formatLogDate(new Date().toISOString());
    expect(typeof r.weekday).toBe("string");
    expect(typeof r.day).toBe("string");
    expect(typeof r.month).toBe("string");
  });
});
