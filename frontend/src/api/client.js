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

const DEMO_STORE_KEY = "aiLifeDemoData";

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDemoStore() {
  try {
    const stored = localStorage.getItem(DEMO_STORE_KEY);
    if (stored) {
      return { ...cloneData(mockData), ...JSON.parse(stored) };
    }
  } catch (err) {
    console.warn("[api] demo store could not be read:", err?.message);
  }
  return cloneData(mockData);
}

function writeDemoStore(data) {
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(data));
}

function demoResponse(data) {
  return Promise.resolve({ data });
}

function demoCreate(key, payload) {
  const store = readDemoStore();
  const collection = store[key] ?? [];
  const maxId = collection.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  const item = {
    id: maxId + 1,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  store[key] = [item, ...collection];
  writeDemoStore(store);
  return demoResponse(item);
}

function demoUpdate(key, id, payload) {
  const store = readDemoStore();
  const collection = store[key] ?? [];
  const itemId = Number(id);
  let updatedItem = null;
  store[key] = collection.map((item) => {
    if (Number(item.id) !== itemId) return item;
    updatedItem = { ...item, ...payload, id: item.id };
    return updatedItem;
  });
  writeDemoStore(store);
  return demoResponse(updatedItem ?? { id, ...payload });
}

function demoDelete(key, id) {
  const store = readDemoStore();
  const itemId = Number(id);
  store[key] = (store[key] ?? []).filter((item) => Number(item.id) !== itemId);
  writeDemoStore(store);
  return demoResponse(null);
}

async function writableRequest(fn, fallback) {
  if (isDemo()) {
    return fallback();
  }
  try {
    return await fn();
  } catch (err) {
    console.warn("[api] backend write failed, using local fallback:", err?.message);
    return fallback();
  }
}

export function apiErrorMessage(err, fallback = "Request failed. Please check the backend and try again.") {
  if (!err?.response?.data?.message && err?.response?.data?.error === "Forbidden") {
    return fallback;
  }
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
    return readDemoStore()[mockKey] ?? null;
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
  createGoal: (g) => writableRequest(() => client.post("/goals", g), () => demoCreate("goals", g)),
  getTasks: () => safeRequest(() => client.get("/tasks"), "tasks"),
  createTask: (t) => writableRequest(() => client.post("/tasks", t), () => demoCreate("tasks", t)),
  updateTask: (id, t) => writableRequest(() => client.put(`/tasks/${id}`, t), () => demoUpdate("tasks", id, t)),
  deleteTask: (id) => writableRequest(() => client.delete(`/tasks/${id}`), () => demoDelete("tasks", id)),
  getDailyPlans: () => safeRequest(() => client.get("/daily-plans"), "dailyPlans"),
  createDailyPlan: (p) => writableRequest(() => client.post("/daily-plans", p), () => demoCreate("dailyPlans", p)),
  updateDailyPlan: (id, p) => writableRequest(() => client.put(`/daily-plans/${id}`, p), () => demoUpdate("dailyPlans", id, p)),
  getNotifications: () =>
    safeRequest(() => client.get("/notifications"), "notifications"),

  // search / filtering
  searchTasks: (params) => client.get("/search/tasks", { params }),
  searchWorkouts: (params) => client.get("/search/workouts", { params }),
  searchNutrition: (params) => client.get("/search/nutrition", { params }),
  searchMoodLogs: (params) => client.get("/search/mood-logs", { params }),
  searchAIReports: (params) => client.get("/search/ai-reports", { params }),

  // fitness
  getWorkouts: () => safeRequest(() => client.get("/workouts"), "workouts"),
  getWorkoutSessions: () =>
    safeRequest(() => client.get("/workout-sessions"), "workoutSessions"),
  createWorkoutSession: (s) => writableRequest(() => client.post("/workout-sessions", s), () => demoCreate("workoutSessions", s)),

  // nutrition
  getNutritionPlans: () =>
    safeRequest(() => client.get("/nutrition-plans"), "nutritionPlans"),
  getFoodLogs: () => safeRequest(() => client.get("/food-logs"), "foodLogs"),
  createFoodLog: (l) => writableRequest(() => client.post("/food-logs", l), () => demoCreate("foodLogs", l)),

  // mood / stress
  getMoodLogs: () => safeRequest(() => client.get("/mood-logs"), "moodLogs"),
  createMoodLog: (l) => writableRequest(() => client.post("/mood-logs", l), () => demoCreate("moodLogs", l)),
  getStressLogs: () => safeRequest(() => client.get("/stress-logs"), "stressLogs"),
  createStressLog: (l) => writableRequest(() => client.post("/stress-logs", l), () => demoCreate("stressLogs", l)),

  // ai
  aiDailyPlan: (p) => client.post("/ai/daily-plan", p),
  aiWorkout: (p) => client.post("/ai/workout-suggestion", p),
  aiNutrition: (p) => client.post("/ai/nutrition-suggestion", p),
  aiMood: (p) => client.post("/ai/mood-analysis", p),
  aiChat: (p) => client.post("/ai/chat", p),
  aiWeeklyReport: (p) => client.post("/ai/weekly-report", p),
  getAIReports: () => safeRequest(() => client.get("/ai/reports"), "aiReports"),
  getAIHistory: () => safeRequest(() => client.get("/ai/history"), "aiHistory"),

  // admin
  getAdminUsers: () => client.get("/admin/users"),
  changeUserRole: (id, role) => client.put(`/admin/users/${id}/role`, { role }),
  disableUser: (id) => client.delete(`/admin/users/${id}`),
  hardDeleteUser: (id) => client.delete(`/admin/users/${id}/hard`),
};

export default client;
