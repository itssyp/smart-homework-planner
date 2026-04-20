# Smart Homework Planner Backend

This backend is a FastAPI service that matches the frontend's current auth contract and the planner data model implied by the React mock service.

## What it serves

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `PUT /users/update-username`
- `DELETE /users/delete/{id}`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/{id}`
- `GET /subjects`
- `GET /subjects/{id}`
- `POST /subjects`
- `GET /study-plans/{plan_date}`
- `GET /health`

## Frontend contract notes

- Login returns the JWT in the `Authorization` response header as `Bearer <token>`.
- Protected endpoints accept the token through the `Authorization: Bearer ...` request header.
- Auth responses return:
  - `username`
  - `id`
  - `role`
  - `theme`
  - `language`

## Schema compatibility

The existing SQL schema in [`db/planner_schema.sql`](../db/planner_schema.sql) is treated as the base schema.

The frontend also expects persisted UI preferences, but the base schema has no place for them. This backend therefore creates one small compatibility table on startup:

- `user_preferences`

That table stores `theme`, `language`, and `role` per user without mutating the original project schema.

## Setup

1. Create and seed PostgreSQL using the scripts in [`db/`](../db).
2. Copy `.env.example` to `.env` and adjust values.
3. Install dependencies:

```powershell
py -m pip install -r backend\requirements.txt
```

4. Run the API:

```powershell
py -m uvicorn backend.app.main:app --reload --port 8080
```

The frontend is already configured to call `http://localhost:8080`.
