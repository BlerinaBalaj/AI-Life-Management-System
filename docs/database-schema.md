# Database Schema

The database is relational and managed by Flyway migration:

```text
backend/src/main/resources/db/migration/V1__initial_schema.sql
```

## Core Tables

- `tenants`: workspace or user tenant boundary
- `roles`: USER and ADMIN
- `users`: authenticated accounts
- `user_profiles`: profile and health metadata
- `preferences`: user settings
- `categories`: reusable categorization

## Planning Tables

- `goals`
- `daily_plans`
- `tasks`
- `habits`
- `habit_logs`

## Fitness Tables

- `exercises`
- `workout_plans`
- `workout_sessions`

## Nutrition Tables

- `nutrition_plans`
- `meal_suggestions`
- `food_logs`

## Wellbeing and Progress Tables

- `mood_logs`
- `stress_logs`
- `progress_trackers`

## AI and System Tables

- `ai_reports`
- `ai_conversations`
- `ai_messages`
- `ai_request_logs`
- `notifications`
- `system_logs`

All user-owned tables include `tenant_id` and `user_id` where appropriate.
