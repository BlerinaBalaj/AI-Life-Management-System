#  AI Life Management System

> *Platforma jote personale e menaxhimit të jetës, e fuqizuar nga inteligjenca artificiale.*

Një sistem full-stack që bashkon menaxhimin e qëllimeve, detyrave, fitnesit, ushqyerjes, humorit dhe stresit në një dashboard të vetëm inteligjent. Çdo ndërveprim pasurohet nga një motor AI që njeh historinë e plotë të jetës tënde dhe ofron njohuri të personalizuara në kohë reale.

---

##  Çfarë e bën të veçantë

Shumica e aplikacioneve të produktivitetit gjurmojnë një gjë. Ky gjurmon gjithçka — dhe i lidh pikat.

Kur i pyet AI-n *"Pse po ndihem i lodhur këtë javë?"*, ai nuk merr me mend. Ngarkon 14 ditët e fundit të regjistrimeve të humorit, niveleve të stresit, detyrave të kryera, qëllimeve të humbura dhe frekuencës së stërvitjes — pastaj ndërton një përgjigje koherente me të dhënat e tua reale si kontekst.

---

## Stack Teknologjik

### Backend
- **Spring Boot 2.7.18** — framework kryesor
- **Java 11** — runtime
- **PostgreSQL 16** — baza kryesore e të dhënave
- **Redis 7** — cache layer
- **Flyway 8.5** — migrime të versionuara të skemës
- **Spring Security 5.7** — autentikim dhe autorizim
- **JJWT 0.11.5** — gjenerim/validim i tokenave JWT (HS256)
- **Groq API / Llama 3.3-70b** — inferenca e modelit gjuhësor

### Frontend
- **React 18.3** — framework UI
- **Vite 5.4** — build tool dhe dev server
- **React Router 6.28** — routing nga ana e klientit
- **Recharts 2.13** — vizualizim i të dhënave
- **Axios 1.7** — klient HTTP
- **Vitest 2.1.9** — testim i njësive

### Infrastruktura
- **Docker + Docker Compose** — konteinerizim
- **GitHub Actions** — CI/CD me punë paralele
- **Spring Boot Actuator** — monitorim i shëndetit të sistemit
- **SpringDoc OpenAPI** — dokumentacion i API-t (Swagger UI)

---

##  Si të nisësh projektin

### Kërkesat paraprake
- Java 11+
- Node.js 20+
- Docker Desktop
- Maven 3.8+ (ose IntelliJ IDEA)

### Hapi 1 — Nis infrastrukturën

```bash
git clone https://github.com/your-username/AI-Life-Management-System.git
cd AI-Life-Management-System

docker-compose up -d
```

Kjo nis **PostgreSQL 16** dhe **Redis 7** si kontejnerë Docker.

### Hapi 2 — Nis backend-in

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-DDB_USERNAME=x -DDB_PASSWORD=x"
```

Ose hap me **IntelliJ IDEA** dhe ekzekuto `AiLifeManagementApplication`.

Flyway ekzekuton automatikisht migrimet e bazës gjatë nisjes. Llogaria admin krijohet automatikisht.

Backend disponohet në: **http://localhost:8080**  
Swagger UI: **http://localhost:8080/swagger-ui.html**  
Kontrolli i shëndetit: **http://localhost:8080/actuator/health**

### Hapi 3 — Nis frontend-in

```bash
cd frontend
npm install
npm run dev
```

Frontend disponohet në: **http://localhost:5173**

---

##  Autentikimi

Sistemi përdor autentikim JWT pa gjendje (HS256, skadim 24 orë).

### Regjistro një llogari të re

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "123",
  "email": "123@example.com",
  "password": "SecurePass123!",
  "tenantName": "OrganizimiIm"
}
```

### Hyr dhe merr token-in

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "123@example.com",
  "password": "SecurePass123!"
}
```

Përdore token-in si Bearer në çdo kërkesë të mëpasshme:
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

---

## 📡 Endpoint-et kryesore të API-t

URL bazë: `http://localhost:8080/api`

### Autentikimi
- `POST /auth/register` — regjistrim i përdoruesit + krijim i tenant-it
- `POST /auth/login` — hyrje, kthen JWT
- `POST /auth/refresh` — rifreskim i token-it

### Funksionet kryesore
- `GET / POST /tasks` — listim / krijim i detyrave
- `GET / POST /goals` — listim / krijim i qëllimeve
- `GET / POST /fitness/workouts` — planet e stërvitjes
- `GET / POST /nutrition/plans` — planet e ushqyerjes
- `GET / POST /wellbeing/mood` — regjistrime të humorit
- `GET / POST /wellbeing/stress` — regjistrime të stresit
- `GET / POST /progress` — gjurmim i progresit

### Endpoint-et AI
- `POST /ai/chat` — chat me AI me kontekst të plotë të jetës
- `POST /ai/daily-plan` — gjenero planin e ditës
- `POST /ai/workout-suggestion` — sugjerim i personalizuar stërvitjeje
- `POST /ai/nutrition-suggestion` — sugjerim i personalizuar ushqyerje
- `POST /ai/mood-analysis` — analizë e trendit të humorit
- `POST /ai/weekly-report` — aktivizo raportin javor
- `GET /ai/reports` — lista e të gjitha raporteve AI
- `GET /ai/history` — historia e bisedave

### Sistemi
- `GET /actuator/health` — gjendja e sistemit (DB, Redis, Mail)
- `GET /actuator/metrics` — metrikat e aplikacionit

Dokumentacion i plotë interaktiv: **http://localhost:8080/swagger-ui.html**

---

##  Si funksionon motori AI

