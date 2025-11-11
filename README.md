# analytics-api-anshu

This is a ready-to-run scaffold for the Website Analytics backend.

## Quickstart (Docker)

1. Copy `.env.example` to `.env` and edit if necessary.
2. Build and run:
```bash
docker-compose up --build -d
```
3. Apply DB schema:
```bash
docker-compose exec api npm run migrate
```
4. Visit:
- Health: http://localhost:3000/healthz
- Swagger docs: http://localhost:3000/docs

## API
- POST /api/auth/register
- GET /api/auth/api-key
- POST /api/auth/revoke
- POST /api/auth/regenerate
- POST /api/analytics/collect
- GET /api/analytics/event-summary
- GET /api/analytics/user-stats

## Notes
- Save the generated API key at registration time; it's shown only once.
- For production, set proper DATABASE_URL and REDIS_URL and secure env vars.
