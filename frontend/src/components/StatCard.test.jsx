import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Activity } from "lucide-react";
import StatCard from "./StatCard.jsx";

describe("StatCard", () => {
  it("renders label and value", () => {
    const { getByText } = render(
      <StatCard icon={Activity} label="Steps Today" value="8,200" />
    );
    expect(getByText("Steps Today")).toBeTruthy();
    expect(getByText("8,200")).toBeTruthy();
  });

  it("renders hint when provided", () => {
    const { getByText } = render(
      <StatCard icon={Activity} label="Mood" value="7/10" hint="+2 from last week" />
    );
    expect(getByText("+2 from last week")).toBeTruthy();
  });

  it("does not render hint element when hint is absent", () => {
    const { container } = render(
      <StatCard icon={Activity} label="Mood" value="7" />
    );
    expect(container.querySelector(".stat-hint")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatCard icon={Activity} label="X" value="0" className="my-custom" />
    );
    expect(container.firstChild.classList.contains("my-custom")).toBe(true);
  });

  it("applies default accent class when none given", () => {
    const { container } = render(
      <StatCard icon={Activity} label="X" value="0" />
    );
    expect(container.firstChild.classList.contains("stat-blue")).toBe(true);
  });

  it("applies provided accent class", () => {
    const { container } = render(
      <StatCard icon={Activity} label="X" value="0" accent="green" />
    );
    expect(container.firstChild.classList.contains("stat-green")).toBe(true);
  });
});
