import { describe, expect, it } from "vitest";
import { isAdminRole } from "./AuthContext.jsx";

describe("isAdminRole", () => {
  it("accepts admin and super-admin roles with or without Spring role prefix", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("ROLE_ADMIN")).toBe(true);
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
    expect(isAdminRole("ROLE_SUPER_ADMIN")).toBe(true);
  });

  it("rejects regular users and missing roles", () => {
    expect(isAdminRole("USER")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});
