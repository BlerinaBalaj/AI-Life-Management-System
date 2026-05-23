import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DailyPlanner from "./pages/DailyPlanner.jsx";
import Fitness from "./pages/Fitness.jsx";
import Nutrition from "./pages/Nutrition.jsx";
import MoodStress from "./pages/MoodStress.jsx";
import AIReports from "./pages/AIReports.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute userOnly>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<DailyPlanner />} />
        <Route path="/daily-planner" element={<DailyPlanner />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/mood" element={<MoodStress />} />
        <Route path="/reports" element={<AIReports />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
