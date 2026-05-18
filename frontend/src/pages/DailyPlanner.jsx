    import { useEffect, useState } from "react";
    import { CalendarDays, Sparkles, Plus, Trash2, X } from "lucide-react";
    import { api, apiErrorMessage, isDemo } from "../api/client.js";
    import AIOutputCard from "../components/AIOutputCard.jsx";
    import { mockAIResponse } from "../api/mockData.js";

    const SUGGESTIONS = [
      "Drink water", "Study 30 minutes", "Walk 20 minutes", "Review goals",
      "10 minute meditation", "Prepare healthy lunch", "Plan tomorrow", "Stretch break",
    ];

    const COLUMNS = [
      { id: "TODO", label: "To do" },
      { id: "IN_PROGRESS", label: "In progress" },
      { id: "DONE", label: "Done" },
    ];

    function parsePlanDate(value) {
      if (!value) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`);
      return new Date(value);
    }

    function formatPlanDate(value) {
      const date = parsePlanDate(value);
      if (!date || Number.isNaN(date.getTime())) {
        return { label: "No date", weekday: "--", day: "--", month: "" };
      }

      const today = new Date();
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffDays = Math.round((start - todayStart) / 86400000);

      let label = date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
      if (diffDays === 0) label = "Today";
      if (diffDays === 1) label = "Tomorrow";
      if (diffDays === -1) label = "Yesterday";

      return {
        label,
        weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
        day: date.toLocaleDateString(undefined, { day: "2-digit" }),
        month: date.toLocaleDateString(undefined, { month: "short" }),
      };
    }

    export default function DailyPlanner() {
      const [plans, setPlans] = useState([]);
      const [tasks, setTasks] = useState([]);
      const [aiData, setAiData] = useState(null);
      const [aiLoading, setAiLoading] = useState(false);
      const [taskModalOpen, setTaskModalOpen] = useState(false);

      const [planForm, setPlanForm] = useState({
        title: "",
        planDate: new Date().toISOString().slice(0, 10),
        summary: "",
      });
      const [taskForm, setTaskForm] = useState({
        title: "",
        dueDate: new Date().toISOString().slice(0, 10),
        priority: "MEDIUM",
        status: "TODO",
      });

      useEffect(() => {
        api.getDailyPlans().then((d) => setPlans(d || []));
        api.getTasks().then((d) => setTasks(d || []));
      }, []);

      const savePlan = async (e) => {
        e.preventDefault();
        const local = { id: Date.now(), ...planForm };
        setPlans((p) => [local, ...p]);
        setPlanForm({ title: "", planDate: planForm.planDate, summary: "" });
        try { await api.createDailyPlan(local); } catch {}
      };

      const addTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim()) return;
        const local = { id: Date.now(), ...taskForm };
        setTasks((t) => [local, ...t]);
        setTaskForm({ ...taskForm, title: "" });
        setTaskModalOpen(false);
        try { await api.createTask(local); } catch {}
      };

      const updateStatus = async (task, status) => {
        setTasks((arr) => arr.map((x) => (x.id === task.id ? { ...x, status } : x)));
        try { await api.updateTask(task.id, { ...task, status }); } catch {}
      };

      const removeTask = async (task) => {
        setTasks((arr) => arr.filter((x) => x.id !== task.id));
        try { await api.deleteTask(task.id); } catch {}
      };

      const aiPlan = async () => {
        setAiLoading(true);
        try {
          if (isDemo()) throw new Error("demo");
          const res = await api.aiDailyPlan({ planDate: planForm.planDate, focus: planForm.summary || "balanced day" });
          setAiData(res.data);
        } catch (err) {
          setAiData(isDemo() ? mockAIResponse : {
            summary: apiErrorMessage(err, "AI daily plan failed. Check OPENAI_API_KEY and backend logs."),
            recommendations: [],
            tasks: [],
            insights: ["This is a real API error, not demo data."],
          });
        } finally {
          setAiLoading(false);
        }
      };

      return (
        <div className="grid-stack">
          <section className="card planner-board-card">
            <header className="card-head">
              <div>
                <h3>Task board</h3>
                <p className="muted">Workflow view for today&apos;s priorities</p>
              </div>
              <div className="row gap">
                <span className="badge badge-soft">{tasks.length} tasks</span>
                <button className="btn btn-primary" type="button" onClick={() => setTaskModalOpen(true)}>
                  <Plus size={14} /> Add task
                </button>
              </div>
            </header>
            <div className="board">
              {COLUMNS.map((col) => (
                <div key={col.id} className={`board-col board-${col.id.toLowerCase()}`}>
                  <div className="board-col-head">
                    <span className={`dot st-${col.id}-bg`} />
                    <strong>{col.label}</strong>
                    <span className="board-count">{tasks.filter((t) => t.status === col.id).length}</span>
                  </div>
                  {tasks.filter((t) => t.status === col.id).map((t) => (
                    <div key={t.id} className="task-item">
                      <div className="task-title">{t.title}</div>
                      <div className="task-meta">
                        <span className={`badge pr-${t.priority}`}>{t.priority}</span>
                        {t.dueDate && <span className="muted">{new Date(t.dueDate).toLocaleDateString()}</span>}
                      </div>
                      <div className="row gap">
                        <select value={t.status} onChange={(e) => updateStatus(t, e.target.value)}>
                          <option>TODO</option><option>IN_PROGRESS</option><option>DONE</option>
                        </select>
                        <button className="btn-icon" onClick={() => removeTask(t)} aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {taskModalOpen && (
            <div className="modal-overlay" onClick={() => setTaskModalOpen(false)}>
              <div className="modal task-modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal-head">
                  <h3>Add task</h3>
                  <button className="btn-icon" type="button" onClick={() => setTaskModalOpen(false)} aria-label="Close">
                    <X size={16} />
                  </button>
                </header>
                <form className="form" onSubmit={addTask}>
                  <label>Title<input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required /></label>
                  <div className="task-modal-suggestions">
                    <span>Suggestions</span>
                    <div className="chips">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          className="chip"
                          type="button"
                          onClick={() => setTaskForm({ ...taskForm, title: s })}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid-3">
                    <label>Due date<input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></label>
                    <label>Priority
                      <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                        <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                      </select>
                    </label>
                    <label>Status
                      <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                        <option>TODO</option><option>IN_PROGRESS</option><option>DONE</option>
                      </select>
                    </label>
                  </div>
                  <button className="btn btn-primary" type="submit"><Plus size={14} /> Add Task</button>
                </form>
              </div>
            </div>
          )}

          <div className="grid-2">
            <section className="card planner-panel planner-panel-recent">
              <header className="card-head"><h3>Recent daily plans</h3></header>
              {plans.length === 0 ? <div className="empty">No plans yet.</div> : (
                <div className="daily-plan-stack">
                  {plans.map((p) => {
                    const date = formatPlanDate(p.planDate);
                    return (
                      <article key={p.id} className="daily-plan-card">
                        <div className="plan-date-tile">
                          <span>{date.weekday}</span>
                          <strong>{date.day}</strong>
                          <small>{date.month}</small>
                        </div>
                        <div className="daily-plan-body">
                          <div className="daily-plan-top">
                            <strong>{p.title}</strong>
                            <span><CalendarDays size={13} /> {date.label}</span>
                          </div>
                          <p>{p.summary || "No notes yet. Add one focus, one movement habit, and one reset moment."}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="card planner-panel planner-panel-create">
              <header className="card-head"><h3>Create daily plan</h3></header>
              <form className="form" onSubmit={savePlan}>
                <label>Title<input value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} required /></label>
                <label>Date<input type="date" value={planForm.planDate} onChange={(e) => setPlanForm({ ...planForm, planDate: e.target.value })} /></label>
                <label>Summary / notes<textarea rows="3" value={planForm.summary} onChange={(e) => setPlanForm({ ...planForm, summary: e.target.value })} /></label>
                <div className="row gap">
                  <button className="btn btn-primary" type="submit">Save Plan</button>
                  <button className="btn btn-ai" type="button" onClick={aiPlan} disabled={aiLoading}>
                    <Sparkles size={14} /> {aiLoading ? "Generating..." : "AI Generate"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {aiData && <AIOutputCard data={aiData} title="AI Daily Plan" />}
        </div>
      );
    }
