import { NavLink, Outlet } from "react-router-dom";
import { Users, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const adminLinks = [
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const initials = (user?.fullName || user?.email || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand admin-brand">
          <div className="brand-mark admin-brand-mark">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="brand-title">Admin Console</div>
            <div className="brand-sub">User management</div>
          </div>
        </div>

        <nav className="nav admin-nav">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={end} 
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer admin-footer">
          <div className="user-card">
            <div className="avatar admin-avatar">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{user?.fullName || "Admin"}</div>
              <div className="user-ws">{["SUPER_ADMIN", "ROLE_SUPER_ADMIN"].includes(user?.role) ? "Global Admin" : "Tenant Admin"}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
