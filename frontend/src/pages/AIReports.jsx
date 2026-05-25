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
  X,
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

function activityAnalysis(item) {
  const type = readableType(item.requestType);
  const preview = item.preview || "";
  const lower = String(item.requestType || "").toLowerCase();

  if (item.errorMessage) {
    return {
      summary: `${type} tried to run but did not complete successfully.`,
      meaning: item.errorMessage,
      next: "Check the AI provider settings or backend logs, then run the action again.",
    };
  }

  if (lower.includes("mood")) {
    return {
      summary: preview || "The assistant reviewed your mood and stress signals.",
      meaning: "This is meant to connect your logged mood, stress level, and notes into a pattern you can act on.",
      next: "Use the next check-in to add what triggered the mood, not just the score.",
    };
  }

  if (lower.includes("workout")) {
    return {
      summary: preview || "The assistant generated a workout direction from your recent activity.",
      meaning: "This action is useful when your movement history needs a clear next session instead of another generic plan.",
      next: "Open Fitness, log the session after you do it, and the next suggestion will be sharper.",
    };
  }

  if (lower.includes("nutrition") || lower.includes("food")) {
    return {
      summary: preview || "The assistant looked at food and energy signals.",
      meaning: "The goal is to turn meal logs into a practical nutrition recommendation.",
      next: "Add calories and protein for the next meal so the analysis can compare targets with reality.",
    };
  }

  if (lower.includes("daily") || lower.includes("plan")) {
    return {
      summary: preview || "The assistant built a day plan from your current tasks and goals.",
      meaning: "This should help separate what matters today from the full backlog.",
      next: "Keep one or two high-impact tasks in the plan and move the rest to later days.",
    };
  }

  return {
    summary: preview || `${type} was recorded in your assistant history.`,
    meaning: "This activity represents an AI pass over your current goals, tasks, wellbeing, fitness, or nutrition data.",
    next: "Generate a weekly report if you want this action connected to a fuller progress story.",
  };
}

function parseReport(report) {
  if (!report) return null;
  let content = {};
  const raw = report.contentJson || report.output;
  if (raw && typeof raw === "string") {
    try {
      content = JSON.parse(raw);
    } catch {
      content = { summary: raw };
    }
  }
  return {
    ...report,
    ...content,
    summary: report.summary || content.summary || "",
    recommendations: report.recommendations || content.recommendations || content.suggestions || [],
    tasks: report.tasks || content.tasks || content.suggestedTasks || [],
    insights: report.insights || content.insights || content.analysis || [],
  };
}

function chatSummary(data) {
  const parsed = parseReport(data) || {};
  return parsed.summary || parsed.message || parsed.text || "I am here. Ask me about your goals, tasks, workouts, food, mood, or stress.";
}

function isSmallTalk(text) {
  return /^(hi|hello|hey|yo|sup|pershendetje|p[e\u00EB]rsh[e\u00EB]ndetje|tung|ckemi|\u00E7kemi|qkemi|hey there)[!. ]*$/i.test(String(text || "").trim());
}

function isHardMoment(text) {
  return /\b(not feeling good|feel bad|feeling bad|sad|upset|down|anxious|anxiety|stressed|stress|overwhelmed|tired|exhausted|lonely|angry|panic|scared|afraid|nervous|depressed)\b/i.test(String(text || ""));
}

function casualChatReply(text) {
  if (isSmallTalk(text)) {
    return "Hi. I'm here. We can talk normally, or you can ask me about your goals, tasks, mood, food, or workouts whenever you want.";
  }
  if (isHardMoment(text)) {
    return "I'm sorry you're feeling like this. You don't have to turn it into a plan right away. Take one slow breath, unclench your shoulders if you can, and tell me what feels heaviest right now: your body, your thoughts, or something that happened today?";
  }
  return "I'm with you. Tell me a bit more, and I'll follow your lead.";
}

function ChatAnswer({ data }) {
  return (
    <div className="focus-answer-card">
      <span>Focus assistant</span>
      <p>{chatSummary(data)}</p>
    </div>
  );
}

