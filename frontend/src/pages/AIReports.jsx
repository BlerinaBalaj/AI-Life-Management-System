import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import AIOutputCard from "../components/AIOutputCard.jsx";
import { api, apiErrorMessage, isDemo } from "../api/client.js";
import { mockAIResponse } from "../api/mockData.js";

const PROMPTS = [
  "Summarize my progress this week",
  "Suggest 3 priorities for tomorrow",
  "How is my mood trending?",
  "Recommend a workout for today",
];

const emptyReport = {
  reportType: "Weekly",
  summary:
    "Generate your first weekly insight to see progress, recommendations, suggested actions and patterns in one place.",
  recommendations: ["Review your goals", "Log today's mood", "Add one recovery activity"],
  tasks: ["Plan tomorrow", "Choose one workout", "Prepare one balanced meal"],
  insights: ["Your reports become richer as you log more daily data."],
};

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return [value];
  return [String(value)];
}

function readableType(type) {
  return String(type || "Weekly")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value, fallback = "") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatLongDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportCard({ report, featured = false }) {
  const recommendations = toList(report.recommendations).slice(0, 4);
  const tasks = toList(report.tasks).slice(0, 4);
  const insights = toList(report.insights).slice(0, 4);
  const start = formatDate(report.periodStart, "Start");
  const end = formatDate(report.periodEnd, "Today");

  return (
    <article className={`report-modern-card ${featured ? "featured" : ""}`}>
      <div className="report-modern-top">
        <div>
          <span className="report-type-pill">{readableType(report.reportType)}</span>
          <h3>{featured ? "Latest weekly story" : `${readableType(report.reportType)} report`}</h3>
        </div>
        <div className="report-period">
          <CalendarDays size={15} />
          <span>{start} - {end}</span>
        </div>
      </div>

      <p className="report-summary">{report.summary || "No summary available yet."}</p>

      <div className="report-bucket-grid">
        <div className="report-bucket recs">
          <div className="bucket-title"><Lightbulb size={14} /> Recommendations</div>
          {recommendations.length === 0 ? (
            <p className="muted">No recommendations yet.</p>
          ) : (
            recommendations.map((item, index) => <span key={index}>{item}</span>)
          )}
        </div>
        <div className="report-bucket tasks">
          <div className="bucket-title"><CheckCircle2 size={14} /> Next actions</div>
          {tasks.length === 0 ? (
            <p className="muted">No tasks yet.</p>
          ) : (
            tasks.map((item, index) => <span key={index}>{item}</span>)
          )}
        </div>
        <div className="report-bucket insights">
          <div className="bucket-title"><Brain size={14} /> Patterns</div>
          {insights.length === 0 ? (
            <p className="muted">No patterns yet.</p>
          ) : (
            insights.map((item, index) => <span key={index}>{item}</span>)
          )}
        </div>
      </div>
    </article>
  );
}

export default function AIReports() {
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [chat, setChat] = useState("");
  const [chatResp, setChatResp] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [weekly, setWeekly] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  useEffect(() => {
    api.getAIReports().then((d) => setReports(d || []));
    api.getAIHistory().then((d) => setHistory(d || []));
  }, []);

  const latestReport = useMemo(() => reports[0] || emptyReport, [reports]);
  const totalActionItems = toList(latestReport.tasks).length + toList(latestReport.recommendations).length;

  const send = async (text) => {
    const q = text || chat;
    if (!q.trim()) return;
    setChat("");
    setChatLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiChat({ message: q });
      setChatResp(res.data);
    } catch (err) {
      setChatResp(isDemo() ? { ...mockAIResponse, summary: `On "${q}": ${mockAIResponse.summary}` } : {
        summary: apiErrorMessage(err, "AI assistant request failed. Check OPENAI_API_KEY and backend logs."),
        recommendations: [],
        tasks: [],
        insights: ["This is a real API error, not demo data."],
      });
    } finally {
      setChatLoading(false);
    }
  };

  const generateWeekly = async () => {
    setWeeklyLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiWeeklyReport({});
      setWeekly(res.data);
    } catch (err) {
      setWeekly(isDemo() ? {
        ...mockAIResponse,
        summary: "This week you completed 14 tasks, averaged a mood score of 6.5, and logged 3 workouts.",
      } : {
        summary: apiErrorMessage(err, "AI weekly report failed. Check OPENAI_API_KEY and backend logs."),
        recommendations: [],
        tasks: [],
        insights: ["This is a real API error, not demo data."],
      });
    } finally {
      setWeeklyLoading(false);
    }
  };

  return (
    <div className="grid-stack reports-page">
      <section className="reports-command-grid">
        <div className="card reports-command-card">
          <div className="report-panel-head">
            <div>
              <span className="eyebrow"><MessageCircle size={14} /> Focused assistant</span>
              <h3>Ask something useful about your week</h3>
              <p>Use it for progress, planning, workouts, mood trends or nutrition choices.</p>
            </div>
          </div>
          <div className="report-chat-box">
            <input
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Example: What should I improve tomorrow?"
            />
            <button className="btn btn-primary" onClick={() => send()} disabled={chatLoading}>
              <Send size={14} /> {chatLoading ? "Sending..." : "Send"}
            </button>
          </div>
          <div className="prompt-grid">
            {PROMPTS.map((p) => (
              <button key={p} className="prompt-chip" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="card weekly-command-card">
          <span className="eyebrow"><CalendarDays size={14} /> Weekly review</span>
          <h3>Build one readable report from your goals, tasks, mood, food and workouts.</h3>
          <div className="weekly-mini-grid">
            <div><strong>{reports.length || 1}</strong><span>saved reports</span></div>
            <div><strong>{history.length || 3}</strong><span>AI actions</span></div>
            <div><strong>{totalActionItems || 6}</strong><span>next moves</span></div>
          </div>
          <button className="btn btn-ai" onClick={generateWeekly} disabled={weeklyLoading}>
            <Sparkles size={14} /> {weeklyLoading ? "Generating..." : "Generate report"}
          </button>
        </div>
      </section>

      {(chatResp || weekly) && (
        <section className="reports-generated-grid">
          {chatResp && <AIOutputCard data={chatResp} title="Assistant response" />}
          {weekly && <AIOutputCard data={weekly} title="Generated weekly report" />}
        </section>
      )}

      <section className="card reports-library-card">
        <header className="report-panel-head row-between">
          <div>
            <span className="eyebrow"><FileText size={14} /> Reports library</span>
            <h3>Your latest insight cards</h3>
            <p>Readable summaries with actions and patterns in clean cards.</p>
          </div>
        </header>

        {reports.length === 0 ? (
          <ReportCard report={emptyReport} featured />
        ) : (
          <div className="report-showcase-grid">
            {reports.map((report, index) => (
              <ReportCard key={report.id || index} report={report} featured={index === 0} />
            ))}
          </div>
        )}
      </section>

      <section className="card ai-activity-card">
        <header className="report-panel-head row-between">
          <div>
            <span className="eyebrow"><History size={14} /> Recent activity</span>
            <h3>What the assistant has worked on</h3>
          </div>
        </header>
        {history.length === 0 ? (
          <div className="empty">No AI history yet.</div>
        ) : (
          <div className="ai-activity-timeline">
            {history.map((item) => (
              <article key={item.id || `${item.requestType}-${item.createdAt}`} className="ai-activity-item">
                <div className="activity-icon"><Sparkles size={14} /></div>
                <div>
                  <strong>{readableType(item.requestType)}</strong>
                  {item.preview && <p>{item.preview}</p>}
                </div>
                <time>{formatLongDate(item.createdAt)}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
