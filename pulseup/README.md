# PulseUp Frontend

This is the frontend-only PulseUp React/Vite project. API requests are handled by a local mock adapter in `src/api/mockApi.js`; no backend server is required and no real API requests are sent.

## Run locally
1. Install Node.js (LTS).
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the localhost URL printed by Vite.

## Demo behaviour
- Login and registration are simulated in the browser.
- Use any non-empty email and password to preview a dashboard. Emails containing `admin` open the admin role; emails containing `staff`, `nurse`, or `clinic` open the staff role; other emails open the student role.
- Registration and profile/demo data are stored in this browser's local storage only.
- Appointment, time-slot, health-quest, and voucher actions use sample browser data.
- Email verification, notifications sent by email, real authentication, database persistence, and actual clinic operations require the backend and are intentionally not implemented here.

## Backend handoff
When the backend team is ready, they can replace `src/api/mockApi.js` and `src/api/api.js` with the agreed API integration. The mock data is for frontend layout and interaction testing only and is not secure or suitable for real user/medical data.
