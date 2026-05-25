    import { useEffect, useState } from "react";
    import { CalendarDays, Sparkles, Plus, Trash2, X, Pencil, Search, SlidersHorizontal, RotateCcw } from "lucide-react";
    import { api, apiErrorMessage, isDemo } from "../api/client.js";
    import AIOutputCard from "../components/AIOutputCard.jsx";
    import { mockAIResponse } from "../api/mockData.js";

    const SUGGESTIONS = [
      "Drink water", "Study 30 minutes", "Walk 20 minutes", "Review goals",
      "10 minute meditation", "Prepare healthy lunch", "Plan tomorrow", "Stretch break",
      "Write journal note", "Prepare workout clothes", "Read 10 pages", "Clean desk",
      "Call a friend", "Meal prep snack", "Review budget", "Sleep routine",
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

    function priorityLabel(value) {
      if (value === 1 || value === "1") return "LOW";
      if (value === 2 || value === "2") return "MEDIUM";
      if (value === 3 || value === "3") return "HIGH";
      return value || "MEDIUM";
    }

    function filterTasksLocally(tasks, query, status) {
      const needle = String(query || "").trim().toLowerCase();
      return tasks.filter((task) => {
        const matchesStatus = !status || task.status === status;
        const haystack = `${task.title || ""} ${task.description || ""}`.toLowerCase();
        const matchesQuery = !needle || haystack.includes(needle);
        return matchesStatus && matchesQuery;
      });
    }

    export default function DailyPlanner() {
      const [plans, setPlans] = useState([]);
      const [tasks, setTasks] = useState([]);
      const [allTasks, setAllTasks] = useState([]);
      const [aiData, setAiData] = useState(null);
      const [aiLoading, setAiLoading] = useState(false);
      const [taskModalOpen, setTaskModalOpen] = useState(false);
      const [editingPlan, setEditingPlan] = useState(null);
      const [filters, setFilters] = useState({ query: "", status: "ALL" });
      const [filtering, setFiltering] = useState(false);
      const [filterError, setFilterError] = useState("");

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
      const [editForm, setEditForm] = useState({
        title: "",
        planDate: new Date().toISOString().slice(0, 10),
        summary: "",
      });

      useEffect(() => {
        api.getDailyPlans().then((d) => setPlans(d || []));
        api.getTasks().then((d) => {
          setAllTasks(d || []);
          setTasks(d || []);
        });
      }, []);

      const applyFilters = async (e) => {
        e?.preventDefault();
        setFiltering(true);
        setFilterError("");
        const query = filters.query.trim();
        const status = filters.status === "ALL" ? undefined : filters.status;
        try {
          if (isDemo()) {
            setTasks(filterTasksLocally(allTasks, query, status));
            return;
          }
          const res = await api.searchTasks({ query, status });
          setTasks(res.data || []);
        } catch (err) {
          setFilterError(apiErrorMessage(err, "Filtering failed. Showing local task filter instead."));
          setTasks(filterTasksLocally(allTasks, query, status));
        } finally {
          setFiltering(false);
        }
      };

      const resetFilters = async () => {
        setFilters({ query: "", status: "ALL" });
        setFilterError("");
        const allTasks = await api.getTasks();
        setAllTasks(allTasks || []);
        setTasks(allTasks || []);
      };

      const savePlan = async (e) => {
        e.preventDefault();
        try {
          const res = await api.createDailyPlan(planForm);
          setPlans((p) => [res.data, ...p]);
          setPlanForm({ title: "", planDate: planForm.planDate, summary: "" });
        } catch (err) {
          alert(apiErrorMessage(err, "Daily plan could not be saved."));
        }
      };

      const upsertPlan = (plan) => {
        if (!plan) return;
        setPlans((current) => {
          const exists = current.some((item) => item.id === plan.id);
          if (exists) return current.map((item) => (item.id === plan.id ? plan : item));
          return [plan, ...current];
        });
      };

      const openPlanEditor = (plan) => {
        setEditingPlan(plan);
        setEditForm({
          title: plan.title || "",
          planDate: String(plan.planDate || new Date().toISOString()).slice(0, 10),
          summary: plan.summary || "",
        });
      };

      const savePlanEdits = async (e) => {
        e.preventDefault();
        if (!editingPlan) return;
        try {
          const res = await api.updateDailyPlan(editingPlan.id, editForm);
          upsertPlan(res.data);
          setEditingPlan(null);
        } catch (err) {
          alert(apiErrorMessage(err, "Daily plan notes could not be saved."));
        }
      };

      const addTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim()) return;
        try {
          const res = await api.createTask(taskForm);
          setAllTasks((t) => [res.data, ...t]);
          setTasks((t) => [res.data, ...t]);
          setTaskForm({ ...taskForm, title: "" });
          setTaskModalOpen(false);
        } catch (err) {
          alert(apiErrorMessage(err, "Task could not be saved."));
        }
      };

      const updateStatus = async (task, status) => {
        setAllTasks((arr) => arr.map((x) => (x.id === task.id ? { ...x, status } : x)));
        setTasks((arr) => arr.map((x) => (x.id === task.id ? { ...x, status } : x)));
        try { await api.updateTask(task.id, { ...task, status }); } catch {}
      };

      const removeTask = async (task) => {
        setAllTasks((arr) => arr.filter((x) => x.id !== task.id));
        setTasks((arr) => arr.filter((x) => x.id !== task.id));
        try { await api.deleteTask(task.id); } catch {}
      };

      const aiPlan = async () => {
        setAiLoading(true);
        try {
          if (isDemo()) throw new Error("demo");
          const res = await api.aiDailyPlan({ planDate: planForm.planDate, focus: planForm.summary || "balanced day" });
          setAiData(res.data);
          upsertPlan(res.data?.dailyPlan);
        } catch (err) {
          if (isDemo()) {
            const demoPlan = {
              title: "AI Daily Plan",
              planDate: planForm.planDate,
              summary: mockAIResponse.summary,
              aiGenerated: true,
            };
            const saved = await api.createDailyPlan(demoPlan);
            setAiData({ ...mockAIResponse, dailyPlan: saved.data });
            upsertPlan(saved.data);
          } else {
            setAiData({
            summary: apiErrorMessage(err, "AI daily plan failed. Check LLAMA_BASE_URL, LLAMA_MODEL, LLAMA_API_KEY, and backend logs."),
            recommendations: [],
            tasks: [],
            insights: ["This is a real API error, not demo data."],
            });
          }
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
                <span className="badge badge-soft">{tasks.length} / {allTasks.length} tasks</span>
                <button className="btn btn-primary" type="button" onClick={() => setTaskModalOpen(true)}>
                  <Plus size={14} /> Add task
                </button>
              </div>
            </header>

            <form className="filter-bar task-filter-bar" onSubmit={applyFilters}>
              <label className="filter-search">
                <Search size={15} />
                <input
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Search task title or description"
                />
              </label>
              <label className="filter-select">
                <SlidersHorizontal size={15} />
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="ALL">All statuses</option>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </label>
              <button className="btn btn-primary" type="submit" disabled={filtering}>
                <Search size={14} /> {filtering ? "Filtering..." : "Apply filters"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={resetFilters}>
                <RotateCcw size={14} /> Reset
              </button>
            </form>
            {(filters.query.trim() || filters.status !== "ALL") && (
              <div className="active-filter-note">
                Showing tasks matching {filters.query.trim() ? `"${filters.query.trim()}"` : "any text"} and {filters.status === "ALL" ? "any status" : filters.status}.
              </div>
            )}
            {filterError && <div className="filter-error">{filterError}</div>}

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
                        <span className={`badge pr-${priorityLabel(t.priority)}`}>{priorityLabel(t.priority)}</span>
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
                        <option value="TODO">TODO</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="DONE">DONE</option>
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
                            <div className="row gap">
                              <span><CalendarDays size={13} /> {date.label}</span>
                              <button className="btn-icon" type="button" onClick={() => openPlanEditor(p)} aria-label="Edit plan notes">
                                <Pencil size={14} />
                              </button>
                            </div>
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

          {aiData && <AIOutputCard data={aiData} title="AI Daily Plan" simple />}

          {editingPlan && (
            <div className="modal-overlay" onClick={() => setEditingPlan(null)}>
              <div className="modal task-modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal-head">
                  <h3>Edit daily plan</h3>
                  <button className="btn-icon" type="button" onClick={() => setEditingPlan(null)} aria-label="Close">
                    <X size={16} />
                  </button>
                </header>
                <form className="form" onSubmit={savePlanEdits}>
                  <label>Title<input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required /></label>
                  <label>Date<input type="date" value={editForm.planDate} onChange={(e) => setEditForm({ ...editForm, planDate: e.target.value })} /></label>
                  <label>Summary / notes<textarea rows="5" value={editForm.summary} onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })} /></label>
                  <div className="row gap">
                    <button className="btn btn-primary" type="submit">Save Notes</button>
                    <button className="btn btn-ghost" type="button" onClick={() => setEditingPlan(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
