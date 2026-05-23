CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    name VARCHAR(120) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    role_id BIGINT NOT NULL REFERENCES roles(id),
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(180) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    height_cm INTEGER,
    weight_kg INTEGER,
    activity_level VARCHAR(80),
    primary_focus VARCHAR(80)
);

CREATE TABLE preferences (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(80) NOT NULL,
    preference_value VARCHAR(500) NOT NULL
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    name VARCHAR(120) NOT NULL,
    type VARCHAR(40) NOT NULL,
    color VARCHAR(20)
);

CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    title VARCHAR(160) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(40) NOT NULL,
    priority INTEGER NOT NULL,
    target_date DATE
);

CREATE TABLE daily_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    title VARCHAR(160) NOT NULL,
    summary VARCHAR(2000),
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_plan_id BIGINT REFERENCES daily_plans(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES categories(id),
    title VARCHAR(180) NOT NULL,
    description VARCHAR(1200),
    status VARCHAR(40) NOT NULL,
    priority INTEGER NOT NULL,
    due_date DATE,
    start_time TIME,
    end_time TIME
);

CREATE TABLE habits (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    frequency VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE habit_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    completed BOOLEAN NOT NULL,
    notes VARCHAR(600)
);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    name VARCHAR(120) NOT NULL,
    muscle_group VARCHAR(80) NOT NULL,
    equipment VARCHAR(80),
    instructions VARCHAR(1000)
);

CREATE TABLE workout_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(2000),
    difficulty VARCHAR(60) NOT NULL,
    days_per_week INTEGER NOT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE workout_sessions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_plan_id BIGINT REFERENCES workout_plans(id) ON DELETE SET NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    notes VARCHAR(1000)
);

CREATE TABLE nutrition_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(2000),
    daily_calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE meal_suggestions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nutrition_plan_id BIGINT REFERENCES nutrition_plans(id) ON DELETE SET NULL,
    meal_type VARCHAR(120) NOT NULL,
    title VARCHAR(160) NOT NULL,
    ingredients VARCHAR(1200),
    calories INTEGER,
    protein_grams INTEGER
);

CREATE TABLE food_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consumed_at TIMESTAMP NOT NULL,
    food_name VARCHAR(160) NOT NULL,
    meal_type VARCHAR(80),
    calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER
);

CREATE TABLE mood_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP NOT NULL,
    mood_score INTEGER NOT NULL,
    mood_label VARCHAR(80),
    journal_text VARCHAR(1500),
    ai_analysis VARCHAR(1200)
);

CREATE TABLE stress_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP NOT NULL,
    stress_level INTEGER NOT NULL,
    trigger VARCHAR(120),
    coping_action VARCHAR(1000)
);

CREATE TABLE progress_trackers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT REFERENCES goals(id) ON DELETE SET NULL,
    tracked_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(40),
    notes VARCHAR(800)
);

CREATE TABLE ai_reports (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_type VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL,
    content_json TEXT
);

CREATE TABLE ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    channel VARCHAR(40) NOT NULL
);

CREATE TABLE ai_messages (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(30) NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE ai_request_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(80) NOT NULL,
    model VARCHAR(120) NOT NULL,
    input_json TEXT,
    output_json TEXT,
    successful BOOLEAN NOT NULL,
    error_message VARCHAR(1000)
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    channel VARCHAR(40) NOT NULL,
    read_flag BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL,
    severity VARCHAR(40) NOT NULL,
    message VARCHAR(1200) NOT NULL
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_tasks_user_tenant ON tasks(user_id, tenant_id);
CREATE INDEX idx_mood_user_tenant ON mood_logs(user_id, tenant_id);
CREATE INDEX idx_ai_reports_user_tenant ON ai_reports(user_id, tenant_id);
