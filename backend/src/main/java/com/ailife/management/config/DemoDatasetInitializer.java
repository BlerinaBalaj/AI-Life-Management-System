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
import com.ailife.management.tenant.Tenant;
import com.ailife.management.tenant.TenantRepository;
import com.ailife.management.user.Role;
import com.ailife.management.user.RoleName;
import com.ailife.management.user.RoleRepository;
import com.ailife.management.user.User;
import com.ailife.management.user.UserProfile;
import com.ailife.management.user.UserRepository;
import com.ailife.management.wellbeing.MoodLog;
import com.ailife.management.wellbeing.MoodLogRepository;
import com.ailife.management.wellbeing.StressLog;
import com.ailife.management.wellbeing.StressLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
@Order(2)
@RequiredArgsConstructor
public class DemoDatasetInitializer implements CommandLineRunner {
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
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
    @Transactional
    public void run(String... args) {
        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.USER)));
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN)));
        Role superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.SUPER_ADMIN)));

        Tenant system = tenant("System", "system");
        User systemAdmin = createUser(system, superAdminRole, "System Administrator", "admin@ailife.local", "Admin12345!", "platform-governance");
        seedDomainData(systemAdmin, 0, "platform-governance");

        int userIndex = 1;
        for (WorkspaceSeed workspace : workspaces()) {
            Tenant tenant = tenant(workspace.name, workspace.slug);
            User admin = createUser(tenant, adminRole, workspace.adminName, workspace.adminEmail, workspace.adminPassword, workspace.focus);
            seedDomainData(admin, userIndex++, workspace.focus);
            for (UserSeed user : workspace.users) {
                User saved = createUser(tenant, userRole, user.name, user.email, user.password, workspace.focus);
                seedDomainData(saved, userIndex++, workspace.focus);
            }
        }
    }

    private Tenant tenant(String name, String slug) {
        return tenantRepository.findBySlug(slug)
                .orElseGet(() -> tenantRepository.save(new Tenant(name, slug)));
    }

    private User createUser(Tenant tenant, Role role, String fullName, String email, String password, String focus) {
        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(normalizedEmail).orElseGet(User::new);
        user.setTenant(tenant);
        user.setFullName(fullName);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);

        if (user.getProfile() == null) {
            UserProfile profile = new UserProfile();
            profile.setTenant(tenant);
            profile.setUser(user);
            profile.setPrimaryFocus(focus);
            profile.setActivityLevel("moderate");
            user.setProfile(profile);
        }

        return userRepository.save(user);
    }

    private void seedDomainData(User user, int index, String focus) {
        Long userId = user.getId();
        Long tenantId = user.getTenant().getId();
        if (!workoutPlanRepository.findByUserIdAndTenantId(userId, tenantId).isEmpty()) {
            return;
        }

        LocalDate today = LocalDate.now();
        int offset = Math.abs(user.getEmail().hashCode() % 9);
        int proteinTarget = 95 + (index % 8) * 8;
        int carbsTarget = 190 + (index % 7) * 18;
        int fatTarget = 55 + (index % 5) * 6;
        int calorieTarget = 1850 + (index % 9) * 90;

        Goal goal = new Goal();
        goal.setTenant(user.getTenant());
        goal.setUser(user);
        goal.setTitle(goalTitle(focus));
        goal.setDescription("Demo goal generated for " + user.getFullName() + " to make the workspace dashboard realistic.");
        goal.setStatus(index % 5 == 0 ? "PAUSED" : "ACTIVE");
        goal.setPriority(1 + (index % 3));
        goal.setTargetDate(today.plusDays(21 + offset));
        goal = goalRepository.save(goal);

        DailyPlan plan = new DailyPlan();
        plan.setTenant(user.getTenant());
        plan.setUser(user);
        plan.setPlanDate(today.minusDays(offset % 3));
        plan.setTitle(index % 2 == 0 ? "Focused execution day" : "Balanced recovery and planning");
        plan.setSummary("Seeded daily plan with realistic tasks, meals, workout, and wellbeing check-ins.");
        plan.setAiGenerated(index % 4 == 0);
        plan = dailyPlanRepository.save(plan);

        createTask(user, plan, "Morning planning review", "Review priorities and choose the top three outcomes.", "DONE", 1, today.minusDays(offset % 2), LocalTime.of(8, 30), LocalTime.of(9, 0));
        createTask(user, plan, "Deep work block", "Complete the highest impact task before lunch.", index % 3 == 0 ? "IN_PROGRESS" : "TODO", 2, today, LocalTime.of(10, 0), LocalTime.of(12, 0));
        createTask(user, plan, "Evening reflection", "Write a short note about energy, stress, and progress.", "TODO", 3, today, LocalTime.of(20, 0), LocalTime.of(20, 20));

        WorkoutPlan workoutPlan = new WorkoutPlan();
        workoutPlan.setTenant(user.getTenant());
        workoutPlan.setUser(user);
        workoutPlan.setTitle(index % 2 == 0 ? "Strength and mobility plan" : "Cardio endurance plan");
        workoutPlan.setDescription("Generated demo workout plan with varied sessions across the last days.");
        workoutPlan.setDifficulty(index % 3 == 0 ? "INTERMEDIATE" : "BEGINNER");
        workoutPlan.setDaysPerWeek(3 + (index % 3));
        workoutPlan.setAiGenerated(index % 4 == 1);
        workoutPlan = workoutPlanRepository.save(workoutPlan);

        for (int i = 0; i < 4; i++) {
            LocalDateTime started = today.minusDays(i * 2L + (offset % 2)).atTime(7 + (index % 3), 15);
            WorkoutSession session = new WorkoutSession();
            session.setTenant(user.getTenant());
            session.setUser(user);
            session.setWorkoutPlan(workoutPlan);
            session.setStartedAt(started);
            session.setDurationMinutes(32 + (index % 5) * 6 + i * 3);
            session.setEndedAt(started.plusMinutes(session.getDurationMinutes()));
            session.setCaloriesBurned(210 + (index % 6) * 35 + i * 18);
            session.setNotes(i == 0 ? "Today session: steady pace with good recovery." : "Completed scheduled training session.");
            workoutSessionRepository.save(session);
        }

        NutritionPlan nutritionPlan = new NutritionPlan();
        nutritionPlan.setTenant(user.getTenant());
        nutritionPlan.setUser(user);
        nutritionPlan.setTitle("Balanced macro plan");
        nutritionPlan.setDescription("Demo nutrition plan with daily protein, carbs, fats, and calories targets.");
        nutritionPlan.setDailyCalories(calorieTarget);
        nutritionPlan.setProteinGrams(proteinTarget);
        nutritionPlan.setCarbsGrams(carbsTarget);
        nutritionPlan.setFatGrams(fatTarget);
        nutritionPlan.setAiGenerated(index % 4 == 2);
        nutritionPlanRepository.save(nutritionPlan);

        seedFoodLogs(user, today, index, proteinTarget, carbsTarget, fatTarget);
        seedWellbeing(user, today, index, offset);
        seedProgress(user, goal, today, index, proteinTarget, carbsTarget);
        seedAiReport(user, today, index, proteinTarget, carbsTarget);
        seedNotifications(user, index);
    }

    private void createTask(User user, DailyPlan plan, String title, String description, String status, int priority,
                            LocalDate dueDate, LocalTime startTime, LocalTime endTime) {
        Task task = new Task();
        task.setTenant(user.getTenant());
        task.setUser(user);
        task.setDailyPlan(plan);
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setDueDate(dueDate);
        task.setStartTime(startTime);
        task.setEndTime(endTime);
        taskRepository.save(task);
    }

    private void seedFoodLogs(User user, LocalDate today, int index, int proteinTarget, int carbsTarget, int fatTarget) {
        createFood(user, today.atTime(8, 5), "Greek yogurt with oats", "BREAKFAST",
                390 + index % 40, 28 + index % 7, 48 + index % 10, 9 + index % 4);
        createFood(user, today.atTime(13, 10), "Chicken quinoa bowl", "LUNCH",
                620 + index % 60, 44 + index % 9, 72 + index % 12, 18 + index % 5);
        createFood(user, today.atTime(19, 20), "Salmon rice plate", "DINNER",
                680 + index % 70, 46 + index % 8, 76 + index % 14, 22 + index % 6);
        createFood(user, today.minusDays(1).atTime(12, 40), "Turkey avocado wrap", "LUNCH",
                540, Math.max(30, proteinTarget / 3), Math.max(50, carbsTarget / 4), Math.max(15, fatTarget / 4));
        createFood(user, today.minusDays(3).atTime(18, 35), "Lentil vegetable pasta", "DINNER",
                590, 32 + index % 6, 88 + index % 10, 13 + index % 5);
    }

    private void createFood(User user, LocalDateTime consumedAt, String foodName, String mealType,
                            int calories, int protein, int carbs, int fats) {
        FoodLog log = new FoodLog();
        log.setTenant(user.getTenant());
        log.setUser(user);
        log.setConsumedAt(consumedAt);
        log.setFoodName(foodName);
        log.setMealType(mealType);
        log.setCalories(calories);
        log.setProteinGrams(protein);
        log.setCarbsGrams(carbs);
        log.setFatGrams(fats);
        foodLogRepository.save(log);
    }

    private void seedWellbeing(User user, LocalDate today, int index, int offset) {
        for (int i = 0; i < 5; i++) {
            MoodLog mood = new MoodLog();
            mood.setTenant(user.getTenant());
            mood.setUser(user);
            mood.setLoggedAt(today.minusDays(i + offset % 2).atTime(21, 0));
            mood.setMoodScore(5 + ((index + i) % 5));
            mood.setMoodLabel(mood.getMoodScore() >= 8 ? "energized" : mood.getMoodScore() >= 6 ? "steady" : "tired");
            mood.setJournalText("Demo journal entry with different dates for realistic trend analysis.");
            mood.setAiAnalysis("Seeded AI-style note: balance workload with recovery and hydration.");
            moodLogRepository.save(mood);

            StressLog stress = new StressLog();
            stress.setTenant(user.getTenant());
            stress.setUser(user);
            stress.setLoggedAt(today.minusDays(i).atTime(18, 30));
            stress.setStressLevel(3 + ((index + i) % 6));
            stress.setTrigger(i % 2 == 0 ? "Workload" : "Schedule pressure");
            stress.setCopingAction(i % 2 == 0 ? "Short walk and breathing exercise" : "Prioritized next task and reduced context switching");
            stressLogRepository.save(stress);
        }
    }

    private void seedProgress(User user, Goal goal, LocalDate today, int index, int proteinTarget, int carbsTarget) {
        createProgress(user, goal, today, "Today Protein", 95 + (index % 8) * 7, "g",
                "Protein consumed today compared with target " + proteinTarget + "g.");
        createProgress(user, goal, today, "Today Carbs", 180 + (index % 7) * 16, "g",
                "Carbohydrates consumed today compared with target " + carbsTarget + "g.");
        createProgress(user, goal, today.minusDays(1), "Workout Minutes", 35 + (index % 5) * 8, "min",
                "Training minutes from latest completed workout.");
        createProgress(user, goal, today.minusDays(7), "Weekly Consistency", 68 + (index % 6) * 5, "%",
                "Composite consistency score across tasks, nutrition, workouts, and mood check-ins.");
    }

    private void createProgress(User user, Goal goal, LocalDate date, String metric, double value, String unit, String notes) {
        ProgressTracker progress = new ProgressTracker();
        progress.setTenant(user.getTenant());
        progress.setUser(user);
        progress.setGoal(goal);
        progress.setTrackedDate(date);
        progress.setMetricName(metric);
        progress.setMetricValue(value);
        progress.setUnit(unit);
        progress.setNotes(notes);
        progressTrackerRepository.save(progress);
    }

    private void seedAiReport(User user, LocalDate today, int index, int proteinTarget, int carbsTarget) {
        AIReport report = new AIReport();
        report.setTenant(user.getTenant());
        report.setUser(user);
        report.setPeriodStart(today.minusDays(7));
        report.setPeriodEnd(today);
        report.setReportType(index % 2 == 0 ? "WEEKLY" : "WEEKLY_BACKGROUND");
        report.setStatus("READY");
        report.setContentJson("{\"summary\":\"Demo weekly report for " + user.getFullName()
                + ". Protein target: " + proteinTarget + "g, carbs target: " + carbsTarget
                + "g. Workouts, meals, mood and tasks have varied dated records.\",\"insights\":[\"Keep protein stable\",\"Protect deep work blocks\",\"Use recovery after high stress days\"]}");
        aiReportRepository.save(report);
    }

    private void seedNotifications(User user, int index) {
        Notification notification = new Notification();
        notification.setTenant(user.getTenant());
        notification.setUser(user);
        notification.setTitle(index % 2 == 0 ? "Daily plan ready" : "Weekly report generated");
        notification.setMessage(index % 2 == 0
                ? "Your demo daily plan includes tasks, workout, meals and reflection time."
                : "Your seeded weekly report is available in the AI reports section.");
        notification.setChannel("IN_APP");
        notification.setReadFlag(index % 3 == 0);
        notificationRepository.save(notification);
    }

    private String goalTitle(String focus) {
        if (focus.contains("fitness") || focus.contains("training")) {
            return "Improve training consistency";
        }
        if (focus.contains("nutrition")) {
            return "Maintain balanced macros";
        }
        if (focus.contains("mood") || focus.contains("wellbeing")) {
            return "Stabilize energy and stress";
        }
        if (focus.contains("planning") || focus.contains("operations")) {
            return "Complete priority work with focus";
        }
        return "Build a balanced weekly routine";
    }

    private List<WorkspaceSeed> workspaces() {
        return Arrays.asList(
                new WorkspaceSeed(
                        "NovaLife Wellness",
                        "novalife-wellness",
                        "wellbeing-balance",
                        "Elira Krasniqi",
                        "elira.krasniqi@novalife.test",
                        "NovaAdmin123!",
                        users(
                                user("Arben Gashi", "arben.gashi@novalife.test", "NovaUser101!"),
                                user("Leona Berisha", "leona.berisha@novalife.test", "NovaUser102!"),
                                user("Dren Hoxha", "dren.hoxha@novalife.test", "NovaUser103!"),
                                user("Mira Shala", "mira.shala@novalife.test", "NovaUser104!"),
                                user("Flamur Rexhepi", "flamur.rexhepi@novalife.test", "NovaUser105!"),
                                user("Jona Morina", "jona.morina@novalife.test", "NovaUser106!"),
                                user("Adrian Dervishi", "adrian.dervishi@novalife.test", "NovaUser107!"),
                                user("Nora Bytyqi", "nora.bytyqi@novalife.test", "NovaUser108!"),
                                user("Gentian Leka", "gentian.leka@novalife.test", "NovaUser109!")
                        )),
                new WorkspaceSeed(
                        "Horizon Productivity Lab",
                        "horizon-productivity-lab",
                        "deep-work-planning",
                        "Blerim Osmani",
                        "blerim.osmani@horizonlab.test",
                        "HorizonAdmin123!",
                        users(
                                user("Sara Kelmendi", "sara.kelmendi@horizonlab.test", "HorizonUser101!"),
                                user("Ilir Rugova", "ilir.rugova@horizonlab.test", "HorizonUser102!"),
                                user("Alma Dauti", "alma.dauti@horizonlab.test", "HorizonUser103!"),
                                user("Dion Meta", "dion.meta@horizonlab.test", "HorizonUser104!"),
                                user("Vesa Ahmeti", "vesa.ahmeti@horizonlab.test", "HorizonUser105!"),
                                user("Kreshnik Tahiri", "kreshnik.tahiri@horizonlab.test", "HorizonUser106!"),
                                user("Lira Selmani", "lira.selmani@horizonlab.test", "HorizonUser107!"),
                                user("Eron Kastrati", "eron.kastrati@horizonlab.test", "HorizonUser108!"),
                                user("Ariana Beka", "ariana.beka@horizonlab.test", "HorizonUser109!")
                        )),
                new WorkspaceSeed(
                        "VitalCore Studio",
                        "vitalcore-studio",
                        "fitness-nutrition",
                        "Teuta Marku",
                        "teuta.marku@vitalcore.test",
                        "VitalAdmin123!",
                        users(
                                user("Rron Qela", "rron.qela@vitalcore.test", "VitalUser101!"),
                                user("Dafina Pula", "dafina.pula@vitalcore.test", "VitalUser102!"),
                                user("Fisnik Hoti", "fisnik.hoti@vitalcore.test", "VitalUser103!"),
                                user("Era Krasniqi", "era.krasniqi@vitalcore.test", "VitalUser104!"),
                                user("Valon Shabani", "valon.shabani@vitalcore.test", "VitalUser105!"),
                                user("Arta Luma", "arta.luma@vitalcore.test", "VitalUser106!"),
                                user("Leon Maloku", "leon.maloku@vitalcore.test", "VitalUser107!"),
                                user("Blerta Gjoni", "blerta.gjoni@vitalcore.test", "VitalUser108!"),
                                user("Endrit Sopi", "endrit.sopi@vitalcore.test", "VitalUser109!")
                        )),
                new WorkspaceSeed(
                        "Mindful Metrics Hub",
                        "mindful-metrics-hub",
                        "mood-stress-awareness",
                        "Dardan Zeka",
                        "dardan.zeka@mindfulmetrics.test",
                        "MindfulAdmin123!",
                        users(
                                user("Lendita Halili", "lendita.halili@mindfulmetrics.test", "MindfulUser101!"),
                                user("Arianit Deda", "arianit.deda@mindfulmetrics.test", "MindfulUser102!"),
                                user("Melisa Rama", "melisa.rama@mindfulmetrics.test", "MindfulUser103!"),
                                user("Bujar Nushi", "bujar.nushi@mindfulmetrics.test", "MindfulUser104!"),
                                user("Nita Spahiu", "nita.spahiu@mindfulmetrics.test", "MindfulUser105!"),
                                user("Ermal Bytyci", "ermal.bytyci@mindfulmetrics.test", "MindfulUser106!"),
                                user("Diona Sylejmani", "diona.sylejmani@mindfulmetrics.test", "MindfulUser107!"),
                                user("Ardit Morina", "ardit.morina@mindfulmetrics.test", "MindfulUser108!"),
                                user("Kaltrina Beqiri", "kaltrina.beqiri@mindfulmetrics.test", "MindfulUser109!")
                        )),
                new WorkspaceSeed(
                        "Elevate Fitness Collective",
                        "elevate-fitness-collective",
                        "training-progress",
                        "Nora Statovci",
                        "nora.statovci@elevatefit.test",
                        "ElevateAdmin123!",
                        users(
                                user("Aulon Gashi", "aulon.gashi@elevatefit.test", "ElevateUser101!"),
                                user("Besa Koci", "besa.koci@elevatefit.test", "ElevateUser102!"),
                                user("Trim Krasniqi", "trim.krasniqi@elevatefit.test", "ElevateUser103!"),
                                user("Elmedina Berisha", "elmedina.berisha@elevatefit.test", "ElevateUser104!"),
                                user("Lorik Shala", "lorik.shala@elevatefit.test", "ElevateUser105!"),
                                user("Rina Dushi", "rina.dushi@elevatefit.test", "ElevateUser106!"),
                                user("Artan Sadiku", "artan.sadiku@elevatefit.test", "ElevateUser107!"),
                                user("Dafina Gega", "dafina.gega@elevatefit.test", "ElevateUser108!"),
                                user("Faton Syla", "faton.syla@elevatefit.test", "ElevateUser109!")
                        )),
                new WorkspaceSeed(
                        "BalanceForge Workspace",
                        "balanceforge-workspace",
                        "life-operations",
                        "Arlind Vokrri",
                        "arlind.vokrri@balanceforge.test",
                        "BalanceAdmin123!",
                        users(
                                user("Ema Jashari", "ema.jashari@balanceforge.test", "BalanceUser101!"),
                                user("Besart Hysa", "besart.hysa@balanceforge.test", "BalanceUser102!"),
                                user("Rea Kabashi", "rea.kabashi@balanceforge.test", "BalanceUser103!"),
                                user("Milot Zeneli", "milot.zeneli@balanceforge.test", "BalanceUser104!"),
                                user("Anisa Ismaili", "anisa.ismaili@balanceforge.test", "BalanceUser105!"),
                                user("Drilon Gashi", "drilon.gashi@balanceforge.test", "BalanceUser106!"),
                                user("Jeta Kryeziu", "jeta.kryeziu@balanceforge.test", "BalanceUser107!"),
                                user("Albin Reka", "albin.reka@balanceforge.test", "BalanceUser108!")
                        ))
        );
    }

    private List<UserSeed> users(UserSeed... users) {
        return Arrays.asList(users);
    }

    private UserSeed user(String name, String email, String password) {
        return new UserSeed(name, email, password);
    }

    private static class WorkspaceSeed {
        private final String name;
        private final String slug;
        private final String focus;
        private final String adminName;
        private final String adminEmail;
        private final String adminPassword;
        private final List<UserSeed> users;

        private WorkspaceSeed(String name, String slug, String focus, String adminName, String adminEmail,
                              String adminPassword, List<UserSeed> users) {
            this.name = name;
            this.slug = slug;
            this.focus = focus;
            this.adminName = adminName;
            this.adminEmail = adminEmail;
            this.adminPassword = adminPassword;
            this.users = users;
        }
    }

    private static class UserSeed {
        private final String name;
        private final String email;
        private final String password;

        private UserSeed(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }
    }
}
