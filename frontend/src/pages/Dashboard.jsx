import { useEffect, useMemo, useState } from "react";
import {
  Target,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  Check,
  Sparkles,
  Flame,
  Brain,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import StatCard from "../components/StatCard.jsx";
import { api } from "../api/client.js";

const STATUS_COLORS = { DONE: "#10b981", IN_PROGRESS: "#3b82f6", TODO: "#94a3b8" };

function isSameDay(a, b) {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.getGoals().then((d) => setGoals(d || []));
    api.getTasks().then((d) => setTasks(d || []));
    api.getDailyPlans().then((d) => setPlans(d || []));
  }, []);

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === "DONE").length;
    const avg =
      goals.length === 0
        ? 0
        : Math.round(
            goals.reduce((acc, g) => {
              const p =
                typeof g.progress === "number"
                  ? g.progress
                  : g.status === "COMPLETED"
                  ? 100
                  : 35;
              return acc + p;
            }, 0) / goals.length
          );
    return { totalGoals: goals.length, totalTasks: tasks.length, doneTasks: done, avg };
  }, [goals, tasks]);

  const taskPie = useMemo(() => {
    const counts = { DONE: 0, IN_PROGRESS: 0, TODO: 0 };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const week = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay()); // Sunday
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, d));
      const dayPlans = plans.filter((p) => p.planDate && isSameDay(p.planDate, d));
      return { date: d, tasks: dayTasks, plans: dayPlans };
    });
  }, [tasks, plans]);

  const todayTasks = tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, new Date()));

  const markDone = async (t) => {
    setTasks((arr) => arr.map((x) => (x.id === t.id ? { ...x, status: "DONE" } : x)));
    try {
      await api.updateTask(t.id, { ...t, status: "DONE" });
    } catch {}
  };

  const goalBars = goals.map((g) => ({
    name: g.title.length > 18 ? g.title.slice(0, 16) + "..." : g.title,
    progress:
      typeof g.progress === "number" ? g.progress : g.status === "COMPLETED" ? 100 : 35,
  }));

  return (
    <div className="grid-stack">
      <section className="hero-dashboard">
        <div className="hero-copy">
          <span className="kicker"><Sparkles size={14} /> AI Life Command Center</span>
          <h2>{stats.totalTasks + stats.totalGoals} focus signals for you</h2>
          <p>
            Your day is mapped across goals, tasks, fitness, nutrition and wellbeing.
            Choose the next high-impact move from a dashboard that feels alive.
          </p>
          <div className="hero-actions">
            <span className="hero-chip">Deep work block</span>
            <span className="hero-chip">Hydration target</span>
            <span className="hero-chip">Recovery check</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orbit-ring" />
          <div className="pulse-core">
            <strong>{stats.avg || 87}%</strong>
            <span>life pulse</span>
          </div>
          <div className="floating-card card-a">
            <Brain size={16} />
            <span>Mind</span>
            <b>{stats.doneTasks} done</b>
          </div>
          <div className="floating-card card-b">
            <Flame size={16} />
            <span>Body</span>
            <b>active</b>
          </div>
          <div className="floating-card card-c">
            <Activity size={16} />
            <span>Energy</span>
            <b>steady</b>
          </div>
        </div>
      </section>

      <section className="card">
        <header className="card-head">
          <h3>This week</h3>
          <span className="muted">Tasks & plans</span>
        </header>
        <div className="week">
          {week.map((d, i) => {
            const today = isSameDay(d.date, new Date());
            return (
              <div key={i} className={`day ${today ? "today" : ""}`}>
                <div className="day-name">
                  {d.date.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="day-num">{d.date.getDate()}</div>
                <div className="day-meta">
                  <span>{d.tasks.length} tasks</span>
                  <span>{d.plans.length} plans</span>
                </div>
                <div className="day-chips">
                  {d.tasks.slice(0, 2).map((t) => (
                    <span key={t.id} className="chip chip-sm">
                      {t.title.length > 14 ? t.title.slice(0, 12) + "..." : t.title}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid-4">
        <StatCard icon={Target} label="Total goals" value={stats.totalGoals} accent="blue" />
        <StatCard icon={ListTodo} label="Total tasks" value={stats.totalTasks} accent="green" />
        <StatCard icon={CheckCircle2} label="Completed tasks" value={stats.doneTasks} accent="green" />
        <StatCard icon={TrendingUp} label="Avg goal progress" value={`${stats.avg}%`} accent="blue" />
      </div>

      <div className="grid-2">
        <section className="card">
          <header className="card-head">
            <h3>Goal progress</h3>
            <span className="muted">Active goals</span>
          </header>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={goalBars} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#eef2f7" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={120} stroke="#64748b" />
                <Tooltip
                  cursor={{ fill: "rgba(167,255,25,0.08)" }}
                  contentStyle={{
                    background: "rgba(12,17,25,0.96)",
                    border: "1px solid rgba(167,255,25,0.22)",
                    borderRadius: 12,
                    color: "#ffffff",
                    boxShadow: "0 18px 48px rgba(0,0,0,0.34)",
                  }}
                  labelStyle={{ color: "#dce8f7" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Bar dataKey="progress" fill="url(#bg)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="bg" x1="0" x2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <header className="card-head">
            <h3>Task breakdown</h3>
            <span className="muted">By status</span>
          </header>
          <div style={{ height: 240, display: "flex", alignItems: "center" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={taskPie} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {taskPie.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(12,17,25,0.96)",
                    border: "1px solid rgba(167,255,25,0.22)",
                    borderRadius: 12,
                    color: "#ffffff",
                    boxShadow: "0 18px 48px rgba(0,0,0,0.34)",
                  }}
                  labelStyle={{ color: "#dce8f7" }}
                  itemStyle={{ color: "#ffffff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="legend">
              {taskPie.map((d) => (
                <li key={d.name}>
                  <span className="dot" style={{ background: STATUS_COLORS[d.name] }} />
                  {d.name.replace("_", " ")} <strong>{d.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <header className="card-head"><h3>Today's tasks</h3></header>
          {todayTasks.length === 0 ? (
            <div className="empty">No tasks scheduled for today.</div>
          ) : (
            <ul className="task-list">
              {todayTasks.map((t) => (
                <li key={t.id}>
                  <div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">
                      <span className={`badge st-${t.status}`}>{t.status}</span>
                      <span className="muted">{new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {t.status !== "DONE" && (
                    <button className="btn btn-mini" onClick={() => markDone(t)}>
                      <Check size={14} /> Done
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <header className="card-head"><h3>Active goals</h3></header>
          {goals.length === 0 ? (
            <div className="empty">No goals yet.</div>
          ) : (
            <div className="goal-grid">
              {goals.map((g) => {
                const p = typeof g.progress === "number" ? g.progress : g.status === "COMPLETED" ? 100 : 35;
                return (
                  <div key={g.id} className="goal-card">
                    <div className="goal-top">
                      <strong>{g.title}</strong>
                      <span className="muted">{g.category || "General"}</span>
                    </div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${p}%` }} /></div>
                    <div className="goal-bottom"><span>{p}%</span></div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
