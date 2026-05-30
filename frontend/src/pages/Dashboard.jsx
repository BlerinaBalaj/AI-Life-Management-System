import { useEffect, useMemo, useState } from "react";
import {
  Target,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Flame,
  Brain,
  Activity,
  Apple,
  CalendarDays,
  Plus,
  X,
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

function parseDateValue(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 12, minute = 0] = value;
    return new Date(year, (month || 1) - 1, day || 1, hour, minute);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a, b) {
  const x = parseDateValue(a), y = parseDateValue(b);
  if (!x || !y) return false;
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

function taskDateValue(task) {
  return task.dueDate || task.scheduledDate || task.date || task.createdAt || null;
}

function taskBelongsToDay(task, day, dayPlans = []) {
  const linkedPlan = task.dailyPlanId && dayPlans.some((plan) => String(plan.id) === String(task.dailyPlanId));
  if (linkedPlan) return true;
  const dateValue = taskDateValue(task);
  if (dateValue) return isSameDay(dateValue, day);
  return isSameDay(day, new Date());
}

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [foods, setFoods] = useState([]);
  const [moods, setMoods] = useState([]);
  const [stress, setStress] = useState([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    status: "ACTIVE",
    priority: "MEDIUM",
    targetDate: "",
  });

  useEffect(() => {
    api.getGoals().then((d) => setGoals(d || []));
    api.getTasks().then((d) => setTasks(d || []));
    api.getDailyPlans().then((d) => setPlans(d || []));
    api.getWorkoutSessions().then((d) => setSessions(d || []));
    api.getFoodLogs().then((d) => setFoods(d || []));
    api.getMoodLogs().then((d) => setMoods(d || []));
    api.getStressLogs().then((d) => setStress(d || []));
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
    const avgMood = moods.length
      ? moods.reduce((sum, mood) => sum + (mood.moodScore || 0), 0) / moods.length
      : 0;
    const avgStress = stress.length
      ? stress.reduce((sum, item) => sum + (item.stressLevel || 0), 0) / stress.length
      : 0;
    const taskScore = tasks.length ? Math.round((done / tasks.length) * 40) : 0;
    const bodyScore = Math.min(25, sessions.length * 8);
    const moodScore = avgMood ? Math.round((avgMood / 10) * 25) : 0;
    const stressScore = avgStress ? Math.max(0, 10 - Math.round(avgStress)) : 0;
    const pulse = Math.max(0, Math.min(100, taskScore + bodyScore + moodScore + stressScore));
    return { totalGoals: goals.length, totalTasks: tasks.length, doneTasks: done, avg, avgMood, avgStress, pulse };
  }, [goals, moods, sessions, stress, tasks]);

  const latestPlan = plans[0];
  const latestSession = sessions[0];
  const latestFood = foods[0];
  const latestMood = moods[0];
  const latestStress = stress[0];

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
      const dayPlans = plans.filter((p) => p.planDate && isSameDay(p.planDate, d));
      const dayTasks = tasks.filter((t) => taskBelongsToDay(t, d, dayPlans));
      return { date: d, tasks: dayTasks, plans: dayPlans };
    });
  }, [tasks, plans]);

  const todayPlans = plans.filter((p) => p.planDate && isSameDay(p.planDate, new Date()));
  const todayTasks = tasks.filter((t) => taskBelongsToDay(t, new Date(), todayPlans));

  const addGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;
    try {
      const payload = {
        ...goalForm,
        targetDate: goalForm.targetDate || undefined,
      };
      const res = await api.createGoal(payload);
      setGoals((current) => [res.data, ...current]);
      setGoalForm({ title: "", description: "", status: "ACTIVE", priority: "MEDIUM", targetDate: "" });
      setGoalModalOpen(false);
    } catch {
      alert("Goal could not be saved.");
    }
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
            <strong>{stats.pulse}%</strong>
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
            <b>{sessions.length ? `${sessions.length} sessions` : "no sessions"}</b>
          </div>
          <div className="floating-card card-c">
            <Activity size={16} />
            <span>Energy</span>
            <b>{stats.avgMood ? `${stats.avgMood.toFixed(1)}/10 mood` : "no mood logs"}</b>
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

      <section className="dashboard-signal-grid">
        <article className="card dashboard-signal-card signal-plan">
          <CalendarDays size={18} />
          <span>Latest plan</span>
          <strong>{latestPlan?.title || "No plan yet"}</strong>
          <p>{latestPlan?.summary || "Create a daily plan to connect your tasks to a bigger day structure."}</p>
        </article>
        <article className="card dashboard-signal-card signal-workout">
          <Flame size={18} />
          <span>Latest workout</span>
          <strong>{latestSession ? `${latestSession.durationMinutes || 0} min` : "No session yet"}</strong>
          <p>{latestSession?.notes || "Log a workout session to update your body signal."}</p>
        </article>
        <article className="card dashboard-signal-card signal-food">
          <Apple size={18} />
          <span>Latest food</span>
          <strong>{latestFood?.foodName || "No meal logged"}</strong>
          <p>{latestFood ? `${latestFood.calories || 0} kcal · P ${latestFood.proteinGrams || 0}g` : "Food logs help reports understand energy and nutrition."}</p>
        </article>
        <article className="card dashboard-signal-card signal-wellbeing">
          <Brain size={18} />
          <span>Wellbeing</span>
          <strong>{latestMood ? `${latestMood.moodLabel || "mood"} · ${latestMood.moodScore}/10` : "No mood yet"}</strong>
          <p>{latestStress ? `Latest stress: ${latestStress.stressLevel}/10` : "Mood and stress logs make the AI analysis less generic."}</p>
        </article>
      </section>

      <div className="grid-2 dashboard-goal-row">
        <section className="card">
          <header className="card-head">
            <div>
              <h3>Goal progress</h3>
              <span className="muted">Active goals</span>
            </div>
            <button className="btn btn-primary btn-compact" type="button" onClick={() => setGoalModalOpen(true)}>
              <Plus size={14} /> Add goal
            </button>
          </header>
          {goalBars.length === 0 ? (
            <div className="goal-explainer">
              <Target size={20} />
              <strong>Goals are your bigger outcomes.</strong>
              <p>Use goals for things that take days or weeks, like fitness, learning, money, sleep, or consistency. Tasks are the steps you do today.</p>
            </div>
          ) : (
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
          )}
          {goals.length === 0 ? (
            <div className="empty">No goals yet. Add one bigger outcome to give the dashboard context.</div>
          ) : (
            <div className="goal-grid dashboard-goals-list">
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
        <section className="card">
          <header className="card-head">
            <div>
              <h3>Task breakdown</h3>
              <span className="muted">By status</span>
            </div>
          </header>
          <div className="task-scope-grid">
            <div className="task-scope-card task-scope-today">
              <span>Today</span>
              <strong>{todayTasks.length}</strong>
              <small>{todayPlans.length} plans linked</small>
            </div>
            <div className="task-scope-card task-scope-all">
              <span>All days</span>
              <strong>{tasks.length}</strong>
              <small>{stats.doneTasks} completed</small>
            </div>
          </div>
          <div className="task-breakdown-chart">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={taskPie} dataKey="value" innerRadius={78} outerRadius={122} paddingAngle={3}>
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
                  <span className="legend-label">{d.name.replace("_", " ")}</span> <strong>{d.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {goalModalOpen && (
        <div className="modal-overlay" onClick={() => setGoalModalOpen(false)}>
          <div className="modal task-modal goal-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Active goals</span>
                <h3>Add a new goal</h3>
              </div>
              <button className="btn-icon" type="button" onClick={() => setGoalModalOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </header>
            <form className="form dashboard-goal-form" onSubmit={addGoal}>
              <label>Goal title<input value={goalForm.title} placeholder="Example: Build a 3-day workout routine" onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} required /></label>
              <label>Why it matters<textarea rows="2" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} /></label>
              <div className="grid-2">
                <label>Priority
                  <select value={goalForm.priority} onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}>
                    <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                  </select>
                </label>
                <label>Target date<input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })} /></label>
              </div>
              <button className="btn btn-primary" type="submit"><Plus size={14} /> Add Goal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
