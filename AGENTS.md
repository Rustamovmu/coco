# AGENTS.md

## Change-control policy

- Before creating, editing, renaming, or deleting any file, explain the target file(s), intended changes, and planned validation.
- Wait for the user's explicit approval before making any file modification.
- After every approved modification, report the exact files changed, a concise description of the change, and validation performed.
- Carefully read the relevant source before proposing a change, and call out API, schema, security, and UI impacts where applicable.

## Project overview

- Stack: TypeScript, Express, EJS, Mongoose/MongoDB, express-session.
- Entry point: `src/server.ts`.
- App setup: `src/app.ts`.
- Public API routes: `src/router.ts`.
- Admin/session/product routes: `src/router.admin.ts`.
- Controllers: `src/controllers/`.
- Database schemas: `src/schema/`.
- Services: `src/models/`.
- Views and static files: `src/views/` and `src/public/`.

## Safe validation

- Prefer the non-writing type check: `./node_modules/.bin/tsc --noEmit`.
- Treat commands that generate files or modify the repository as changes requiring prior approval.
