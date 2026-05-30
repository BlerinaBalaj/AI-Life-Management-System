import { describe, it, expect } from "vitest";

// ── Page title mapping replicated from Header.jsx ─────────────────────────

const titles = {
  "/":              ["Home",            "What LifeOS helps you improve"],
  "/home":          ["Home",            "What LifeOS helps you improve"],
  "/dashboard":     ["Dashboard",       "Your day at a glance"],
  "/planner":       ["Daily Planner",   "Plan and organize your tasks"],
  "/daily-planner": ["Daily Planner",   "Plan and organize your tasks"],
  "/fitness":       ["Fitness Tracker", "Workouts and sessions"],
  "/nutrition":     ["Nutrition Tracker","Meals and macronutrients"],
  "/mood":          ["Mood & Stress",   "Wellbeing journal"],
  "/reports":       ["AI Reports",      "Insights and weekly review"],
};

function getPageTitle(pathname) {
  return titles[pathname] || ["LifeOS", ""];
}

describe("getPageTitle", () => {
  it("returns Home for / and /home", () => {
    expect(getPageTitle("/")[0]).toBe("Home");
    expect(getPageTitle("/home")[0]).toBe("Home");
  });

  it("returns Dashboard for /dashboard", () => {
    expect(getPageTitle("/dashboard")[0]).toBe("Dashboard");
  });

  it("returns Daily Planner for both planner routes", () => {
    expect(getPageTitle("/planner")[0]).toBe("Daily Planner");
    expect(getPageTitle("/daily-planner")[0]).toBe("Daily Planner");
  });

  it("returns Fitness Tracker for /fitness", () => {
    expect(getPageTitle("/fitness")[0]).toBe("Fitness Tracker");
  });

  it("returns Nutrition Tracker for /nutrition", () => {
    expect(getPageTitle("/nutrition")[0]).toBe("Nutrition Tracker");
  });

  it("returns Mood & Stress for /mood", () => {
    expect(getPageTitle("/mood")[0]).toBe("Mood & Stress");
  });

  it("returns AI Reports for /reports", () => {
    expect(getPageTitle("/reports")[0]).toBe("AI Reports");
  });

  it("returns LifeOS fallback for unknown route", () => {
    const [title, subtitle] = getPageTitle("/unknown-page");
    expect(title).toBe("LifeOS");
    expect(subtitle).toBe("");
  });

  it("returns subtitle for every known route", () => {
    Object.keys(titles).forEach((path) => {
      const [, subtitle] = getPageTitle(path);
      expect(typeof subtitle).toBe("string");
      expect(subtitle.length).toBeGreaterThan(0);
    });
  });
});
