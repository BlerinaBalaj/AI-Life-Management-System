CREATE INDEX IF NOT EXISTS idx_tasks_search_tenant_user_status
    ON tasks(tenant_id, user_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_search_title_lower
    ON tasks(tenant_id, user_id, lower(title));

CREATE INDEX IF NOT EXISTS idx_workout_plans_search
    ON workout_plans(tenant_id, user_id, difficulty);

CREATE INDEX IF NOT EXISTS idx_workout_plans_title_lower
    ON workout_plans(tenant_id, user_id, lower(title));

CREATE INDEX IF NOT EXISTS idx_nutrition_plans_search
    ON nutrition_plans(tenant_id, user_id, daily_calories);

CREATE INDEX IF NOT EXISTS idx_nutrition_plans_title_lower
    ON nutrition_plans(tenant_id, user_id, lower(title));

CREATE INDEX IF NOT EXISTS idx_mood_logs_search
    ON mood_logs(tenant_id, user_id, logged_at, mood_score);

CREATE INDEX IF NOT EXISTS idx_ai_reports_search
    ON ai_reports(tenant_id, user_id, report_type, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
    ON ai_messages(tenant_id, user_id, conversation_id, created_at);

ALTER TABLE mood_logs
    ADD CONSTRAINT chk_mood_logs_score_range CHECK (mood_score BETWEEN 1 AND 10) NOT VALID;

ALTER TABLE stress_logs
    ADD CONSTRAINT chk_stress_logs_level_range CHECK (stress_level BETWEEN 1 AND 10) NOT VALID;

ALTER TABLE workout_plans
    ADD CONSTRAINT chk_workout_plans_days_range CHECK (days_per_week BETWEEN 1 AND 7) NOT VALID;

CREATE INDEX IF NOT EXISTS idx_preferences_user_key
    ON preferences(tenant_id, user_id, preference_key);

CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date
    ON daily_plans(tenant_id, user_id, plan_date);
