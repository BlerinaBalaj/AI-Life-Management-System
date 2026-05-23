import { NavLink } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  CalendarCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  Sparkles,
  LogOut,
  Leaf,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/home", label: "Home", icon: House },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Daily Planner", icon: CalendarCheck },
  { to: "/fitness", label: "Fitness", icon: Dumbbell },
  { to: "/nutrition", label: "Nutrition", icon: Apple },
  { to: "/mood", label: "Mood & Stress", icon: HeartPulse },
  { to: "/reports", label: "AI Reports", icon: Sparkles },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initials = (user?.fullName || user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Leaf size={20} />
        </div>
        <div>
          <div className="brand-title">LifeOS</div>
          <div className="brand-sub">AI Life Manager</div>
        </div>
      </div>

      <nav className="nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link">
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
        {["ROLE_ADMIN", "ADMIN", "ROLE_SUPER_ADMIN", "SUPER_ADMIN"].includes(user?.role) && (
          <NavLink to="/admin" className="nav-link" style={{ marginTop: "1rem", color: "var(--primary)" }}>
            <Shield size={18} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div className="user-meta">
            <div className="user-name">{user?.fullName || "Guest"}</div>
            <div className="user-ws">{user?.workspace || "Personal"}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
