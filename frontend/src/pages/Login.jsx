import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { isAdminRole, useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, register, loginAsDemo } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    workspace: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res =
      mode === "login"
        ? await login(form.email, form.password)
        : await register(form);
    setBusy(false);
    if (res.ok) {
      nav(isAdminRole(res.user?.role) ? "/admin/users" : "/home");
      return;
    }
    setMsg(res.message || "Could not sign in. Please check the backend and try again.");
  };

  const demo = () => {
    loginAsDemo();
    nav("/home");
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="auth-brand">
          <div className="brand-mark big">
            <Leaf size={22} />
          </div>
          <span>LifeOS</span>
        </div>
        <span className="auth-eyebrow">AI Personal Life Management</span>
        <h2>Plan your day. Track your energy. Understand your patterns.</h2>
        <p>
          A calm space for goals, tasks, workouts, meals, mood, stress and weekly
          AI insights. Less guessing, more awareness.
        </p>
        <ul className="auth-points">
          <li><CheckCircle2 size={14} /> Build daily plans that are easier to follow</li>
          <li><CheckCircle2 size={14} /> Notice links between habits, mood and focus</li>
          <li><Sparkles size={14} /> Turn your week into clear AI recommendations</li>
        </ul>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-card-kicker">Welcome to LifeOS</div>
          <h1 className="auth-card-title">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="auth-card-copy">
            Continue with your account, or use demo mode to preview the full app.
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="form">
            {mode === "register" && (
              <>
                <label>
                  Full name
                  <input name="fullName" placeholder="Your name" value={form.fullName} onChange={onChange} required />
                </label>
                <label>
                  Space name
                  <input name="workspace" placeholder="Personal" value={form.workspace} onChange={onChange} required />
                </label>
              </>
            )}
            <label>
              Email
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
            </label>
            <label>
              Password
              <input name="password" type="password" placeholder="Your password" value={form.password} onChange={onChange} required />
            </label>

            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn btn-ghost btn-demo" onClick={demo}>
            Continue as Demo User
          </button>

          {msg && <p className="auth-msg">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
