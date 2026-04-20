# Frontend API Contract

## Requests the frontend already makes

The React frontend currently sends these HTTP requests:

- `POST /auth/login`
  - Body: `{ username, password, theme, language }`
  - Expects:
    - JSON body: `{ id, username, role, theme, language }`
    - `Authorization` response header with `Bearer <jwt>`
- `POST /auth/register`
  - Body: `{ username, password, theme?, language? }`
  - Expects:
    - JSON body: `{ id, username, role, theme, language }`
- `POST /auth/logout`
  - Body: `{ theme }`
  - Expects authenticated request to succeed
- `PUT /users/update-username`
  - Body: `{ newUsername }`
- `DELETE /users/delete/{id}`

## Planner endpoints implied by the frontend mock service

The planner UI is currently backed by `frontend/src/services/api.ts`, which still uses local storage. Those function signatures imply the following REST surface:

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/{id}`
- `GET /subjects`
- `GET /subjects/{id}`
- `POST /subjects`
- `GET /study-plans/{plan_date}`

## DB mapping decisions

The SQL schema already defines:

- `users`
- `subjects`
- `tasks`
- `study_plans`
- `study_sessions`
- `session_tasks`
- `user_subjects`

The frontend also needs persisted UI settings not present in the schema, so the backend adds:

- `user_preferences(user_id, theme, language, role)`

This keeps the original schema intact while satisfying the frontend contract.
