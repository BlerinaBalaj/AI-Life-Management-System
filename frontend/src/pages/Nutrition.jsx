import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Apple, Beef, Wheat, Droplet, Plus, X, PlayCircle,
  CheckCircle2, CalendarDays, Flame, Utensils, Leaf, Search,
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
  "steady energy day": {
    focus: "A simple focus-day plan built to avoid heavy meals and afternoon crashes.",
    rhythm: "Breakfast, lunch, snack and light dinner",
    macros: "Protein 125g / Carbs 230g / Fat 65g",
    bestFor: "Energy, studying, work days",
    meals: ["Avocado egg toast", "Chicken rice bowl", "Greek yogurt bowl", "Simple salmon dinner"],
    tips: ["Eat breakfast with protein.", "Keep lunch colorful but not too heavy.", "Use a snack before energy drops."],
  },
};

const STARTER_NUTRITION_PLANS = [
  { id: "starter-balanced", title: "Balanced 2200 kcal", description: "Whole foods, balanced macros.", dailyCalories: 2200, goal: "Maintain" },
  { id: "starter-protein", title: "High Protein Cut", description: "Protein-forward meals for fat loss.", dailyCalories: 1900, goal: "Cut" },
  { id: "starter-steady", title: "Steady Energy Day", description: "Simple meals for focus, hydration and no afternoon crash.", dailyCalories: 2100, goal: "Energy" },
];

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

function presetFromMealName(mealName, fallbackMealType = "BREAKFAST") {
  const normalized = String(mealName || "").toLowerCase();
  const direct = FOOD_PRESETS.find((preset) => {
    const name = preset.foodName.toLowerCase();
    return normalized.includes(name) || name.includes(normalized);
  });
  if (direct) return direct;

  if (normalized.includes("oat") || normalized.includes("breakfast")) return FOOD_PRESETS[0];
  if (normalized.includes("chicken") || normalized.includes("salad") || normalized.includes("lunch")) return FOOD_PRESETS[1];
  if (normalized.includes("smoothie") || normalized.includes("snack") || normalized.includes("yogurt")) return FOOD_PRESETS[2];
  if (normalized.includes("salmon") || normalized.includes("quinoa") || normalized.includes("dinner")) return FOOD_PRESETS[3];
  if (normalized.includes("egg") || normalized.includes("toast")) return FOOD_PRESETS[4];

  return {
    foodName: mealName || "Balanced meal",
    mealType: fallbackMealType,
    calories: 430,
    proteinGrams: 28,
    carbsGrams: 45,
    fatGrams: 14,
  };
}

