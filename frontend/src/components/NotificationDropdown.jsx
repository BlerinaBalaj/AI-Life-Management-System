import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import { api } from "../api/client.js";

function getNotificationTarget(notification) {
  if (notification.url) return notification.url;

  const text = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();
  if (text.includes("weekly") || text.includes("report") || text.includes("ai")) return "/reports";
  if (text.includes("task") || text.includes("due")) return "/planner";
  if (text.includes("goal") || text.includes("milestone")) return "/dashboard";
  if (text.includes("mood") || text.includes("stress")) return "/mood";
  if (text.includes("workout") || text.includes("fitness")) return "/fitness";
  if (text.includes("meal") || text.includes("nutrition")) return "/nutrition";
  return "/dashboard";
}

function getNotificationActionLabel(target) {
  const labels = {
    "/dashboard": "Open dashboard",
    "/planner": "Open planner",
    "/reports": "Open reports",
    "/mood": "Open mood",
    "/fitness": "Open fitness",
    "/nutrition": "Open nutrition",
  };
  return labels[target] || "Open";
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    async function load() {
      const notifications = await api.getNotifications();
      if (notifications && notifications.length > 0) {
        setItems(notifications);
        setHasUnread(notifications.some((item) => !item.read));
        return;
      }

      const [tasks, plans, sessions, moods] = await Promise.all([
        api.getTasks(),
        api.getDailyPlans(),
        api.getWorkoutSessions(),
        api.getMoodLogs(),
      ]);
      const generated = buildUserUpdates(tasks || [], plans || [], sessions || [], moods || []);
      setItems(generated);
      setHasUnread(generated.length > 0);
    }
    load();
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="notif" ref={ref}>
      <button
        className="bell-btn"
        aria-label="Open notifications"
        onClick={() => {
          setOpen((o) => !o);
          setHasUnread(false);
        }}
      >
        <Bell size={18} />
        {hasUnread && <span className="bell-dot" />}
      </button>
      {open && (
        <div className="notif-pop">
          <div className="notif-head">
            <span>Notifications</span>
            <small>{items.length ? `${items.length} updates` : "No updates"}</small>
          </div>
          {items.length === 0 ? (
            <div className="notif-empty">You're all caught up.</div>
          ) : (
            <ul className="notif-list">
              {items.map((n) => {
                const target = getNotificationTarget(n);
                return (
                  <li key={n.id}>
                    <Link
                      className="notif-link"
                      to={target}
                      onClick={() => setOpen(false)}
                      aria-label={`${getNotificationActionLabel(target)}: ${n.title}`}
                    >
                      <span className="notif-mark" />
                      <div>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.message}</div>
                        <div className="notif-foot">
                          <span className="notif-time">{n.time}</span>
                          <span className="notif-action">
                            {getNotificationActionLabel(target)}
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function buildUserUpdates(tasks, plans, sessions, moods) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todoToday = tasks.filter((task) => task.status !== "DONE" && task.dueDate === todayKey);
  const updates = [];

  if (todoToday.length > 0) {
    updates.push({
      id: "today-tasks",
      title: `${todoToday.length} task${todoToday.length === 1 ? "" : "s"} due today`,
      message: todoToday.slice(0, 2).map((task) => task.title).join(", "),
      time: "Today",
      url: "/planner",
      read: false,
    });
  }

  if (plans.length > 0) {
    updates.push({
      id: "latest-plan",
      title: "Latest daily plan ready",
      message: plans[0].title || "Review your most recent plan.",
      time: "Planner",
      url: "/planner",
      read: false,
    });
  }

  if (sessions.length > 0) {
    updates.push({
      id: "movement-summary",
      title: `${sessions.length} workout session${sessions.length === 1 ? "" : "s"} logged`,
      message: "Open fitness to review your recent movement history.",
      time: "Fitness",
      url: "/fitness",
      read: false,
    });
  }

  if (moods.length > 0) {
    updates.push({
      id: "mood-summary",
      title: "Mood history updated",
      message: `${moods.length} mood log${moods.length === 1 ? "" : "s"} available for patterns.`,
      time: "Mood",
      url: "/mood",
      read: false,
    });
  }

  if (updates.length === 0) {
    updates.push({
      id: "start-tracking",
      title: "Start your first daily signal",
      message: "Add a task, log mood, or create a plan to build your dashboard.",
      time: "Now",
      url: "/planner",
      read: false,
    });
  }

  return updates.slice(0, 4);
}
