import { useEffect, useMemo, useState } from "react";
import { Sparkles, Dumbbell, Flame, Clock, Activity, Plus, X, PlayCircle, CheckCircle2, CalendarDays, Search } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import AIOutputCard from "../components/AIOutputCard.jsx";
import { api, apiErrorMessage, isDemo } from "../api/client.js";
import { mockAIResponse } from "../api/mockData.js";

const WORKOUT_DETAILS = {
  "full body strength": {
    focus: "Build total-body strength with controlled compound movements.",
    intensity: "Steady strength",
    calories: 380,
    warmup: "5 min dynamic mobility + light squats",
    cooldown: "Hamstring stretch, chest opener, slow breathing",
    exercises: [
      { name: "Goblet squat", work: "3 sets x 10 reps", note: "Keep chest tall and move slowly." },
      { name: "Push-ups", work: "3 sets x 8-12 reps", note: "Use knees or incline if needed." },
      { name: "Dumbbell row", work: "3 sets x 10 reps each side", note: "Pull elbow toward hip." },
      { name: "Romanian deadlift", work: "3 sets x 10 reps", note: "Hinge at hips, soft knees." },
      { name: "Plank", work: "3 rounds x 35 sec", note: "Brace like a quiet core challenge." },
    ],
  },
  "hiit cardio burn": {
    focus: "Raise heart rate quickly with short intervals and simple moves.",
    intensity: "High energy",
    calories: 260,
    warmup: "4 min easy march, arm circles, bodyweight squats",
    cooldown: "Walk slowly for 3 min + calf and quad stretch",
    exercises: [
      { name: "Jumping jacks", work: "40 sec work / 20 sec rest", note: "Stay light on your feet." },
      { name: "Mountain climbers", work: "40 sec work / 20 sec rest", note: "Keep shoulders over wrists." },
      { name: "Bodyweight squats", work: "40 sec work / 20 sec rest", note: "Push knees out gently." },
      { name: "High knees", work: "40 sec work / 20 sec rest", note: "Drive arms with rhythm." },
      { name: "Repeat circuit", work: "4 rounds total", note: "Rest 60 sec between rounds." },
    ],
  },
  "yoga flow": {
    focus: "Reset mobility, breathing and stress with a gentle flow.",
    intensity: "Recovery flow",
    calories: 140,
    warmup: "2 min deep breathing in child pose",
    cooldown: "Supine twist + 10 slow breaths",
    exercises: [
      { name: "Cat-cow", work: "8 slow rounds", note: "Move with breath." },
      { name: "Downward dog", work: "3 holds x 30 sec", note: "Bend knees if hamstrings are tight." },
      { name: "Low lunge", work: "45 sec each side", note: "Relax shoulders." },
      { name: "Warrior II", work: "45 sec each side", note: "Strong legs, soft jaw." },
      { name: "Seated forward fold", work: "60 sec", note: "No forcing, just release." },
    ],
  },
};

const STARTER_WORKOUTS = [
  { id: "starter-strength", title: "Full Body Strength", description: "Compound lifts focused workout.", difficulty: "Intermediate", duration: 45 },
  { id: "starter-hiit", title: "HIIT Cardio Burn", description: "20-minute high intensity intervals.", difficulty: "Advanced", duration: 20 },
  { id: "starter-yoga", title: "Yoga Flow", description: "Relaxing vinyasa flow.", difficulty: "Beginner", duration: 30 },
];

const SESSION_SUGGESTIONS = [
  STARTER_WORKOUTS[0],
  STARTER_WORKOUTS[1],
  STARTER_WORKOUTS[2],
  { id: "starter-walk", title: "Brisk Walk", description: "Low-pressure outdoor cardio.", difficulty: "Beginner", duration: 25 },
];