Çdo kërkesë `/ai/chat` kalon nëpër një pipeline me shumë hapa:

```
Mesazhi i përdoruesit
        │
        ▼
SmallTalkDetector ──► bisedë e rastit? ──► Përgjigje e shpejtë (pa pyetje DB)
        │
        ▼ pyetje kontekstuale
AiContextBuilder (7 burime të dhënash)
        ├── Qëllimet       (të gjitha qëllimet aktive)
        ├── Detyrat         (të gjitha detyrat)
        ├── Planet stërvitje
        ├── Planet ushqyerje
        ├── Regjistrime humori   (14 ditët e fundit)
        ├── Regjistrime stresi   (14 ditët e fundit)
        └── Progresi             (30 ditët e fundit)
        │
        ▼
Kontrollo cache Redis (çelës SHA-256) ──► goditje? ──► Përgjigje e ruajtur
        │
        ▼ cache miss
StructuredAiClient → Groq API (Llama 3.3-70b)
        │
        ▼
Ruaj në cache (TTL 30 min) → Kthehu te përdoruesi
```

---

## 🗄 Baza e të dhënave

Sistemi përdor **Flyway** për migrime të versionuara:

- **V1** — Skema e plotë: users, tenants, goals, tasks, fitness, nutrition, wellbeing, progress, raportet AI, njoftimet
- **V2** — Indekse të performancës në të gjitha çelësat e huaj dhe kolonat e pyetura zakonisht

Multi-tenancy zbatohet në nivelin Hibernate duke përdorur `@FilterDef` — çdo pyetje përfshin automatikisht filtrin `tenant_id`, duke e bërë rrjedhjen e të dhënave ndër-tenant strukturalisht të pamundur.

---

##  Variablat e mjedisit

- `DB_URL` — URL-ja e lidhjes me PostgreSQL (default: `jdbc:postgresql://localhost:5432/ai_life_management`)
- `DB_USERNAME` — emri i përdoruesit të bazës *(i detyrueshëm)*
- `DB_PASSWORD` — fjalëkalimi i bazës *(i detyrueshëm)*
- `JWT_SECRET` — çelësi i nënshkrimit JWT (min 64 karaktere)
- `JWT_EXPIRATION_MINUTES` — jetëgjatësia e token-it, default `1440` (24 orë)
- `GROQ_API_KEY` — çelësi i API Groq *(i detyrueshëm për AI)*
- `GROQ_MODEL` — identifikuesi i modelit, default `llama-3.3-70b-versatile`
- `REDIS_HOST` — host-i Redis, default `localhost`
- `REDIS_PORT` — porta Redis, default `6379`
- `CORS_ALLOWED_ORIGINS` — origjinet e lejuara, default `http://localhost:5173`
- `MAIL_HOST` — host-i SMTP, default `smtp.gmail.com`
- `MAIL_USERNAME` / `MAIL_PASSWORD` — kredencialet SMTP *(opsionale)*

---

##  Testimi

### Teste frontend — 90 teste, 7 suite (Vitest)

```bash
cd frontend
npm run test
```

Mbulimi i testeve: `StatCard`, `Header`, `AuthContext`, `Dashboard`, `Fitness`, `MoodStress`, `Nutrition`.

### Teste backend — 4 teste (JUnit 5)

```bash
cd backend
mvn test
```

### Me raport mbulimi

```bash
# Frontend
npm run test:coverage

# Backend
mvn test jacoco:report
```

---

##  CI/CD Pipeline

Çdo push në `main` dhe çdo pull request aktivizon dy punë paralele GitHub Actions:

**Puna A — backend-test**
1. Shkarko kodin
2. Instalo JDK 21 (Temurin)
3. Cache varësitë Maven
4. `mvn test` — ekzekuto 4 teste JUnit 5
5. Ngarko artifaktin JAR (ruhet 7 ditë)

**Puna B — frontend-test**
1. Shkarko kodin
2. Instalo Node 20
3. `npm ci` me cache Vitest
4. `vitest run` — ekzekuto 90 teste në 7 suite
5. `vite build` — build i plotë prodhimi (2,454 module)

**Dera e bashkimit:** të dyja punët duhet të kalojnë. Nëse njëra dështon, dega bllokohet.

---

##  Struktura e projektit

```
AI-Life-Management-System/
├── backend/
│   └── src/main/java/com/ailife/management/
│       ├── ai/           # Shërbimi AI, ndërtues konteksti, cron job
│       ├── auth/         # Regjistrim, hyrje, JWT
│       ├── common/       # DTO, mapper, klasa bazë
│       ├── config/       # CORS, cache, seeder
│       ├── fitness/      # Planet dhe regjistret e stërvitjes
│       ├── goal/         # Menaxhimi i qëllimeve
│       ├── notification/ # Njoftime brenda aplikacionit + email
│       ├── nutrition/    # Planet dhe regjistret e ushqyerjes
│       ├── planning/     # Detyrat dhe planifikimi
│       ├── progress/     # Gjurmues i progresit
│       ├── security/     # Filtri JWT, SecurityConfig
│       ├── tenant/       # Izolim multi-tenant
│       ├── user/         # Entiteti dhe menaxhimi i përdoruesit
│       └── wellbeing/    # Gjurmim i humorit dhe stresit
├── frontend/
│   └── src/
│       ├── components/   # StatCard, Header, grafikë
│       ├── context/      # AuthContext (menaxhim JWT)
│       ├── pages/        # Dashboard, Fitness, Ushqyerje, Humor...
│       └── services/     # Shtresa e shërbimit Axios API
├── docker-compose.yml    # PostgreSQL 16 + Redis 7
└── README.md
```

---
