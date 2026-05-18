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
    api.getNotifications().then((d) => {
      const data = d || [];
      setItems(data);
      setHasUnread(data.length > 0);
    });
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
