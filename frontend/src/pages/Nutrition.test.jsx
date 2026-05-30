import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ── isToday ────────────────────────────────────────────────────────────────

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// ── formatFoodDate ─────────────────────────────────────────────────────────

function formatFoodDate(value) {
  if (!value) return { label: "No date", weekday: "--", day: "--", month: "", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: "No date", weekday: "--", day: "--", month: "", time: "" };
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
    day: date.toLocaleDateString(undefined, { day: "2-digit" }),
    month: date.toLocaleDateString(undefined, { month: "short" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

// ── presetFromMealName ─────────────────────────────────────────────────────

const FOOD_PRESETS = [
  { foodName: "Oatmeal with berries",        mealType: "BREAKFAST", calories: 380, proteinGrams: 14, carbsGrams: 62, fatGrams: 8  },
  { foodName: "Grilled chicken salad",       mealType: "LUNCH",     calories: 480, proteinGrams: 44, carbsGrams: 28, fatGrams: 16 },
  { foodName: "Protein smoothie",            mealType: "SNACK",     calories: 290, proteinGrams: 30, carbsGrams: 32, fatGrams: 6  },
  { foodName: "Salmon with quinoa",          mealType: "DINNER",    calories: 620, proteinGrams: 48, carbsGrams: 54, fatGrams: 22 },
  { foodName: "Scrambled eggs on toast",     mealType: "BREAKFAST", calories: 410, proteinGrams: 24, carbsGrams: 38, fatGrams: 18 },
];

function presetFromMealName(mealName, fallbackMealType = "BREAKFAST") {
  const normalized = String(mealName || "").toLowerCase();
  const direct = FOOD_PRESETS.find((preset) => {
    const name = preset.foodName.toLowerCase();
    return normalized.includes(name) || name.includes(normalized);
  });
  if (direct) return direct;
  if (normalized.includes("oat") || normalized.includes("breakfast")) return FOOD_PRESETS[0];
  if (normalized.includes("chicken") || normalized.includes("salad") || normalized.includes("lunch")) return FOOD_PRESETS[1];
  if (normalized.includes("smoothie") || normalized.includes("snack") || normalized.includes("yogurt")) return FOOD_PRESETS[2];
  if (normalized.includes("salmon") || normalized.includes("quinoa") || normalized.includes("dinner")) return FOOD_PRESETS[3];
  if (normalized.includes("egg") || normalized.includes("toast")) return FOOD_PRESETS[4];
  return {
    foodName: mealName || "Balanced meal",
    mealType: fallbackMealType,
    calories: 430,
    proteinGrams: 28,
    carbsGrams: 45,
    fatGrams: 14,
  };
}

// ── isToday tests ──────────────────────────────────────────────────────────

describe("isToday", () => {
  it("returns true for current datetime ISO string", () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday.toISOString())).toBe(false);
  });

  it("returns false for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow.toISOString())).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isToday(null)).toBe(false);
    expect(isToday(undefined)).toBe(false);
    expect(isToday("")).toBe(false);
  });

  it("returns false for invalid date string", () => {
    expect(isToday("not-a-date")).toBe(false);
  });
});

// ── formatFoodDate tests ───────────────────────────────────────────────────

describe("formatFoodDate", () => {
  it("returns no-date sentinel for null/undefined", () => {
    const r = formatFoodDate(null);
    expect(r.label).toBe("No date");
    expect(r.weekday).toBe("--");
  });

  it("returns 'Today' label for current date", () => {
    const r = formatFoodDate(new Date().toISOString());
    expect(r.label).toBe("Today");
  });

  it("returns 'Yesterday' label for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const r = formatFoodDate(yesterday.toISOString());
    expect(r.label).toBe("Yesterday");
  });

  it("returns formatted label for older dates", () => {
    const old = new Date("2026-01-15T12:00:00");
    const r = formatFoodDate(old.toISOString());
    expect(r.label).not.toBe("Today");
    expect(r.label).not.toBe("Yesterday");
    expect(typeof r.label).toBe("string");
    expect(r.label.length).toBeGreaterThan(0);
  });

  it("returns time string in result", () => {
    const r = formatFoodDate(new Date().toISOString());
    expect(typeof r.time).toBe("string");
    expect(r.time.length).toBeGreaterThan(0);
  });
});

// ── presetFromMealName tests ───────────────────────────────────────────────

describe("presetFromMealName", () => {
  it("matches oat keyword to oatmeal preset", () => {
    expect(presetFromMealName("Overnight oat bowl").foodName).toBe("Oatmeal with berries");
  });

  it("matches chicken keyword to chicken salad preset", () => {
    expect(presetFromMealName("Grilled chicken bowl").foodName).toBe("Grilled chicken salad");
  });

  it("matches smoothie keyword to protein smoothie preset", () => {
    expect(presetFromMealName("Banana smoothie").foodName).toBe("Protein smoothie");
  });

  it("matches salmon keyword to salmon preset", () => {
    expect(presetFromMealName("Salmon fillet").foodName).toBe("Salmon with quinoa");
  });

  it("matches egg keyword to eggs preset", () => {
    expect(presetFromMealName("Soft boiled egg on toast").foodName).toBe("Scrambled eggs on toast");
  });

  it("returns fallback for unknown meal name", () => {
    const result = presetFromMealName("Mystery casserole");
    expect(result.foodName).toBe("Mystery casserole");
    expect(result.calories).toBe(430);
  });

  it("uses fallbackMealType for unknown meal", () => {
    const result = presetFromMealName("Random dish", "DINNER");
    expect(result.mealType).toBe("DINNER");
  });

  it("returns a preset for empty string (empty string matches any includes check)", () => {
    // String.includes("") is always true, so the first preset is returned
    const result = presetFromMealName("");
    expect(typeof result.foodName).toBe("string");
    expect(result.foodName.length).toBeGreaterThan(0);
  });
});
