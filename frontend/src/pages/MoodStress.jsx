import { useEffect, useMemo, useState } from "react";
import { Activity, Brain, CalendarDays, HeartPulse, Smile, Sparkles, Wind } from "lucide-react";
import AIOutputCard from "../components/AIOutputCard.jsx";
import { api, apiErrorMessage, isDemo } from "../api/client.js";
import { mockAIResponse } from "../api/mockData.js";

const MOOD_LABELS = ["great", "steady", "tired", "sad", "anxious"];
const MOOD_COLORS = {
  great: "#10b981",
  steady: "#3b82f6",
  tired: "#f59e0b",
  sad: "#6366f1",
  anxious: "#ef4444",
};

const rangeFill = (value) => `${((Number(value) - 1) / 9) * 100}%`;

function stressState(level) {
  const score = Number(level) || 0;
  if (score <= 2) return { label: "calm", color: "#10b981" };
  if (score <= 4) return { label: "light", color: "#84cc16" };
  if (score <= 6) return { label: "pressured", color: "#f59e0b" };
  if (score <= 8) return { label: "tense", color: "#f97316" };
  return { label: "overwhelmed", color: "#ef4444" };
}

function moodCopy(score) {
  if (score >= 8) return "High energy";
  if (score >= 6) return "Steady";
  if (score >= 4) return "Needs care";
  return "Low mood";
}

function stressCopy(level) {
  if (level <= 3) return "Light load";
  if (level <= 6) return "Manageable";
  if (level <= 8) return "Heavy";
  return "High pressure";
}

function formatLogDate(value) {
  if (!value) return { label: "No date", weekday: "--", day: "--", month: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: "No date", weekday: "--", day: "--", month: "" };

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
  };
}

