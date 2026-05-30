package com.ailife.management.config;

import com.ailife.management.ai.AIReport;
import com.ailife.management.ai.AIReportRepository;
import com.ailife.management.fitness.WorkoutPlan;
import com.ailife.management.fitness.WorkoutPlanRepository;
import com.ailife.management.fitness.WorkoutSession;
import com.ailife.management.fitness.WorkoutSessionRepository;
import com.ailife.management.goal.Goal;
import com.ailife.management.goal.GoalRepository;
import com.ailife.management.notification.Notification;
import com.ailife.management.notification.NotificationRepository;
import com.ailife.management.nutrition.FoodLog;
import com.ailife.management.nutrition.FoodLogRepository;
import com.ailife.management.nutrition.NutritionPlan;
import com.ailife.management.nutrition.NutritionPlanRepository;
import com.ailife.management.planning.DailyPlan;
import com.ailife.management.planning.DailyPlanRepository;
import com.ailife.management.planning.Task;
import com.ailife.management.planning.TaskRepository;
import com.ailife.management.progress.ProgressTracker;
import com.ailife.management.progress.ProgressTrackerRepository;
import com.ailife.management.user.User;
import com.ailife.management.user.UserRepository;
import com.ailife.management.wellbeing.MoodLog;
import com.ailife.management.wellbeing.MoodLogRepository;
import com.ailife.management.wellbeing.StressLog;
import com.ailife.management.wellbeing.StressLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalTime;

