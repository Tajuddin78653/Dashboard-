# TradeDash Frontend — Changelog

All notable changes are documented here. Each version is tagged in Git for instant rollback.

---

## [v1.1-dhan] — 2025
### Added
- `📄 Paper` / `🟢 Dhan Live` trading mode badge in TopBar — visible on all pages
- **Broker tab** in Admin Console — shows trading mode, Dhan credentials status (masked), connection status
- **Dhan Order ID** column in Open Positions (desktop) — hidden in paper mode
- **Dhan Order ID** line in mobile card view — shown only in live mode

### Fixed
- Avatar now reads logged-in user's real name from JWT token (was hardcoded "Tajuddin")
- Avatar dropdown with name, email, role badge, Profile and Sign Out actions
- Notification bell — removed hardcoded badge count `3`
- Sidebar logout button now actually logs out and redirects to /login
- Sidebar username and role now read from JWT (was hardcoded)
- **Admin → Users tab** — fully wired to real API (`GET /users`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`)
- Add User button opens modal with form (name, email, password, role)
- Edit (pencil) button opens pre-filled modal to update name, role, active status
- Delete (trash) button shows confirmation then calls API
- **Role-based nav guard** — Admin tab hidden from non-admin users (trader/viewer roles)

---

## [v1.0-sigma] — 2025
### Initial Production Release
- Full dashboard with equity curve + strategy performance charts
- Live Signals page with real API, pagination, strategy names
- Open Positions page with live MTM, P&L%, SL, Target, manual exit
- Trade History with filters, P&L summary, pagination
- Analytics page — monthly P&L, equity curve, strategy breakdown
- Reports page with date/strategy filters
- Admin Console — Webhook URLs (UUID tokens), Telegram config, Audit Logs
- IST-aware Market Open/Closed indicator in TopBar
- JWT auth with role-based access (admin / trader / viewer)
- Auth guard — redirects to /login if no valid token