export default function MoodStress() {
  const [moods, setMoods] = useState([]);
  const [stress, setStress] = useState([]);
  const [ai, setAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [moodForm, setMoodForm] = useState({ moodScore: 7, moodLabel: "steady", journalText: "" });
  const [stressForm, setStressForm] = useState({ stressLevel: 4, trigger: "", copingAction: "" });

  useEffect(() => {
    api.getMoodLogs().then((d) => setMoods(d || []));
    api.getStressLogs().then((d) => setStress(d || []));
  }, []);

  const avgMood = useMemo(
    () => (moods.length ? (moods.reduce((a, m) => a + (m.moodScore || 0), 0) / moods.length).toFixed(1) : "-"),
    [moods]
  );
  const avgStress = useMemo(
    () => (stress.length ? (stress.reduce((a, s) => a + (s.stressLevel || 0), 0) / stress.length).toFixed(1) : "-"),
    [stress]
  );

  const saveMood = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMoodLog({ ...moodForm, loggedAt: new Date().toISOString().slice(0, 16) });
      setMoods((m) => [res.data, ...m]);
      setMoodForm({ ...moodForm, journalText: "" });
    } catch (err) {
      alert(apiErrorMessage(err, "Mood log could not be saved."));
    }
  };

  const saveStress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createStressLog({ ...stressForm, loggedAt: new Date().toISOString().slice(0, 16) });
      setStress((s) => [res.data, ...s]);
      setStressForm({ ...stressForm, trigger: "", copingAction: "" });
    } catch (err) {
      alert(apiErrorMessage(err, "Stress log could not be saved."));
    }
  };

  const analyzeMood = async () => {
    setAiLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiMood({ logs: moods });
      setAi(res.data);
    } catch (err) {
      setAi(isDemo() ? mockAIResponse : {
        summary: apiErrorMessage(err, "AI mood analysis failed. Check LLAMA_BASE_URL, LLAMA_MODEL, LLAMA_API_KEY, and backend logs."),
        recommendations: [],
        tasks: [],
        insights: ["This is a real API error, not demo data."],
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid-stack wellbeing-page">
      <section className="card wellbeing-hero">
        <div className="wellbeing-hero-copy">
          <span className="eyebrow">Wellbeing check-in</span>
          <h2>Track the signal, not just the bad days.</h2>
          <p>
            Log mood and stress in small notes. Over time the app can connect patterns between
            energy, pressure, habits and weekly progress.
          </p>
        </div>
        <div className="wellbeing-score-grid">
          <div className="wellbeing-score-card mood">
            <Smile size={18} />
            <span>Average mood</span>
            <strong>{avgMood}</strong>
            <small>{moods.length} mood logs</small>
          </div>
          <div className="wellbeing-score-card stress">
            <HeartPulse size={18} />
            <span>Average stress</span>
            <strong>{avgStress}</strong>
            <small>{stress.length} stress logs</small>
          </div>
        </div>
      </section>

      <div className="wellbeing-checkin-grid">
        <section className="card checkin-card mood-checkin">
          <header className="checkin-head">
            <div>
              <Smile size={18} />
              <span>Mood check-in</span>
              <h3>{moodCopy(moodForm.moodScore)}</h3>
            </div>
            <strong>{moodForm.moodScore}/10</strong>
          </header>
          <form className="form" onSubmit={saveMood}>
            <label className="range-label">
              <span>Mood score</span>
              <input
                className="smooth-range"
                type="range"
                min="1"
                max="10"
                value={moodForm.moodScore}
                style={{ "--range-value": rangeFill(moodForm.moodScore) }}
                onChange={(e) => setMoodForm({ ...moodForm, moodScore: +e.target.value })}
              />
            </label>
            <label>Mood label
              <select value={moodForm.moodLabel} onChange={(e) => setMoodForm({ ...moodForm, moodLabel: e.target.value })}>
                {MOOD_LABELS.map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>
            <label>Journal
              <textarea
                rows="2"
                value={moodForm.journalText}
                placeholder="One sentence about what affected your mood..."
                onChange={(e) => setMoodForm({ ...moodForm, journalText: e.target.value })}
              />
            </label>
            <div className="row gap">
              <button className="btn btn-primary">Log Mood</button>
              <button className="btn btn-ai" type="button" onClick={analyzeMood} disabled={aiLoading}>
                <Sparkles size={14} /> {aiLoading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </form>
        </section>

        <section className="card checkin-card stress-checkin">
          <header className="checkin-head">
            <div>
              <Wind size={18} />
              <span>Stress check-in</span>
              <h3>{stressCopy(stressForm.stressLevel)}</h3>
            </div>
            <strong>{stressForm.stressLevel}/10</strong>
          </header>
          <form className="form" onSubmit={saveStress}>
            <label className="range-label">
              <span>Stress level</span>
              <input
                className="smooth-range stress-range"
                type="range"
                min="1"
                max="10"
                value={stressForm.stressLevel}
                style={{ "--range-value": rangeFill(stressForm.stressLevel) }}
                onChange={(e) => setStressForm({ ...stressForm, stressLevel: +e.target.value })}
              />
            </label>
            <label>Trigger
              <input
                value={stressForm.trigger}
                placeholder="What caused the pressure?"
                onChange={(e) => setStressForm({ ...stressForm, trigger: e.target.value })}
              />
            </label>
            <label>Coping action
              <input
                value={stressForm.copingAction}
                placeholder="Walk, breathe, pause, message someone..."
                onChange={(e) => setStressForm({ ...stressForm, copingAction: e.target.value })}
              />
            </label>
            <button className="btn btn-primary">Log Stress</button>
          </form>
        </section>
      </div>

      {ai && <AIOutputCard data={ai} title="AI Mood Analysis" />}

      <div className="wellbeing-history-grid">
        <section className="card wellbeing-history-card">
          <header className="card-head">
            <h3><Brain size={16} /> Mood history</h3>
          </header>
          {moods.length === 0 ? <div className="empty">No mood logs yet.</div> : (
            <div className="wellbeing-log-stack">
              {moods.map((m) => {
                const date = formatLogDate(m.loggedAt || m.createdAt);
                return (
                  <article key={m.id} className="wellbeing-log-card">
                    <div className="log-date-tile">
                      <span>{date.weekday}</span>
                      <strong>{date.day}</strong>
                      <small>{date.month}</small>
                    </div>
                    <div>
                      <div className="log-topline">
                        <span
                          className="mood-pill"
                          style={{ "--mood-color": MOOD_COLORS[m.moodLabel] || "#3b82f6" }}
                        >
                          {m.moodLabel}
                        </span>
                        <b>{m.moodScore}/10</b>
                      </div>
                      <p>{m.journalText || "No journal note added."}</p>
                      <small><CalendarDays size={12} /> {date.label}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="card wellbeing-history-card">
          <header className="card-head">
            <h3><Activity size={16} /> Stress history</h3>
          </header>
          {stress.length === 0 ? <div className="empty">No stress logs yet.</div> : (
            <div className="wellbeing-log-stack">
              {stress.map((s) => {
                const date = formatLogDate(s.loggedAt || s.createdAt);
                const state = stressState(s.stressLevel);
                return (
                  <article key={s.id} className="wellbeing-log-card stress-log-card">
                    <div className="log-date-tile">
                      <span>{date.weekday}</span>
                      <strong>{date.day}</strong>
                      <small>{date.month}</small>
                    </div>
                    <div>
                      <div className="log-topline">
                        <span className="stress-pill" style={{ "--mood-color": state.color }}>
                          {state.label}
                        </span>
                        <b>{s.stressLevel}/10</b>
                      </div>
                      <p><strong>Trigger:</strong> {s.trigger || "No trigger added."}</p>
                      <p><strong>Coping:</strong> {s.copingAction || "No coping action added."}</p>
                      <small><CalendarDays size={12} /> {date.label}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