function presetForPlan(plan, details) {
  const key = String(plan?.title || "").toLowerCase();
  if (key.includes("high protein")) return FOOD_PRESETS[1];
  if (key.includes("steady energy")) return FOOD_PRESETS[4];
  if (key.includes("balanced")) return FOOD_PRESETS[3];
  return presetFromMealName(details.meals[0] || plan?.title || "Balanced meal");
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
  const [nutritionFilters, setNutritionFilters] = useState({ query: "", maxCalories: "" });
  const [filteredPlans, setFilteredPlans] = useState(null);
  const [nutritionFiltering, setNutritionFiltering] = useState(false);
  const [nutritionFilterError, setNutritionFilterError] = useState("");
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

  const todayTotals = useMemo(() => {
    return logs.filter((log) => isToday(log.consumedAt)).reduce(
      (a, l) => ({
        calories: a.calories + (l.calories || 0),
        protein: a.protein + (l.proteinGrams || 0),
        carbs: a.carbs + (l.carbsGrams || 0),
        fat: a.fat + (l.fatGrams || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [logs]);

  const starterPlanTitles = new Set(STARTER_NUTRITION_PLANS.map((plan) => plan.title.toLowerCase()));
  const displayPlans = [
    ...STARTER_NUTRITION_PLANS,
    ...plans.filter((plan) => !starterPlanTitles.has(String(plan.title || "").toLowerCase())),
  ];

  const applyNutritionFilters = async (e) => {
    e.preventDefault();
    setNutritionFiltering(true);
    setNutritionFilterError("");
    const query = nutritionFilters.query.trim();
    const maxCalories = nutritionFilters.maxCalories ? Number(nutritionFilters.maxCalories) : undefined;
    try {
      const res = await api.searchNutrition({ query, maxCalories });
      setFilteredPlans(res.data ?? res);
    } catch (err) {
      setNutritionFilterError(apiErrorMessage(err, "Search failed. Showing local filter instead."));
      const needle = query.toLowerCase();
      setFilteredPlans(displayPlans.filter((p) => {
        const matchText = !needle || (p.title || "").toLowerCase().includes(needle) || (p.description || "").toLowerCase().includes(needle);
        const matchCal = !maxCalories || (p.dailyCalories || 0) <= maxCalories;
        return matchText && matchCal;
      }));
    } finally {
      setNutritionFiltering(false);
    }
  };

  const resetNutritionFilters = () => {
    setNutritionFilters({ query: "", maxCalories: "" });
    setFilteredPlans(null);
    setNutritionFilterError("");
  };

  const upsertNutritionPlan = (plan) => {
    if (!plan) return;
    setPlans((current) => {
      const exists = current.some((item) => item.id === plan.id);
      if (exists) return current.map((item) => (item.id === plan.id ? plan : item));
      return [plan, ...current];
    });
  };

  const askAI = async () => {
    setAiLoading(true);
    try {
      if (isDemo()) throw new Error("demo");
      const res = await api.aiNutrition({});
      setAi(res.data);
      upsertNutritionPlan(res.data?.nutritionPlan);
    } catch (err) {
      setAi(isDemo() ? mockAIResponse : {
        summary: apiErrorMessage(err, "AI nutrition suggestion failed. Check LLAMA_BASE_URL, LLAMA_MODEL, LLAMA_API_KEY, and backend logs."),
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
    try {
      const res = await api.createFoodLog(form);
      setLogs((l) => [res.data, ...l]);
      setShow(false);
    } catch (err) {
      alert(apiErrorMessage(err, "Food log could not be saved."));
    }
  };

  const chooseFood = (preset) => {
    const { image, ...meal } = preset;
    setForm({
      ...meal,
      consumedAt: new Date().toISOString().slice(0, 16),
    });
  };

  const logFoodFromPlan = (plan, details) => {
    chooseFood(presetForPlan(plan, details));
    setSelectedPlan(null);
    setShow(true);
  };

  const selectedDetails = selectedPlan ? getPlanDetails(selectedPlan) : null;

  return (
    <div className="grid-stack">
      <section className="card daily-track-card">
        <header className="card-head">
          <div>
            <h3>Today&apos;s nutrition</h3>
            <p className="muted">Resets each day and fills as you log food.</p>
          </div>
        </header>
        <div className="grid-4 today-stats">
          <StatCard icon={Apple} label="Today calories" value={todayTotals.calories} accent="green" hint="Resets at midnight" />
          <StatCard icon={Beef} label="Today protein" value={todayTotals.protein} accent="blue" hint="Today's grams" />
          <StatCard icon={Wheat} label="Today carbs" value={todayTotals.carbs} accent="green" hint="Today's grams" />
          <StatCard icon={Droplet} label="Today fat" value={todayTotals.fat} accent="blue" hint="Today's grams" />
        </div>
      </section>

      <section className="card all-time-panel">
        <header className="card-head">
          <div>
            <h3>All-time nutrition</h3>
            <p className="muted">A quieter summary of every meal you have logged.</p>
          </div>
        </header>
        <div className="grid-4 all-time-stats">
          <StatCard icon={Apple} label="All calories" value={totals.calories} accent="green" hint="Every logged meal" />
          <StatCard icon={Beef} label="All protein" value={totals.protein} accent="blue" hint="Total grams logged" />
          <StatCard icon={Wheat} label="All carbs" value={totals.carbs} accent="green" hint="Total grams logged" />
          <StatCard icon={Droplet} label="All fat" value={totals.fat} accent="blue" hint="Total grams logged" />
        </div>
      </section>

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

      {ai && <AIOutputCard data={ai} title="AI Nutrition Suggestion" simple />}

      <section className="card nutrition-plan-section">
        <header className="card-head">
          <div>
            <h3>Choose a nutrition plan</h3>
            <p className="muted">Click a plan to see meal rhythm, macros and food ideas.</p>
          </div>
        </header>
        <form className="filter-bar" onSubmit={applyNutritionFilters} style={{ marginBottom: "1rem" }}>
          <label className="filter-search">
            <Search size={15} />
            <input
              value={nutritionFilters.query}
              onChange={(e) => setNutritionFilters({ ...nutritionFilters, query: e.target.value })}
              placeholder="Search nutrition plans…"
            />
          </label>
          <label className="filter-search" style={{ maxWidth: "160px" }}>
            <Flame size={15} />
            <input
              type="number"
              min="0"
              value={nutritionFilters.maxCalories}
              onChange={(e) => setNutritionFilters({ ...nutritionFilters, maxCalories: e.target.value })}
              placeholder="Max kcal/day"
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={nutritionFiltering}>
            <Search size={14} /> {nutritionFiltering ? "Searching…" : "Search"}
          </button>
          {filteredPlans !== null && (
            <button className="btn btn-ghost" type="button" onClick={resetNutritionFilters}>Clear</button>
          )}
        </form>
        {nutritionFilterError && <div className="filter-error" style={{ marginBottom: "0.5rem" }}>{nutritionFilterError}</div>}
        {filteredPlans !== null && (
          <p className="muted" style={{ marginBottom: "0.75rem" }}>
            {filteredPlans.length} result{filteredPlans.length !== 1 ? "s" : ""} found
          </p>
        )}
        <div className="grid-3">
            {(filteredPlans ?? displayPlans).map((p) => (
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
            <button className="btn btn-primary workout-log-plan" type="button" onClick={() => logFoodFromPlan(selectedPlan, selectedDetails)}>
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