function getWorkoutDetails(workout) {
  const key = (workout?.title || "").toLowerCase();
  const description = readableAiText(workout?.description);
  return WORKOUT_DETAILS[key] || {
    focus: description || "A balanced session built around movement, control and recovery.",
    intensity: workout?.difficulty || "Balanced",
    calories: Math.max(120, Math.round((workout?.duration || 30) * 7)),
    warmup: "5 min easy movement and joint mobility",
    cooldown: "Light stretching and slow breathing",
    exercises: [
      { name: "Warm-up mobility", work: "5 min", note: "Prepare joints and breathing." },
      { name: "Main movement block", work: "3 rounds", note: "Keep the pace controlled." },
      { name: "Core or stability", work: "3 sets", note: "Focus on clean form." },
      { name: "Recovery stretch", work: "5 min", note: "Let heart rate come down." },
    ],
  };
}

function readableAiText(value) {
  if (!value) return "";
  if (typeof value !== "string") return String(value);
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.summary) return parsed.summary;
    if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) {
      return parsed.recommendations.join(" ");
    }
    if (Array.isArray(parsed.tasks) && parsed.tasks.length) {
      return parsed.tasks.join(" ");
    }
  } catch {
    return value;
  }
  return value;
}

function aiItems(value, key) {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed[key]) ? parsed[key].filter(Boolean).slice(0, 3) : [];
  } catch {
    return [];
  }
}

