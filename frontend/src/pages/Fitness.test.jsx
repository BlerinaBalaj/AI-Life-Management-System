import { describe, it, expect } from "vitest";

// ── readableAiText ─────────────────────────────────────────────────────────
// Replicated from Fitness.jsx for unit testing

function readableAiText(value) {
  if (!value) return "";
  if (typeof value !== "string") return String(value);
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.summary) return parsed.summary;
    if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) {
      return parsed.recommendations.join(" ");
    }
    if (Array.isArray(parsed.tasks) && parsed.tasks.length) {
      return parsed.tasks.join(" ");
    }
  } catch {
    return value;
  }
  return value;
}

// ── getWorkoutDetails helpers ──────────────────────────────────────────────

const WORKOUT_DETAILS_KEYS = [
  "full body strength",
  "hiit cardio burn",
  "yoga flow",
];

function hasWorkoutDetails(title) {
  return WORKOUT_DETAILS_KEYS.includes((title || "").toLowerCase());
}

describe("readableAiText", () => {
  it("returns empty string for falsy input", () => {
    expect(readableAiText(null)).toBe("");
    expect(readableAiText(undefined)).toBe("");
    expect(readableAiText("")).toBe("");
  });

  it("returns plain string unchanged", () => {
    expect(readableAiText("Great session today")).toBe("Great session today");
  });

  it("extracts summary from JSON string", () => {
    const json = JSON.stringify({ summary: "Strong week overall." });
    expect(readableAiText(json)).toBe("Strong week overall.");
  });

  it("extracts recommendations array from JSON string", () => {
    const json = JSON.stringify({ recommendations: ["Hydrate more.", "Sleep 8h."] });
    expect(readableAiText(json)).toBe("Hydrate more. Sleep 8h.");
  });

  it("extracts tasks array from JSON string", () => {
    const json = JSON.stringify({ tasks: ["Morning run.", "Evening stretch."] });
    expect(readableAiText(json)).toBe("Morning run. Evening stretch.");
  });

  it("returns raw string when JSON has no known keys", () => {
    const json = JSON.stringify({ unknown: "data" });
    expect(readableAiText(json)).toBe(json);
  });

  it("returns raw value when JSON is invalid", () => {
    const bad = '{"summary": broken}';
    expect(readableAiText(bad)).toBe(bad);
  });

  it("coerces non-string to string", () => {
    expect(readableAiText(42)).toBe("42");
  });
});

describe("hasWorkoutDetails (known workout titles)", () => {
  it("recognises built-in workout titles", () => {
    expect(hasWorkoutDetails("Full Body Strength")).toBe(true);
    expect(hasWorkoutDetails("HIIT Cardio Burn")).toBe(true);
    expect(hasWorkoutDetails("Yoga Flow")).toBe(true);
  });

  it("returns false for unknown title", () => {
    expect(hasWorkoutDetails("Custom Cycling")).toBe(false);
    expect(hasWorkoutDetails("")).toBe(false);
    expect(hasWorkoutDetails(null)).toBe(false);
  });
});