function ReportCard({ report, featured = false, onOpen }) {
  const parsed = parseReport(report) || report;
  const recommendations = toList(parsed.recommendations).slice(0, 4);
  const tasks = toList(parsed.tasks).slice(0, 4);
  const insights = toList(parsed.insights).slice(0, 4);
  const start = formatDate(report.periodStart, "Start");
  const end = formatDate(report.periodEnd, "Today");

  return (
    <button className={`report-modern-card ${featured ? "featured" : ""}`} type="button" onClick={() => onOpen?.(parsed)}>
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

      <p className="report-summary">{parsed.summary || "No summary available yet."}</p>

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
    </button>
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
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    api.getAIReports().then((d) => setReports(d || []));
    api.getAIHistory().then((d) => setHistory(d || []));
  }, []);

  const parsedReports = useMemo(() => reports.map(parseReport).filter(Boolean), [reports]);
  const latestReport = useMemo(() => parsedReports[0] || null, [parsedReports]);
  const totalActionItems = latestReport
    ? toList(latestReport.tasks).length + toList(latestReport.recommendations).length
    : 0;
  const generatedReport = weekly?.report ? parseReport(weekly.report) : null;
  const visibleReport = latestReport || emptyReport;

  const openActivity = (item) => {
    if (String(item.requestType || "").toLowerCase().includes("weekly") && latestReport) {
      setSelectedReport(latestReport);
      return;
    }
    setSelectedActivity(item);
  };

  const addChatPair = (question, answer) => {
    setChatMessages((messages) => [
      ...messages,
      { role: "user", text: question },
      { role: "assistant", data: answer },
    ]);
  };

  const send = async (text) => {
    const q = text || chat;
    if (!q.trim()) return;
    setChat("");
    if (isSmallTalk(q)) {
      addChatPair(q, { summary: casualChatReply(q) });
      return;
    }
    setChatLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiChat({ message: q });
      setChatResp(res.data);
      addChatPair(q, res.data);
    } catch (err) {
      const fallback = isDemo() ? { summary: casualChatReply(q), recommendations: [], tasks: [], insights: [] } : {
        summary: apiErrorMessage(err, "AI assistant request failed. Check LLAMA_BASE_URL, LLAMA_MODEL, LLAMA_API_KEY, and backend logs."),
        recommendations: [],
        tasks: [],
        insights: ["This is a real API error, not demo data."],
      };
      setChatResp(fallback);
      addChatPair(q, fallback);
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
      if (res.data?.report) {
        setReports((current) => {
          const exists = current.some((report) => report.id === res.data.report.id);
          return exists
            ? current.map((report) => (report.id === res.data.report.id ? res.data.report : report))
            : [res.data.report, ...current];
        });
      }
    } catch (err) {
      setWeekly(isDemo() ? {
        ...mockAIResponse,
        summary: "This week you completed 14 tasks, averaged a mood score of 6.5, and logged 3 workouts.",
      } : {
        summary: apiErrorMessage(err, "AI weekly report failed. Check LLAMA_BASE_URL, LLAMA_MODEL, LLAMA_API_KEY, and backend logs."),
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
      <section className="reports-chat-card card">
        <div className="report-panel-head">
          <div>
            <span className="eyebrow"><MessageCircle size={14} /> Focused assistant</span>
            <h3>Ask something useful about your week</h3>
          </div>
        </div>
        <div className="chat-thread">
          {chatMessages.length === 0 ? (
            <div className="chat-empty">Ask a question and the assistant will answer directly.</div>
          ) : (
            chatMessages.map((message, index) => (
              <div key={index} className={`chat-bubble ${message.role}`}>
                {message.role === "user" ? <div className="chat-message-text">{message.text}</div> : <ChatAnswer data={message.data} />}
              </div>
            ))
          )}
        </div>
        <div className="report-chat-box">
          <input
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything about your week..."
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
      </section>

      <section className="weekly-review-row">
        <div className="card weekly-command-card">
          <span className="eyebrow"><CalendarDays size={14} /> Weekly review</span>
          <h3>Build one readable report from your goals, tasks, mood, food and workouts.</h3>
          <div className="weekly-mini-grid">
            <div><strong>{reports.length}</strong><span>saved reports</span></div>
            <div><strong>{history.length}</strong><span>AI actions</span></div>
            <div><strong>{totalActionItems}</strong><span>next moves</span></div>
          </div>
          <button className="btn btn-ai" onClick={generateWeekly} disabled={weeklyLoading}>
            <Sparkles size={14} /> {weeklyLoading ? "Generating..." : "Generate report"}
          </button>
        </div>
        <div className="weekly-generated-slot">
          {generatedReport ? (
            <ReportCard report={generatedReport} featured onOpen={setSelectedReport} />
          ) : weekly ? (
            <AIOutputCard data={weekly} title="Generated weekly report" />
          ) : (
            <div className="empty">Generated report will appear here.</div>
          )}
        </div>
      </section>

      <section className="card reports-library-card">
        <header className="report-panel-head row-between">
          <div>
            <span className="eyebrow"><FileText size={14} /> Reports library</span>
            <h3>Your latest insight cards</h3>
            <p>Readable summaries with actions and patterns in clean cards.</p>
          </div>
        </header>

        <div className="report-showcase-grid single">
          <ReportCard report={visibleReport} featured onOpen={setSelectedReport} />
        </div>
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
              <button key={item.id || `${item.requestType}-${item.createdAt}`} className="ai-activity-item" type="button" onClick={() => openActivity(item)}>
                <div className="activity-icon"><Sparkles size={14} /></div>
                <div>
                  <strong>{readableType(item.requestType)}</strong>
                  {item.preview && <p>{item.preview}</p>}
                </div>
                <time>{formatLongDate(item.createdAt)}</time>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal report-detail-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">{readableType(selectedReport.reportType)} report</span>
                <h3>{selectedReport.summary ? "Report details" : "Empty report"}</h3>
              </div>
              <button className="btn-icon" type="button" onClick={() => setSelectedReport(null)} aria-label="Close">
                <X size={16} />
              </button>
            </header>
            <AIOutputCard data={selectedReport} title="Report" />
          </div>
        </div>
      )}

      {selectedActivity && (
        <div className="modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="modal report-detail-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">AI activity</span>
                <h3>{readableType(selectedActivity.requestType)}</h3>
              </div>
              <button className="btn-icon" type="button" onClick={() => setSelectedActivity(null)} aria-label="Close">
                <X size={16} />
              </button>
            </header>
            {(() => {
              const analysis = activityAnalysis(selectedActivity);
              return (
                <div className="activity-analysis-grid">
                  <div className="activity-analysis-card primary">
                    <span>Analysis</span>
                    <p>{analysis.summary}</p>
                  </div>
                  <div className="activity-analysis-card">
                    <span>What it means</span>
                    <p>{analysis.meaning}</p>
                  </div>
                  <div className="activity-analysis-card">
                    <span>Next useful move</span>
                    <p>{analysis.next}</p>
                  </div>
                </div>
              );
            })()}
            <div className="activity-detail">
              <span>Recorded {formatLongDate(selectedActivity.createdAt)}</span>
              {selectedActivity.errorMessage && <p>{selectedActivity.errorMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