function formatSessionDate(value) {
  if (!value) {
    return { label: "No date", weekday: "--", day: "--", month: "", time: "" };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { label: "No date", weekday: "--", day: "--", month: "", time: "" };
  }

  const today = new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((start - todayStart) / 86400000);

  let label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (diffDays === 0) label = "Today";
  if (diffDays === -1) label = "Yesterday";

  return {
    label,
    weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    day: date.toLocaleDateString(undefined, { day: "2-digit" }),
    month: date.toLocaleDateString(undefined, { month: "short" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

export default function Fitness() {
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ai, setAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [workoutFilters, setWorkoutFilters] = useState({ query: "", difficulty: "" });
  const [filteredWorkouts, setFilteredWorkouts] = useState(null);
  const [workoutFiltering, setWorkoutFiltering] = useState(false);
  const [workoutFilterError, setWorkoutFilterError] = useState("");
  const [form, setForm] = useState({
    workoutTitle: "",
    startedAt: new Date().toISOString().slice(0, 16),
    durationMinutes: 30,
    caloriesBurned: 200,
    notes: "",
  });

  useEffect(() => {
    api.getWorkouts().then((d) => setWorkouts(d || []));
    api.getWorkoutSessions().then((d) => setSessions(d || []));
  }, []);

  const stats = useMemo(() => {
    const minutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);
    const cals = sessions.reduce((a, s) => a + (s.caloriesBurned || 0), 0);
    return { plans: Math.max(workouts.length, STARTER_WORKOUTS.length), sessions: sessions.length, minutes, cals };
  }, [workouts, sessions]);

  const todayStats = useMemo(() => {
    const todaySessions = sessions.filter((session) => isToday(session.startedAt));
    return {
      sessions: todaySessions.length,
      minutes: todaySessions.reduce((a, s) => a + (s.durationMinutes || 0), 0),
      cals: todaySessions.reduce((a, s) => a + (s.caloriesBurned || 0), 0),
    };
  }, [sessions]);

  const starterTitles = new Set(STARTER_WORKOUTS.map((workout) => workout.title.toLowerCase()));
  const displayWorkouts = [
    ...STARTER_WORKOUTS,
    ...workouts.filter((workout) => !starterTitles.has(String(workout.title || "").toLowerCase())),
  ];

  const applyWorkoutFilters = async (e) => {
    e.preventDefault();
    setWorkoutFiltering(true);
    setWorkoutFilterError("");
    const query = workoutFilters.query.trim();
    const difficulty = workoutFilters.difficulty || undefined;
    try {
      const res = await api.searchWorkouts({ query, difficulty });
      setFilteredWorkouts(res.data ?? res);
    } catch (err) {
      setWorkoutFilterError(apiErrorMessage(err, "Search failed. Showing local filter instead."));
      const needle = query.toLowerCase();
      setFilteredWorkouts(displayWorkouts.filter((w) => {
        const matchText = !needle || (w.title || "").toLowerCase().includes(needle) || (w.description || "").toLowerCase().includes(needle);
        const matchDiff = !difficulty || (w.difficulty || "").toUpperCase() === difficulty.toUpperCase();
        return matchText && matchDiff;
      }));
    } finally {
      setWorkoutFiltering(false);
    }
  };

  const resetWorkoutFilters = () => {
    setWorkoutFilters({ query: "", difficulty: "" });
    setFilteredWorkouts(null);
    setWorkoutFilterError("");
  };

  const upsertWorkoutPlan = (plan) => {
    if (!plan) return;
    setWorkouts((current) => {
      const exists = current.some((item) => item.id === plan.id);
      if (exists) return current.map((item) => (item.id === plan.id ? plan : item));
      return [plan, ...current];
    });
  };

  const askAI = async () => {
    setAiLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiWorkout({});
      setAi(res.data);
      upsertWorkoutPlan(res.data?.workoutPlan);
    } catch (err) {
      setAi(isDemo() ? mockAIResponse : {
        summary: apiErrorMessage(err, "AI workout suggestion failed. Check LLAMA_BASE_URL, LLAMA_MODEL, LLAMA_API_KEY, and backend logs."),
        recommendations: [],
        tasks: [],
        insights: ["This is a real API error, not demo data."],
      });
    } finally {
      setAiLoading(false);
    }
  };

  const saveSession = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createWorkoutSession(form);
      setSessions((s) => [res.data, ...s]);
      setShowLog(false);
    } catch (err) {
      alert(apiErrorMessage(err, "Workout session could not be saved."));
    }
  };

  const logSelectedPlan = (workout) => {
    const details = getWorkoutDetails(workout);
    setForm({
      workoutPlanId: typeof workout.id === "number" ? workout.id : undefined,
      workoutTitle: workout.title || "",
      startedAt: new Date().toISOString().slice(0, 16),
      durationMinutes: workout.duration || 30,
      caloriesBurned: details.calories,
      notes: `${details.focus} Exercises: ${details.exercises.map((e) => e.name).join(", ")}.`,
    });
    setSelectedPlan(null);
    setShowLog(true);
  };

  const selectedDetails = selectedPlan ? getWorkoutDetails(selectedPlan) : null;

  return (
    <div className="grid-stack">
      <section className="card daily-track-card">
        <header className="card-head">
          <div>
            <h3>Today&apos;s workout track</h3>
            <p className="muted">Resets each day and fills as you log sessions.</p>
          </div>
        </header>
        <div className="grid-3 today-stats fitness-today-stats">
          <StatCard icon={Activity} label="Today sessions" value={todayStats.sessions} accent="green" hint="Resets at midnight" />
          <StatCard icon={Clock} label="Today minutes" value={todayStats.minutes} accent="blue" hint="Today's training time" />
          <StatCard icon={Flame} label="Today calories" value={todayStats.cals} accent="green" hint="Today's burn" />
        </div>
      </section>

      <section className="card all-time-panel">
        <header className="card-head">
          <div>
            <h3>All-time fitness</h3>
            <p className="muted">Your full training history, kept secondary to today.</p>
          </div>
        </header>
        <div className="grid-4 all-time-stats fitness-all-stats">
          <StatCard icon={Dumbbell} label="Workout plans" value={stats.plans} accent="blue" hint="Available library" />
          <StatCard icon={Activity} label="All sessions" value={stats.sessions} accent="green" hint="Every logged session" />
          <StatCard icon={Clock} label="All minutes" value={stats.minutes} accent="blue" hint="Total training time" />
          <StatCard icon={Flame} label="All calories" value={stats.cals} accent="green" hint="Estimated total burn" />
        </div>
      </section>

      <section className="card row-between">
        <div>
          <h3 style={{ margin: 0 }}>AI workout suggestion</h3>
          <p className="muted" style={{ margin: "4px 0 0" }}>Personalized for your recent activity</p>
        </div>
        <div className="row gap">
          <button className="btn btn-ai" onClick={askAI} disabled={aiLoading}>
            <Sparkles size={14} /> {aiLoading ? "Generating..." : "AI Workout"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowLog(true)}>
            <Plus size={14} /> Log session
          </button>
        </div>
      </section>

      {ai && <AIOutputCard data={ai} title="AI Workout Suggestion" simple />}

      <section className="card workout-plan-section">
        <header className="card-head">
          <div>
            <h3>Choose a workout plan</h3>
            <p className="muted">Click a plan to view exercises, then log it as today&apos;s session.</p>
          </div>
        </header>
        <form className="filter-bar" onSubmit={applyWorkoutFilters} style={{ marginBottom: "1rem" }}>
          <label className="filter-search">
            <Search size={15} />
            <input
              value={workoutFilters.query}
              onChange={(e) => setWorkoutFilters({ ...workoutFilters, query: e.target.value })}
              placeholder="Search workout plans…"
            />
          </label>
          <label className="filter-select">
            <select value={workoutFilters.difficulty} onChange={(e) => setWorkoutFilters({ ...workoutFilters, difficulty: e.target.value })}>
              <option value="">All difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit" disabled={workoutFiltering}>
            <Search size={14} /> {workoutFiltering ? "Searching…" : "Search"}
          </button>
          {filteredWorkouts !== null && (
            <button className="btn btn-ghost" type="button" onClick={resetWorkoutFilters}>Clear</button>
          )}
        </form>
        {workoutFilterError && <div className="filter-error" style={{ marginBottom: "0.5rem" }}>{workoutFilterError}</div>}
        {filteredWorkouts !== null && (
          <p className="muted" style={{ marginBottom: "0.75rem" }}>
            {filteredWorkouts.length} result{filteredWorkouts.length !== 1 ? "s" : ""} found
          </p>
        )}
        <div className="grid-3">
          {(filteredWorkouts ?? displayWorkouts).map((w) => (
            <WorkoutPlanCard key={w.id} workout={w} onSelect={() => setSelectedPlan(w)} />
          ))}
        </div>
      </section>

      <section className="card workout-session-section">
        <header className="card-head">
          <div>
            <h3>Workout sessions</h3>
            <p className="muted">Recent movement logs, shown like a training timeline.</p>
          </div>
        </header>
        {sessions.length === 0 ? <div className="empty">No sessions logged.</div> : (
          <div className="session-card-list">
            {sessions.map((s, index) => {
              const date = formatSessionDate(s.startedAt);
              const title = s.workoutTitle || s.title || "Movement session";
              return (
                <article key={s.id} className="session-card">
                  <div className="session-date-tile">
                    <span>{date.weekday}</span>
                    <strong>{date.day}</strong>
                    <small>{date.month}</small>
                  </div>
                  <div className="session-main">
                    <div className="session-title-row">
                      <div>
                        <strong>{title}</strong>
                        <p><CalendarDays size={13} /> {date.label}{date.time ? ` • ${date.time}` : ""}</p>
                      </div>
                      <span className="session-number">#{sessions.length - index}</span>
                    </div>
                    <div className="session-metrics">
                      <span><Clock size={14} /> {s.durationMinutes || 0} min</span>
                      <span><Flame size={14} /> {s.caloriesBurned || 0} cal</span>
                    </div>
                    {s.notes && <p className="session-note">{s.notes}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedPlan && selectedDetails && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal workout-detail-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Workout plan</span>
                <h3>{selectedPlan.title}</h3>
                <p className="muted">{selectedDetails.focus}</p>
              </div>
              <button className="btn-icon" type="button" onClick={() => setSelectedPlan(null)} aria-label="Close">
                <X size={16} />
              </button>
            </header>

            <div className="workout-detail-grid">
              <div className="workout-detail-metric">
                <Clock size={16} />
                <span>Duration</span>
                <strong>{selectedPlan.duration || 30} min</strong>
              </div>
              <div className="workout-detail-metric">
                <Flame size={16} />
                <span>Estimated burn</span>
                <strong>{selectedDetails.calories} cal</strong>
              </div>
              <div className="workout-detail-metric">
                <Activity size={16} />
                <span>Intensity</span>
                <strong>{selectedDetails.intensity}</strong>
              </div>
            </div>

            <div className="workout-flow">
              <div>
                <span className="flow-label">Warm up</span>
                <p>{selectedDetails.warmup}</p>
              </div>
              <div>
                <span className="flow-label">Cool down</span>
                <p>{selectedDetails.cooldown}</p>
              </div>
            </div>

            <div className="exercise-list">
              {selectedDetails.exercises.map((exercise, index) => (
                <div key={`${exercise.name}-${index}`} className="exercise-row">
                  <span>{index + 1}</span>
                  <div>
                    <strong>{exercise.name}</strong>
                    <p>{exercise.work}</p>
                  </div>
                  <em>{exercise.note}</em>
                </div>
              ))}
            </div>

            <button className="btn btn-primary workout-log-plan" type="button" onClick={() => logSelectedPlan(selectedPlan)}>
              <CheckCircle2 size={15} /> Log this plan as a session
            </button>
          </div>
        </div>
      )}

      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal workout-log-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <h3>Log workout session</h3>
                <p className="muted">If you selected a plan, these fields are already prepared for you.</p>
              </div>
              <button className="btn-icon" type="button" onClick={() => setShowLog(false)} aria-label="Close">
                <X size={16} />
              </button>
            </header>
            <form className="form" onSubmit={saveSession}>
              <div className="task-modal-suggestions">
                <span>Quick picks</span>
                <div className="chips">
                  {SESSION_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="chip"
                      type="button"
                      onClick={() => logSelectedPlan(suggestion)}
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
              <label>Workout name<input value={form.workoutTitle} onChange={(e) => setForm({ ...form, workoutTitle: e.target.value })} /></label>
              <label>Started at<input type="datetime-local" value={form.startedAt} onChange={(e) => setForm({ ...form, startedAt: e.target.value })} /></label>
              <div className="grid-2">
                <label>Duration (min)<input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} /></label>
                <label>Calories<input type="number" value={form.caloriesBurned} onChange={(e) => setForm({ ...form, caloriesBurned: +e.target.value })} /></label>
              </div>
              <label>Notes<textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
              <div className="row gap">
                <button className="btn btn-primary" type="submit">Save Session</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowLog(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutPlanCard({ workout, onSelect }) {
  const recommendations = aiItems(workout.description, "recommendations");
  const tasks = aiItems(workout.description, "tasks");
  const cleanDescription = readableAiText(workout.description);

  return (
    <button className="mini-card workout-plan-card workout-ai-plan-card" type="button" onClick={onSelect}>
      <div className="mini-icon"><Dumbbell size={18} /></div>
      <strong>{workout.title}</strong>
      <p className="muted">{cleanDescription}</p>
      {(recommendations.length > 0 || tasks.length > 0) && (
        <div className="workout-ai-points">
          {recommendations.map((item, index) => <span key={`rec-${index}`}>{item}</span>)}
          {tasks.map((item, index) => <span key={`task-${index}`}>{item}</span>)}
        </div>
      )}
      <div className="row gap">
        {workout.difficulty && <span className="badge">{workout.difficulty}</span>}
        {workout.duration && <span className="badge badge-soft">{workout.duration} min</span>}
      </div>
      <span className="plan-action"><PlayCircle size={14} /> View exercises</span>
    </button>
  );
}
