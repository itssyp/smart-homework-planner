# Smart Homework Planner

Smart Homework Planner is an intelligent web-based study assistant designed to help students plan, prioritize, and optimize their homework and study tasks.

Unlike traditional task managers, the system automatically generates a personalized daily study schedule based on deadlines, task difficulty, available study time, and user preferences. The goal is to reduce procrastination, improve time management, and make academic workload transparent and manageable.

The platform combines task management, smart prioritization, automated scheduling, and learning analytics in a single system.

## Tech Stack

- Frontend: TypeScript + React
- Backend: Python

## Core Capabilities

- Intelligent task prioritization
- Automated daily study schedule generation
- Personalized workload balancing
- Learning behavior analytics
- Deadline risk detection

The system adapts to each student's available time, task difficulty, and urgency, turning academic pressure into a structured, manageable plan.

## Team Members

- Bárány Szilveszter (F1A3Y6)
- Ecsédi András (DLZTAT)
- Halász Eszter (H6OA5V)
- Molnár Kitti (V71LRE)
- Végh Ákos (J7WI6P)

## Suggested Collaboration Roles

To bring the idea to life, the following responsibilities are important in the project workflow:

- Frontend Developer (React/Angular): builds the user interface and interactive dashboard
- Backend Developer (Node.js / Python / Java Spring): develops APIs and scheduling logic
- Database/Backend Engineer: handles data modeling and optimization
- UX/UI Designer: defines user experience and interface design
- DevOps / Cloud Engineer: manages deployment, infrastructure, and CI/CD

Students interested in intelligent systems, productivity tools, and scalable web platforms are highly encouraged to join and contribute.

## Git Branch Convention

Use short-lived feature branches and merge via pull requests.

- `main`: stable, releasable code
- `feature/<short-description>`: new features
- `fix/<short-description>`: bug fixes
- `docs/<short-description>`: documentation updates
- `chore/<short-description>`: maintenance/config tasks

Optional:

- `develop`: integration branch for ongoing development before promoting to `main`

Examples:

- `feature/smart-scheduler-algorithm`
- `fix/calendar-conflict-detection`
- `docs/readme-update`

When to use `develop`:

- Use `develop` if the team merges many parallel features and wants a shared pre-release integration branch
- Skip `develop` if the team is small and can use a simple flow: `feature/*` -> `main` via reviewed pull requests

## 2. Commits

Specify the type of commit:

- `feat`: The new feature you're adding to a particular application
- `fix`: A bug fix
- `style`: Feature and updates related to styling
- `refactor`: Refactoring a specific section of the codebase
- `test`: Everything related to testing
- `docs`: Everything related to documentation
- `chore`: Regular code maintenance

Commit message rules:

- Do not end the subject line with a period
- Capitalize the subject line and each paragraph
- Use the imperative mood in the subject line

Examples:

- `feat: Add daily schedule generator`
- `fix: Correct task priority score calculation`
- `docs: Update team responsibilities in README`
- `chore: Update linting configuration`

## 3. Pull Requests

- Every pull request must be reviewed before merging into the `main` branch

