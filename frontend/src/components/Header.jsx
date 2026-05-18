import { useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown.jsx";

const titles = {
  "/": ["Home", "What LifeOS helps you improve"],
  "/home": ["Home", "What LifeOS helps you improve"],
  "/dashboard": ["Dashboard", "Your day at a glance"],
  "/planner": ["Daily Planner", "Plan and organize your tasks"],
  "/daily-planner": ["Daily Planner", "Plan and organize your tasks"],
  "/fitness": ["Fitness Tracker", "Workouts and sessions"],
  "/nutrition": ["Nutrition Tracker", "Meals and macronutrients"],
  "/mood": ["Mood & Stress", "Wellbeing journal"],
  "/reports": ["AI Reports", "Insights and weekly review"],
};

export default function Header() {
  const { pathname } = useLocation();
  const [title, subtitle] = titles[pathname] || ["LifeOS", ""];

  return (
    <header className="header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{subtitle}</p>
      </div>
      <div className="header-right">
        <NotificationDropdown />
      </div>
    </header>
  );
}