/**
 * Seeds realistic, varied demo data for all manually-registered users with real emails.
 * Skips .test/.local addresses and users that already have data.
 * Runs at @Order(3), after BleriUserSeeder.
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class RealUserSeeder implements CommandLineRunner {

    @Value("${app.seed.demo-data:false}")
    private boolean seedDemoData;

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final DailyPlanRepository dailyPlanRepository;
    private final TaskRepository taskRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final FoodLogRepository foodLogRepository;
    private final MoodLogRepository moodLogRepository;
    private final StressLogRepository stressLogRepository;
    private final ProgressTrackerRepository progressTrackerRepository;
    private final AIReportRepository aiReportRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (!seedDemoData) {
            log.info("[RealUserSeeder] SEED_DEMO_DATA=false — duke kaluar.");
            return;
        }
        log.info("[RealUserSeeder] SEED_DEMO_DATA=true — duke seed-uar të gjithë users ekzistues...");
        List<Long> userIds = userRepository.findAll().stream()
                .map(u -> u.getId())
                .collect(java.util.stream.Collectors.toList());
        log.info("[RealUserSeeder] {} users gjithsej.", userIds.size());
        for (Long userId : userIds) {
            seedUser(userId);
        }
    }

    @Transactional
    public void seedUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        if (!user.isEnabled()) {
            user.setEnabled(true);
            userRepository.save(user);
        }
        if (!workoutPlanRepository.findByUserIdAndTenantId(userId, user.getTenant().getId()).isEmpty()) {
            log.info("[RealUserSeeder] {} ({}) — ka të dhëna, duke kaluar.", user.getFullName(), user.getEmail());
            return;
        }
        log.info("[RealUserSeeder] Seeding: {} ({})", user.getFullName(), user.getEmail());
        seed(user);
        log.info("[RealUserSeeder] Done: {} ({})", user.getFullName(), user.getEmail());
    }

    // ── Seed logic ────────────────────────────────────────────────────────────

    private void seed(User user) {
        // Use email hash as a stable, unique variation index (0-99)
        int v = Math.abs(user.getEmail().hashCode() % 100);
        LocalDate today = LocalDate.now();

        // ── Goal ─────────────────────────────────────────────────────────────
        String[] goalTitles = {
            "Build a consistent weekly fitness routine",
            "Improve nutrition and hit macro targets",
            "Reduce stress and improve sleep quality",
            "Complete key work projects with deep focus",
            "Maintain energy and mood through balanced habits",
            "Increase workout frequency to 4x per week",
            "Track food intake and stay within calorie goals",
            "Develop a morning routine for better productivity"
        };
        Goal goal = new Goal();
        goal.setTenant(user.getTenant());
        goal.setUser(user);
        goal.setTitle(goalTitles[v % goalTitles.length]);
        goal.setDescription("Personal goal for " + user.getFullName() + " based on weekly habits and priorities.");
        goal.setStatus(v % 7 == 0 ? "PAUSED" : "ACTIVE");
        goal.setPriority(1 + (v % 3));
        goal.setTargetDate(today.plusDays(14 + (v % 21)));
        goal = goalRepository.save(goal);

        // ── Daily Plan ───────────────────────────────────────────────────────
        String[] planTitles = {
            "High output execution day",
            "Balanced recovery and planning",
            "Deep work + wellness day",
            "Focus on priorities and rest",
            "Active and productive day"
        };
        DailyPlan plan = new DailyPlan();
        plan.setTenant(user.getTenant());
        plan.setUser(user);
        plan.setPlanDate(today.minusDays(v % 3));
        plan.setTitle(planTitles[v % planTitles.length]);
        plan.setSummary("Daily plan with tasks, workouts, meals, and wellbeing check-ins.");
        plan.setAiGenerated(v % 5 == 0);
        plan = dailyPlanRepository.save(plan);

        // ── Tasks ────────────────────────────────────────────────────────────
        String[][] tasks = {
            {"Morning planning review",  "Review top 3 priorities for the day.",                  "DONE",        "08:00", "08:30"},
            {"Deep work block",          "Complete highest-impact work before noon.",              "IN_PROGRESS", "09:30", "11:30"},
            {"Midday walk",              "10-minute walk to reset focus and energy.",              "TODO",        "13:00", "13:15"},
            {"Evening reflection",       "Note energy level, stress score, and one win.",         "TODO",        "20:30", "20:45"},
            {"Hydration check",          "Ensure at least 2L of water consumed today.",           "DONE",        "15:00", "15:05"},
            {"Read or learn (30 min)",   "Read a book chapter or watch an educational video.",    "TODO",        "21:00", "21:30"},
        };
        int taskCount = 3 + (v % 3); // 3, 4, or 5 tasks
        for (int i = 0; i < taskCount; i++) {
            String[] t = tasks[i % tasks.length];
            String status = i == 0 ? "DONE" : (i == 1 ? (v % 3 == 0 ? "IN_PROGRESS" : "TODO") : "TODO");
            createTask(user, plan, t[0], t[1], status, i + 1,
                    today.minusDays(i % 2),
                    LocalTime.parse(t[3]),
                    LocalTime.parse(t[4]));
        }

        // ── Workout Plan ─────────────────────────────────────────────────────
        String[] wpTitles = {
            "Strength and mobility plan",
            "Cardio endurance plan",
            "Full body conditioning",
            "HIIT and recovery plan",
            "Functional fitness program"
        };
        String[] difficulties = {"BEGINNER", "INTERMEDIATE", "ADVANCED"};
        WorkoutPlan wp = new WorkoutPlan();
        wp.setTenant(user.getTenant());
        wp.setUser(user);
        wp.setTitle(wpTitles[v % wpTitles.length]);
        wp.setDescription("Personalized workout plan with " + (3 + v % 3) + " sessions per week.");
        wp.setDifficulty(difficulties[v % 3]);
        wp.setDaysPerWeek(3 + (v % 3));
        wp.setAiGenerated(v % 4 == 1);
        wp = workoutPlanRepository.save(wp);

        // 3–5 sessions over the last 8 days
        int sessionCount = 3 + (v % 3);
        String[] sessionNotes = {
            "Strong session — good range of motion and steady pace.",
            "Upper body focus, felt a bit fatigued mid-set.",
            "Active recovery with light cardio and stretching.",
            "Personal best on squats today — great energy.",
            "Solid endurance run, maintained target heart rate."
        };
        for (int i = 0; i < sessionCount; i++) {
            LocalDateTime started = today.minusDays(i * 2L + (v % 2)).atTime(6 + (v % 3), 15 + (i * 5 % 30));
            int duration = 30 + (v % 6) * 5 + i * 3;
            WorkoutSession ws = new WorkoutSession();
            ws.setTenant(user.getTenant());
            ws.setUser(user);
            ws.setWorkoutPlan(wp);
            ws.setStartedAt(started);
            ws.setDurationMinutes(duration);
            ws.setEndedAt(started.plusMinutes(duration));
            ws.setCaloriesBurned(200 + (v % 7) * 30 + i * 20);
            ws.setNotes(sessionNotes[i % sessionNotes.length]);
            workoutSessionRepository.save(ws);
        }

        // ── Nutrition Plan ───────────────────────────────────────────────────
        int calories  = 1800 + (v % 8) * 75;
        int protein   = 110 + (v % 7) * 8;
        int carbs     = 180 + (v % 6) * 18;
        int fat       = 55  + (v % 5) * 5;
        String[] npTitles = {
            "Balanced macro plan",
            "High-protein lean plan",
            "Moderate carb performance plan",
            "Clean eating daily plan"
        };
        NutritionPlan np = new NutritionPlan();
        np.setTenant(user.getTenant());
        np.setUser(user);
        np.setTitle(npTitles[v % npTitles.length]);
        np.setDescription("Daily targets: " + calories + " kcal, " + protein + "g protein, " + carbs + "g carbs, " + fat + "g fat.");
        np.setDailyCalories(calories);
        np.setProteinGrams(protein);
        np.setCarbsGrams(carbs);
        np.setFatGrams(fat);
        np.setAiGenerated(v % 4 == 2);
        nutritionPlanRepository.save(np);

        // Food logs — 3 days, varied meals
        String[][] breakfasts = {
            {"Greek yogurt with oats and berries", "420", "32", "52", "10"},
            {"Scrambled eggs with avocado toast",  "480", "28", "44", "22"},
            {"Protein smoothie with banana",       "380", "35", "48",  "8"},
            {"Oatmeal with nuts and honey",        "410", "18", "68", "12"},
        };
        String[][] lunches = {
            {"Grilled chicken quinoa bowl",  "640", "48", "72", "16"},
            {"Tuna salad with whole grain",  "480", "40", "46", "14"},
            {"Turkey avocado wrap",          "540", "36", "52", "20"},
            {"Lentil soup with bread",       "520", "28", "78", "10"},
        };
        String[][] dinners = {
            {"Baked salmon with vegetables", "680", "46", "58", "26"},
            {"Chicken stir-fry with rice",   "620", "44", "76", "14"},
            {"Pasta bolognese (lean beef)",  "650", "42", "88", "18"},
            {"Beef bowl with sweet potato",  "700", "50", "82", "20"},
        };
        for (int day = 0; day < 3; day++) {
            int bi = (v + day) % breakfasts.length;
            int li = (v + day + 1) % lunches.length;
            int di = (v + day + 2) % dinners.length;
            foodLog(user, today.minusDays(day).atTime(8, 5 + day * 3),
                    breakfasts[bi][0], "BREAKFAST", breakfasts[bi]);
            foodLog(user, today.minusDays(day).atTime(13, 10 + day * 5),
                    lunches[li][0],    "LUNCH",     lunches[li]);
            foodLog(user, today.minusDays(day).atTime(19, 15 + day * 7),
                    dinners[di][0],    "DINNER",    dinners[di]);
        }

        // ── Mood Logs ────────────────────────────────────────────────────────
        int[] moodBase = {6, 8, 5, 9, 7, 4, 8, 6, 7, 5};
        String[] labels  = {"steady", "energized", "tired", "energized", "steady", "tired", "energized", "steady", "steady", "tired"};
        String[] journals = {
            "Good focus today. Managed workload without feeling overwhelmed.",
            "Excellent energy — workout and nutrition were both on point.",
            "Slept poorly, felt sluggish. Took a short walk which helped.",
            "Best day this week — everything clicked and felt in flow.",
            "Productive morning. Afternoon was heavier but pushed through.",
            "Low energy, skipped evening workout. Need more sleep.",
            "Strong recovery day. Light activity and good meals.",
            "Mixed day — work was stressful but evening was relaxing.",
            "Consistent day with no major highs or lows.",
            "Tired but completed all planned tasks. Early bed tonight."
        };
        for (int i = 0; i < 7; i++) {
            int score = moodBase[(v + i) % moodBase.length];
            MoodLog mood = new MoodLog();
            mood.setTenant(user.getTenant());
            mood.setUser(user);
            mood.setLoggedAt(today.minusDays(i).atTime(21, 0));
            mood.setMoodScore(score);
            mood.setMoodLabel(labels[(v + i) % labels.length]);
            mood.setJournalText(journals[(v + i) % journals.length]);
            mood.setAiAnalysis(score >= 7
                    ? "Good trend. Maintain current sleep and exercise habits."
                    : "Recovery needed. Reduce cognitive load and prioritise rest.");
            moodLogRepository.save(mood);
        }

        // ── Stress Logs ──────────────────────────────────────────────────────
        int[]    stressBase = {3, 5, 7, 2, 4, 6, 3, 5, 4, 6};
        String[] triggers   = {
            "Deadline pressure", "Heavy meeting schedule", "Unexpected task pile-up",
            "Light day — no major stressors", "Context switching between projects",
            "Difficult conversation with a colleague", "Routine low-stress day",
            "Technical problem with no clear solution", "Personal errand overload",
            "Unclear project requirements"
        };
        String[] coping = {
            "Time-boxed tasks and took a short break",
            "Reduced meetings and set a focus block",
            "Wrote a priority list and deferred non-urgent items",
            "Maintained normal routine, no intervention needed",
            "Single-tasked for two hours — helped significantly",
            "Short walk outside and breathing exercise",
            "Went to bed early and slept well",
            "Asked a colleague for help and clarified the issue",
            "Delegated two errands and focused on work",
            "Requested a project brief and blocked time to review it"
        };
        for (int i = 0; i < 7; i++) {
            StressLog stress = new StressLog();
            stress.setTenant(user.getTenant());
            stress.setUser(user);
            stress.setLoggedAt(today.minusDays(i).atTime(18, 30));
            stress.setStressLevel(stressBase[(v + i) % stressBase.length]);
            stress.setTrigger(triggers[(v + i) % triggers.length]);
            stress.setCopingAction(coping[(v + i) % coping.length]);
            stressLogRepository.save(stress);
        }

        // ── Progress Tracker ─────────────────────────────────────────────────
        createProgress(user, goal, today,             "Today Protein",      protein - 5 + (v % 10),  "g",   "Protein today vs " + protein + "g target.");
        createProgress(user, goal, today,             "Today Carbs",        carbs   - 8 + (v % 15),  "g",   "Carbs today vs " + carbs + "g target.");
        createProgress(user, goal, today,             "Today Calories",     calories - 30 + (v % 60),"kcal", "Calories today vs " + calories + " target.");
        createProgress(user, goal, today.minusDays(1),"Workout Minutes",    30 + (v % 6) * 5,        "min", "Duration of last workout session.");
        createProgress(user, goal, today.minusDays(1),"Calories Burned",    200 + (v % 7) * 30,      "kcal","Calories burned in last session.");
        createProgress(user, goal, today.minusDays(7),"Weekly Consistency", 60 + (v % 8) * 5,        "%",   "Composite weekly score across all habits.");

        // ── AI Report ────────────────────────────────────────────────────────
        String[] summaries = {
            "Solid week with good workout consistency and nutrition close to targets. Mood averaged above 6.5 — a positive baseline.",
            "Strong performance across fitness and food tracking. A few high-stress days were handled well with active coping strategies.",
            "Mixed week — low energy mid-week but recovered well by the weekend. Recommend protecting sleep on high-workload days.",
            "Excellent week overall. All workout sessions completed, nutrition targets met on 5 of 7 days, and mood stable.",
            "Good focus on tasks but nutrition tracking was inconsistent. Suggest logging meals immediately after eating."
        };
        String[][] insights = {
            {"Protein intake is near target — consistency is key.", "Protect deep work blocks from meeting overload.", "Add one mobility session per week for recovery."},
            {"Workout frequency is strong. Consider progressive overload.", "Stress peaks on high-meeting days — time-block mornings.", "Evening mood logging improves self-awareness over time."},
            {"Sleep quality affects mood score directly — prioritise 7–8h.", "Hydration dips on busy days — keep a water bottle visible.", "Weekly consistency score is improving — keep the streak."},
            {"Carb intake is slightly above target — swap one snack.", "Morning routine completion drives better afternoon focus.", "Consider a rest day between high-intensity sessions."},
            {"Food logging gaps on weekends — try a simple template.", "Mood recovery after low days is fast — good resilience sign.", "Progress tracker shows upward trend over the last 3 weeks."}
        };
        int si = v % summaries.length;
        StringBuilder insightsJson = new StringBuilder();
        for (String insight : insights[si]) {
            if (insightsJson.length() > 0) insightsJson.append(",");
            insightsJson.append("\"").append(insight.replace("\"", "\\\"")).append("\"");
        }
        AIReport report = new AIReport();
        report.setTenant(user.getTenant());
        report.setUser(user);
        report.setPeriodStart(today.minusDays(7));
        report.setPeriodEnd(today);
        report.setReportType("WEEKLY");
        report.setStatus("READY");
        report.setContentJson("{\"summary\":\"" + summaries[si].replace("\"", "\\\"")
                + "\",\"insights\":[" + insightsJson + "]}");
        aiReportRepository.save(report);

        // ── Notifications ────────────────────────────────────────────────────
        String[] notifTitles = {"Weekly report ready", "Workout streak maintained", "Nutrition target hit"};
        String[] notifMsgs   = {
            "Your weekly AI report is ready in the AI Reports section.",
            "You completed " + (3 + v % 3) + " workout sessions this week. Keep it up!",
            "Nutrition targets met on " + (4 + v % 4) + " of 7 days this week."
        };
        for (int i = 0; i < notifTitles.length; i++) {
            Notification n = new Notification();
            n.setTenant(user.getTenant());
            n.setUser(user);
            n.setTitle(notifTitles[i]);
            n.setMessage(notifMsgs[i]);
            n.setChannel("IN_APP");
            n.setReadFlag(i == notifTitles.length - 1);
            notificationRepository.save(n);
        }

        log.info("[RealUserSeeder] Done seeding for {} ({}).", user.getFullName(), user.getEmail());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void createTask(User user, DailyPlan plan, String title, String desc,
                            String status, int priority, LocalDate due,
                            LocalTime start, LocalTime end) {
        Task t = new Task();
        t.setTenant(user.getTenant());
        t.setUser(user);
        t.setDailyPlan(plan);
        t.setTitle(title);
        t.setDescription(desc);
        t.setStatus(status);
        t.setPriority(priority);
        t.setDueDate(due);
        t.setStartTime(start);
        t.setEndTime(end);
        taskRepository.save(t);
    }

    private void foodLog(User user, LocalDateTime at, String name, String meal, String[] data) {
        FoodLog fl = new FoodLog();
        fl.setTenant(user.getTenant());
        fl.setUser(user);
        fl.setConsumedAt(at);
        fl.setFoodName(name);
        fl.setMealType(meal);
        fl.setCalories(Integer.parseInt(data[1]));
        fl.setProteinGrams(Integer.parseInt(data[2]));
        fl.setCarbsGrams(Integer.parseInt(data[3]));
        fl.setFatGrams(Integer.parseInt(data[4]));
        foodLogRepository.save(fl);
    }

    private void createProgress(User user, Goal goal, LocalDate date,
                                String metric, double value, String unit, String notes) {
        ProgressTracker p = new ProgressTracker();
        p.setTenant(user.getTenant());
        p.setUser(user);
        p.setGoal(goal);
        p.setTrackedDate(date);
        p.setMetricName(metric);
        p.setMetricValue(value);
        p.setUnit(unit);
        p.setNotes(notes);
        progressTrackerRepository.save(p);
    }

}
