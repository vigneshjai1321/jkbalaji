console.log(`
@jkbalaji/admin-panel is a workspace alias — not a separate Next.js app.

Admin routes:     apps/real-estate-web/src/app/admin/**
Admin components: apps/real-estate-web/src/components/admin/**
API:              backend/api (NestJS) — /api/v1/admin/*
Production URL:   https://admin.jkbalaji.in (middleware rewrites to /admin)
Local dev:        npm run dev -w @jkbalaji/real-estate-web → http://localhost:3000/admin
`);
