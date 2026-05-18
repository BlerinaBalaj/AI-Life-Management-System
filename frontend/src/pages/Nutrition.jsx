import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Apple, Beef, Wheat, Droplet, Plus, X, PlayCircle,
  CheckCircle2, CalendarDays, Flame, Utensils, Leaf,
} from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import AIOutputCard from "../components/AIOutputCard.jsx";
import { api, apiErrorMessage, isDemo } from "../api/client.js";
import { mockAIResponse } from "../api/mockData.js";

const PLAN_DETAILS = {
  "balanced 2200 kcal": {
    focus: "A steady plan for energy, mood and training without overthinking every bite.",
    rhythm: "3 main meals + 1 flexible snack",
    macros: "Protein 140g / Carbs 250g / Fat 70g",
    bestFor: "Maintenance, study days, balanced routines",
    meals: ["Oats with berries", "Chicken rice bowl", "Greek yogurt snack", "Salmon quinoa plate"],
    tips: ["Build every plate around protein.", "Keep colorful vegetables visible.", "Use snacks to prevent late energy crashes."],
  },
  "high protein cut": {
    focus: "Protein-forward meals designed to keep you full while reducing calories.",
    rhythm: "3 lean meals + 1 protein snack",
    macros: "Protein 170g / Carbs 155g / Fat 55g",
    bestFor: "Fat loss, strength training, appetite control",
    meals: ["Egg white breakfast bowl", "Grilled chicken salad", "Protein shake", "Lean fish and greens"],
    tips: ["Protein first, sauces last.", "Choose high-volume vegetables.", "Keep one planned snack ready."],
  },
};

const FOOD_PRESETS = [
  {
    foodName: "Oatmeal & berries",
    mealType: "BREAKFAST",
    calories: 380,
    proteinGrams: 12,
    carbsGrams: 60,
    fatGrams: 8,
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
  },
  {
    foodName: "Grilled chicken salad",
    mealType: "LUNCH",
    calories: 520,
    proteinGrams: 42,
    carbsGrams: 30,
    fatGrams: 22,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  },
  {
    foodName: "Protein smoothie",
    mealType: "SNACK",
    calories: 260,
    proteinGrams: 32,
    carbsGrams: 24,
    fatGrams: 5,
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
  },
  {
    foodName: "Salmon & quinoa",
    mealType: "DINNER",
    calories: 640,
    proteinGrams: 44,
    carbsGrams: 50,
    fatGrams: 24,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
  },
  {
    foodName: "Avocado egg toast",
    mealType: "BREAKFAST",
    calories: 430,
    proteinGrams: 22,
    carbsGrams: 38,
    fatGrams: 22,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    foodName: "Greek yogurt bowl",
    mealType: "SNACK",
    calories: 310,
    proteinGrams: 28,
    carbsGrams: 34,
    fatGrams: 7,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
  },
];

function getPlanDetails(plan) {
  const key = (plan?.title || "").toLowerCase();
  return PLAN_DETAILS[key] || {
    focus: plan?.description || "A flexible nutrition plan for a more steady day.",
    rhythm: "Balanced meals across the day",
    macros: "Protein, carbs and fats adjusted to your target",
    bestFor: plan?.goal || "General wellbeing",
    meals: ["Protein breakfast", "Colorful lunch bowl", "Smart snack", "Simple dinner"],
    tips: ["Start with a protein source.", "Add fiber and color.", "Log meals while they are fresh in memory."],
  };
}

