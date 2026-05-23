import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRound,
  UserX,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const isAdmin = (role) => ["ROLE_ADMIN", "ADMIN", "SUPER_ADMIN", "ROLE_SUPER_ADMIN"].includes(role);
const isSuperAdmin = (role) => ["SUPER_ADMIN", "ROLE_SUPER_ADMIN"].includes(role);

function roleLabel(role) {
  return String(role || "USER").replace("ROLE_", "").replace("_", " ");
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser]);

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.fullName, user.email, user.role, user.tenantName, user.tenant?.name, user.tenantId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [query, users]);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.enabled !== false).length;
    const admins = users.filter((user) => isAdmin(user.role)).length;
    const suspended = users.length - active;
    return { active, admins, suspended };
  }, [users]);

  const handleChangeRole = async (id, currentRole) => {
    const newRole = isAdmin(currentRole) ? "USER" : "ADMIN";
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await api.changeUserRole(id, newRole);
      setUsers((items) => items.map((user) => (user.id === id ? { ...user, role: newRole } : user)));
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to change role."));
    }
  };

  const handleToggleSuspend = async (id, isCurrentlyEnabled) => {
    const action = isCurrentlyEnabled ? "suspend" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.disableUser(id);
      setUsers((items) => items.map((user) => (user.id === id ? { ...user, enabled: !isCurrentlyEnabled } : user)));
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to change suspend status."));
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;

    try {
      await api.hardDeleteUser(id);
      setUsers((items) => items.filter((user) => user.id !== id));
    } catch (err) {
      alert(apiErrorMessage(err, "Failed to permanently delete user."));
    }
  };

  return (
    <div className="admin-users-page">
      <header className="admin-users-hero">
        <div>
          <span className="admin-kicker">
            <Shield size={14} />
            {isSuperAdmin(currentUser?.role) ? "Global access" : "Tenant scoped"}
          </span>
          <h1>User Management</h1>
          <p>
            {isSuperAdmin(currentUser?.role)
              ? "Manage users across every workspace."
              : "Manage only the users that belong to your workspace."}
          </p>
        </div>
        <button className="admin-refresh-btn" type="button" onClick={fetchUsers} disabled={loading}>
          <RefreshCcw size={16} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </header>

      <section className="admin-stat-grid">
        <div className="admin-stat">
          <UserRound size={18} />
          <span>Total users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="admin-stat">
          <CheckCircle2 size={18} />
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="admin-stat">
          <ShieldCheck size={18} />
          <span>Admins</span>
          <strong>{stats.admins}</strong>
        </div>
        <div className="admin-stat">
          <UserX size={18} />
          <span>Suspended</span>
          <strong>{stats.suspended}</strong>
        </div>
      </section>

      {error && (
        <div className="admin-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section className="admin-table-panel">
        <div className="admin-table-toolbar">
          <div>
            <h2>Registered users</h2>
            <p>{visibleUsers.length} shown from {users.length} loaded</p>
          </div>
          <label className="admin-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users"
            />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Workspace</th>
                <th>Role</th>
                <th>Status</th>
                <th className="admin-actions-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const self = user.id === currentUser?.id;
                const enabled = user.enabled !== false;
                return (
                  <tr key={user.id} className={!enabled ? "is-disabled" : ""}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {(user.fullName || user.email || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.fullName || "Unnamed user"} {self && <em>You</em>}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-workspace">{user.tenantName || user.tenant?.name || `Tenant ${user.tenantId}`}</span>
                    </td>
                    <td>
                      <span className={`admin-role-pill ${isAdmin(user.role) ? "admin" : "user"}`}>
                        {isAdmin(user.role) ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-pill ${enabled ? "active" : "suspended"}`}>
                        {enabled ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td>
                      {!self && (
                        <div className={`admin-row-actions ${!enabled ? "suspended-actions" : ""}`}>
                          <button className="secondary" type="button" onClick={() => handleChangeRole(user.id, user.role)}>
                            <Shield size={14} />
                            Role
                          </button>
                          <button className={!enabled ? "primary-action" : "secondary"} type="button" onClick={() => handleToggleSuspend(user.id, enabled)}>
                            <UserX size={14} />
                            {enabled ? "Suspend" : "Activate"}
                          </button>
                          <button className="danger" type="button" onClick={() => handleHardDelete(user.id)}>
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && visibleUsers.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="admin-empty">No users match this view.</div>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="5">
                    <div className="admin-empty">Loading users...</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
