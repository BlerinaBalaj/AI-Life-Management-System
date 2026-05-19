# REST API Endpoints

Swagger UI documents and tests all endpoints:

```text
http://localhost:8080/swagger-ui.html
```

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

## Users and Admin

- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/me/preferences`
- `POST /api/users/me/preferences`
- `GET /api/admin/users`
- `PUT /api/admin/users/{id}/role`
- `DELETE /api/admin/users/{id}`

## Goals and Planning

- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/{id}`
- `DELETE /api/goals/{id}`
- `GET /api/daily-plans`
- `POST /api/daily-plans`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/habits`
- `POST /api/habits`
- `POST /api/habits/{id}/logs`

## Fitness

- `GET /api/workouts`
- `POST /api/workouts`
- `GET /api/workout-sessions`
- `POST /api/workout-sessions`

## Nutrition

- `GET /api/nutrition-plans`
- `POST /api/nutrition-plans`
- `GET /api/food-logs`
- `POST /api/food-logs`

## Mood, Stress, Progress

- `GET /api/mood-logs`
- `POST /api/mood-logs`
- `GET /api/stress-logs`
- `POST /api/stress-logs`
- `GET /api/progress`
- `POST /api/progress`

## AI

- `POST /api/ai/chat`
- `POST /api/ai/analyze-text`
- `POST /api/ai/daily-plan`
- `POST /api/ai/workout-suggestion`
- `POST /api/ai/nutrition-suggestion`
- `POST /api/ai/mood-analysis`
- `POST /api/ai/weekly-report`
- `GET /api/ai/reports`
- `GET /api/ai/reports/{id}`
- `GET /api/ai/history`
- `GET /api/ai/conversations`
- `GET /api/ai/conversations/{id}/messages`

## Search and Filtering

- `GET /api/search/tasks?query=&status=`
- `GET /api/search/workouts?query=&difficulty=`
- `GET /api/search/nutrition?query=&maxCalories=`
- `GET /api/search/mood-logs?minScore=`
- `GET /api/search/ai-reports?type=`

## Notifications

- `GET /api/notifications`
- `PUT /api/notifications/{id}/read`