function formatFoodDate(value) {
  if (!value) return { label: "No date", weekday: "--", day: "--", month: "", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: "No date", weekday: "--", day: "--", month: "", time: "" };
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

export default function Nutrition() {
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ai, setAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    foodName: "",
    mealType: "BREAKFAST",
    consumedAt: new Date().toISOString().slice(0, 16),
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
  });

  useEffect(() => {
    api.getNutritionPlans().then((d) => setPlans(d || []));
    api.getFoodLogs().then((d) => setLogs(d || []));
  }, []);

  const totals = useMemo(() => {
    return logs.reduce(
      (a, l) => ({
        calories: a.calories + (l.calories || 0),
        protein: a.protein + (l.proteinGrams || 0),
        carbs: a.carbs + (l.carbsGrams || 0),
        fat: a.fat + (l.fatGrams || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [logs]);

  const askAI = async () => {
    setAiLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiNutrition({});
      setAi(res.data);
    } catch (err) {
      setAi(isDemo() ? mockAIResponse : {
        summary: apiErrorMessage(err, "AI nutrition suggestion failed. Check OPENAI_API_KEY and backend logs."),
        recommendations: [],
        tasks: [],
        insights: ["This is a real API error, not demo data."],
      });
    } finally {
      setAiLoading(false);
    }
  };

  const saveLog = async (e) => {
    e.preventDefault();
    const local = { id: Date.now(), ...form };
    setLogs((l) => [local, ...l]);
    setShow(false);
    try { await api.createFoodLog(local); } catch {}
  };

  const chooseFood = (preset) => {
    const { image, ...meal } = preset;
    setForm({
      ...meal,
      consumedAt: new Date().toISOString().slice(0, 16),
    });
  };

  const selectedDetails = selectedPlan ? getPlanDetails(selectedPlan) : null;

  return (
    <div className="grid-stack">
      <div className="grid-4">
        <StatCard icon={Apple} label="Calories" value={totals.calories} accent="green" />
        <StatCard icon={Beef} label="Protein (g)" value={totals.protein} accent="blue" />
        <StatCard icon={Wheat} label="Carbs (g)" value={totals.carbs} accent="green" />
        <StatCard icon={Droplet} label="Fat (g)" value={totals.fat} accent="blue" />
      </div>

      <section className="card row-between">
        <div>
          <h3 style={{ margin: 0 }}>AI nutrition suggestion</h3>
          <p className="muted" style={{ margin: "4px 0 0" }}>Smart meal ideas based on your goals</p>
        </div>
        <div className="row gap">
          <button className="btn btn-ai" onClick={askAI} disabled={aiLoading}>
            <Sparkles size={14} /> {aiLoading ? "Generating..." : "AI Nutrition"}
          </button>
          <button className="btn btn-primary" onClick={() => setShow(true)}>
            <Plus size={14} /> Log food
          </button>
        </div>
      </section>

      {ai && <AIOutputCard data={ai} title="AI Nutrition Suggestion" />}

      <section className="card nutrition-plan-section">
        <header className="card-head">
          <div>
            <h3>Choose a nutrition plan</h3>
            <p className="muted">Click a plan to see meal rhythm, macros and food ideas.</p>
          </div>
        </header>
        {plans.length === 0 ? <div className="empty">No plans available.</div> : (
          <div className="grid-3">
            {plans.map((p) => (
              <button key={p.id} className="mini-card nutrition-plan-card" type="button" onClick={() => setSelectedPlan(p)}>
                <div className="mini-icon"><Apple size={18} /></div>
                <strong>{p.title}</strong>
                <p className="muted">{p.description}</p>
                <div className="row gap">
                  {p.dailyCalories && <span className="badge">{p.dailyCalories} kcal/day</span>}
                  {p.goal && <span className="badge badge-soft">{p.goal}</span>}
                </div>
                <span className="plan-action"><PlayCircle size={14} /> View meals</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="card food-log-section">
        <header className="card-head">
          <div>
            <h3>Food logs</h3>
            <p className="muted">Meals shown as nutrition cards instead of a raw table.</p>
          </div>
        </header>
        {logs.length === 0 ? <div className="empty">No food logged yet.</div> : (
          <div className="food-card-list">
            {logs.map((l) => {
              const date = formatFoodDate(l.consumedAt);
              return (
                <article key={l.id} className="food-log-card">
                  <div className="food-date-tile">
                    <span>{date.weekday}</span>
                    <strong>{date.day}</strong>
                    <small>{date.month}</small>
                  </div>
                  <div className="food-main">
                    <div className="food-title-row">
                      <div>
                        <strong>{l.foodName}</strong>
                        <p><CalendarDays size={13} /> {date.label}{date.time ? ` • ${date.time}` : ""}</p>
                      </div>
                      <span className="meal-pill">{l.mealType}</span>
                    </div>
                    <div className="food-metrics">
                      <span><Flame size={14} /> {l.calories || 0} kcal</span>
                      <span><Beef size={14} /> P {l.proteinGrams || 0}g</span>
                      <span><Wheat size={14} /> C {l.carbsGrams || 0}g</span>
                      <span><Droplet size={14} /> F {l.fatGrams || 0}g</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedPlan && selectedDetails && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal nutrition-detail-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Nutrition plan</span>
                <h3>{selectedPlan.title}</h3>
                <p className="muted">{selectedDetails.focus}</p>
              </div>
              <button className="btn-icon" type="button" onClick={() => setSelectedPlan(null)} aria-label="Close">
                <X size={16} />
              </button>
            </header>
            <div className="nutrition-detail-grid">
              <div><Utensils size={16} /><span>Meal rhythm</span><strong>{selectedDetails.rhythm}</strong></div>
              <div><Beef size={16} /><span>Macro target</span><strong>{selectedDetails.macros}</strong></div>
              <div><Leaf size={16} /><span>Best for</span><strong>{selectedDetails.bestFor}</strong></div>
            </div>
            <div className="nutrition-meal-ideas">
              {selectedDetails.meals.map((meal) => <span key={meal}>{meal}</span>)}
            </div>
            <div className="nutrition-tip-list">
              {selectedDetails.tips.map((tip, index) => (
                <div key={tip}>
                  <span>{index + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-primary workout-log-plan" type="button" onClick={() => { setSelectedPlan(null); setShow(true); }}>
              <CheckCircle2 size={15} /> Log food from this plan
            </button>
          </div>
        </div>
      )}

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal nutrition-log-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <h3>Log food</h3>
                <p className="muted">Pick a food photo or enter your own meal.</p>
              </div>
              <button className="btn-icon" type="button" onClick={() => setShow(false)} aria-label="Close">
                <X size={16} />
              </button>
            </header>
            <form className="form" onSubmit={saveLog}>
              <div className="food-preset-grid">
                {FOOD_PRESETS.map((preset) => (
                  <button
                    key={preset.foodName}
                    className={`food-preset-card ${form.foodName === preset.foodName ? "selected" : ""}`}
                    type="button"
                    onClick={() => chooseFood(preset)}
                  >
                    <img src={preset.image} alt="" />
                    <span>{preset.mealType}</span>
                    <strong>{preset.foodName}</strong>
                    <small>{preset.calories} kcal • P {preset.proteinGrams}g</small>
                  </button>
                ))}
              </div>
              <label>Food name<input value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} required /></label>
              <div className="grid-2">
                <label>Meal type
                  <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
                    <option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option><option>SNACK</option>
                  </select>
                </label>
                <label>Consumed at<input type="datetime-local" value={form.consumedAt} onChange={(e) => setForm({ ...form, consumedAt: e.target.value })} /></label>
              </div>
              <div className="grid-4">
                <label>Calories<input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: +e.target.value })} /></label>
                <label>Protein (g)<input type="number" value={form.proteinGrams} onChange={(e) => setForm({ ...form, proteinGrams: +e.target.value })} /></label>
                <label>Carbs (g)<input type="number" value={form.carbsGrams} onChange={(e) => setForm({ ...form, carbsGrams: +e.target.value })} /></label>
                <label>Fat (g)<input type="number" value={form.fatGrams} onChange={(e) => setForm({ ...form, fatGrams: +e.target.value })} /></label>
              </div>
              <div className="row gap">
                <button className="btn btn-primary" type="submit">Save</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
