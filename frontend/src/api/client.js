import axios from "axios";
import { mockData } from "./mockData.js";

export const API_BASE_URL = "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const token = localStorage.getItem("token");
      // Don't kick demo users out
      if (token && token !== "demo-token") {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export const isDemo = () => localStorage.getItem("token") === "demo-token";

export function apiErrorMessage(err, fallback = "Request failed. Please check the backend and try again.") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

/**
 * Wraps a backend call. Demo mode returns mock data. Real users should see
 * real backend data only, so backend failures return an empty value instead
 * of silently showing demo records.
 * @param {() => Promise<any>} fn axios call
 * @param {string} mockKey key in mockData
 */
export async function safeRequest(fn, mockKey) {
  if (isDemo()) {
    return mockData[mockKey] ?? null;
  }
  try {
    const res = await fn();
    return res.data;
  } catch (e) {
    console.warn(`[api] backend request failed for ${mockKey}:`, e?.message);
    return Array.isArray(mockData[mockKey]) ? [] : null;
  }
}

// ---- API methods ----
export const api = {
  // auth
  login: (email, password) => client.post("/auth/login", { email, password }),
  register: (payload) => client.post("/auth/register", {
    ...payload,
    tenantName: payload.tenantName || payload.workspace || payload.workspaceName,
  }),
  me: () => client.get("/users/me"),

  // dashboard
  getGoals: () => safeRequest(() => client.get("/goals"), "goals"),
  createGoal: (g) => client.post("/goals", g),
  getTasks: () => safeRequest(() => client.get("/tasks"), "tasks"),
  createTask: (t) => client.post("/tasks", t),
  updateTask: (id, t) => client.put(`/tasks/${id}`, t),
  deleteTask: (id) => client.delete(`/tasks/${id}`),
  getDailyPlans: () => safeRequest(() => client.get("/daily-plans"), "dailyPlans"),
  createDailyPlan: (p) => client.post("/daily-plans", p),
  getNotifications: () =>
    safeRequest(() => client.get("/notifications"), "notifications"),

  // fitness
  getWorkouts: () => safeRequest(() => client.get("/workouts"), "workouts"),
  getWorkoutSessions: () =>
    safeRequest(() => client.get("/workout-sessions"), "workoutSessions"),
  createWorkoutSession: (s) => client.post("/workout-sessions", s),

  // nutrition
  getNutritionPlans: () =>
    safeRequest(() => client.get("/nutrition-plans"), "nutritionPlans"),
  getFoodLogs: () => safeRequest(() => client.get("/food-logs"), "foodLogs"),
  createFoodLog: (l) => client.post("/food-logs", l),

  // mood / stress
  getMoodLogs: () => safeRequest(() => client.get("/mood-logs"), "moodLogs"),
  createMoodLog: (l) => client.post("/mood-logs", l),
  getStressLogs: () => safeRequest(() => client.get("/stress-logs"), "stressLogs"),
  createStressLog: (l) => client.post("/stress-logs", l),

  // ai
  aiDailyPlan: (p) => client.post("/ai/daily-plan", p),
  aiWorkout: (p) => client.post("/ai/workout-suggestion", p),
  aiNutrition: (p) => client.post("/ai/nutrition-suggestion", p),
  aiMood: (p) => client.post("/ai/mood-analysis", p),
  aiChat: (p) => client.post("/ai/chat", p),
  aiWeeklyReport: (p) => client.post("/ai/weekly-report", p),
  getAIReports: () => safeRequest(() => client.get("/ai/reports"), "aiReports"),
  getAIHistory: () => safeRequest(() => client.get("/ai/history"), "aiHistory"),
};

export default client;
