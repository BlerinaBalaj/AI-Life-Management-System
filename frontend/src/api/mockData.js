// Mock fallback data so the UI is never broken during preview/demo.
const today = new Date();
const iso = (d) => new Date(d).toISOString();
const dayOffset = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};

export const mockData = {
  goals: [
    { id: 1, title: "Run a half marathon", category: "Fitness", progress: 65, status: "ACTIVE" },
    { id: 2, title: "Read 20 books this year", category: "Learning", progress: 40, status: "ACTIVE" },
    { id: 3, title: "Save $5,000", category: "Finance", progress: 80, status: "ACTIVE" },
    { id: 4, title: "Meditate daily", category: "Wellbeing", progress: 100, status: "COMPLETED" },
  ],
  tasks: [
    { id: 1, title: "Morning run 5km", status: "DONE", priority: "HIGH", dueDate: iso(today) },
    { id: 2, title: "Review quarterly goals", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: iso(today) },
    { id: 3, title: "Reply to project emails", status: "TODO", priority: "MEDIUM", dueDate: iso(today) },
    { id: 4, title: "Grocery shopping", status: "TODO", priority: "LOW", dueDate: iso(dayOffset(1)) },
    { id: 5, title: "Read chapter 4", status: "DONE", priority: "LOW", dueDate: iso(dayOffset(-1)) },
    { id: 6, title: "Yoga session", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: iso(dayOffset(2)) },
    { id: 7, title: "Plan weekend trip", status: "TODO", priority: "LOW", dueDate: iso(dayOffset(3)) },
  ],
  dailyPlans: [
    { id: 1, title: "Productive Monday", planDate: iso(today), summary: "Focus on deep work and morning workout." },
    { id: 2, title: "Recovery day", planDate: iso(dayOffset(-1)), summary: "Light yoga, journaling, early sleep." },
    { id: 3, title: "Learning sprint", planDate: iso(dayOffset(-2)), summary: "Two hours of reading + course module." },
  ],
  notifications: [
    { id: 1, title: "Goal milestone", message: "You're 65% to your half marathon goal!", time: "2h ago" },
    { id: 2, title: "AI insight ready", message: "Your weekly report is available.", time: "5h ago" },
    { id: 3, title: "Task reminder", message: "3 tasks due today.", time: "1d ago" },
  ],
  workouts: [
    { id: 1, title: "Full Body Strength", description: "Compound lifts focused workout.", difficulty: "Intermediate", duration: 45 },
    { id: 2, title: "HIIT Cardio Burn", description: "20-minute high intensity intervals.", difficulty: "Advanced", duration: 20 },
    { id: 3, title: "Yoga Flow", description: "Relaxing vinyasa flow.", difficulty: "Beginner", duration: 30 },
  ],
  workoutSessions: [
    { id: 1, workoutTitle: "Full Body Strength", startedAt: iso(dayOffset(-1)), durationMinutes: 50, caloriesBurned: 380, notes: "Great session, increased squat weight." },
    { id: 2, workoutTitle: "HIIT Cardio Burn", startedAt: iso(dayOffset(-3)), durationMinutes: 22, caloriesBurned: 260, notes: "Tough but manageable." },
    { id: 3, workoutTitle: "Yoga Flow", startedAt: iso(dayOffset(-5)), durationMinutes: 35, caloriesBurned: 140, notes: "Felt very relaxed afterwards." },
  ],
  nutritionPlans: [
    { id: 1, title: "Balanced 2200 kcal", description: "Whole foods, balanced macros.", dailyCalories: 2200, goal: "Maintain" },
    { id: 2, title: "High Protein Cut", description: "Protein-forward meals for fat loss.", dailyCalories: 1900, goal: "Cut" },
  ],
  foodLogs: [
    { id: 1, foodName: "Oatmeal & berries", mealType: "BREAKFAST", consumedAt: iso(today), calories: 380, proteinGrams: 12, carbsGrams: 60, fatGrams: 8 },
    { id: 2, foodName: "Grilled chicken salad", mealType: "LUNCH", consumedAt: iso(today), calories: 520, proteinGrams: 42, carbsGrams: 30, fatGrams: 22 },
    { id: 3, foodName: "Protein shake", mealType: "SNACK", consumedAt: iso(today), calories: 220, proteinGrams: 30, carbsGrams: 12, fatGrams: 4 },
    { id: 4, foodName: "Salmon & quinoa", mealType: "DINNER", consumedAt: iso(today), calories: 640, proteinGrams: 44, carbsGrams: 50, fatGrams: 24 },
  ],
  moodLogs: [
    { id: 1, moodScore: 8, moodLabel: "great", journalText: "Productive day, finished workout.", createdAt: iso(today) },
    { id: 2, moodScore: 6, moodLabel: "steady", journalText: "Average day, normal energy.", createdAt: iso(dayOffset(-1)) },
    { id: 3, moodScore: 4, moodLabel: "tired", journalText: "Slept poorly.", createdAt: iso(dayOffset(-2)) },
    { id: 4, moodScore: 7, moodLabel: "steady", journalText: "Good catch up with friends.", createdAt: iso(dayOffset(-3)) },
  ],
  stressLogs: [
    { id: 1, stressLevel: 4, trigger: "Deadline pressure", copingAction: "Took a 10 min walk", createdAt: iso(today) },
    { id: 2, stressLevel: 6, trigger: "Email overload", copingAction: "Box breathing", createdAt: iso(dayOffset(-1)) },
    { id: 3, stressLevel: 3, trigger: "None major", copingAction: "Stretch break", createdAt: iso(dayOffset(-2)) },
  ],
  aiReports: [
    {
      id: 1,
      reportType: "WEEKLY",
      periodStart: iso(dayOffset(-7)),
      periodEnd: iso(today),
      summary: "You completed 14 tasks and averaged a mood score of 6.5. Fitness was consistent (3 sessions, 380 calories avg).",
      recommendations: [
        "Add one mobility session this week.",
        "Schedule a wind-down routine before bed.",
        "Batch emails into 2 windows to reduce stress spikes.",
      ],
      tasks: ["Plan Sunday review", "Walk after lunch", "Hydration goal: 2.5L/day"],
      insights: [
        "Mood dips correlate with poor sleep nights.",
        "Strength sessions boost next-day focus by ~20%.",
      ],
    },
  ],
  aiHistory: [
    { id: 1, requestType: "weekly-report", createdAt: iso(dayOffset(-1)), preview: "Weekly review and recommendations" },
    { id: 2, requestType: "workout-suggestion", createdAt: iso(dayOffset(-2)), preview: "30-min full body workout" },
    { id: 3, requestType: "mood-analysis", createdAt: iso(dayOffset(-3)), preview: "Energy trend is improving" },
  ],
};

export const mockAIResponse = {
  summary:
    "Based on your recent activity, your consistency is strong but recovery and hydration need attention.",
  recommendations: [
    "Aim for 7-8 hours of sleep tonight.",
    "Add 10 minutes of mobility before workouts.",
    "Drink at least 2L of water tomorrow.",
  ],
  tasks: ["Stretch 10 min after work", "Prep tomorrow's meals tonight"],
  insights: [
    "Your best mood scores happen on workout days.",
    "Stress peaks mid-week - consider a Wednesday walk.",
  ],
  warnings: ["Sleep average dropped below 6.5h this week."],
};
