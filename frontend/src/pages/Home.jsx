import { Link } from "react-router-dom";
import {
  Apple,
  ArrowRight,
  CalendarCheck,
  Dumbbell,
  HeartPulse,
  Sparkles,
} from "lucide-react";

const visualCards = [
  {
    icon: Dumbbell,
    label: "Fitness",
    title: "Move with purpose",
    text: "Track workouts, walks, stretching, calories and recovery notes in one place.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Apple,
    label: "Nutrition",
    title: "Fuel your energy",
    text: "Log meals, calories and macros, then notice what helps you feel steady.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: HeartPulse,
    label: "Mindfulness",
    title: "Reset before stress wins",
    text: "Capture mood, stress triggers and small recovery actions throughout the week.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80",
  },
];

const resetSteps = [
  "Name the feeling.",
  "Log one sentence.",
  "Choose one small next step.",
];

export default function Home() {
  return (
    <div className="home-page grid-stack">
      <section className="home-hero">
        <div className="home-copy">
          <span className="kicker"><Sparkles size={14} /> Personal operating system</span>
          <h2>A calmer way to manage your day.</h2>
          <p>
            LifeOS brings planning, movement, food, mood and stress into one smooth daily flow.
          </p>
          <div className="home-actions">
            <Link className="btn btn-primary" to="/dashboard">
              Open Dashboard <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-ghost" to="/planner">
              Plan Today
            </Link>
            <Link className="btn btn-ghost" to="/mood">
              Check Mood
            </Link>
          </div>
        </div>

        <div className="life-pulse-visual">
          <div className="pulse-disc" />
          <div className="pulse-center">
            <span>Today</span>
            <strong>Balanced day</strong>
            <p>Plan one priority, move your body, and close with a mood check.</p>
          </div>
          <div className="pulse-note pulse-focus">
            <CalendarCheck size={16} />
            <span>Focus block</span>
            <b>Choose one task that makes the day feel lighter.</b>
          </div>
          <div className="pulse-note pulse-energy">
            <Dumbbell size={16} />
            <span>Energy</span>
            <b>Log a workout, walk, or stretch to understand your patterns.</b>
          </div>
          <div className="pulse-note pulse-reset">
            <HeartPulse size={16} />
            <span>Reset</span>
            <b>Write one honest mood note before the day ends.</b>
          </div>
        </div>
      </section>

      <section className="visual-card-grid">
        {visualCards.map(({ icon: Icon, label, title, text, image }) => (
          <article
            className="visual-tile"
            key={label}
            style={{ backgroundImage: `linear-gradient(180deg, rgba(5,8,12,0.00), rgba(5,8,12,0.82)), url(${image})` }}
          >
            <div className="visual-tile-icon"><Icon size={20} /></div>
            <span>{label}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="home-insight-band">
        <article>
          <span className="kicker"><CalendarCheck size={14} /> Why track it?</span>
          <h3>Small logs reveal patterns.</h3>
          <p>
            A few daily notes can show which meals, workouts, tasks and stress triggers affect your week.
          </p>
        </article>

        <article className="quick-reset">
          <span className="kicker"><HeartPulse size={14} /> When mood is low</span>
          <ol className="reset-list">
            {resetSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>
    </div>
  );
}
