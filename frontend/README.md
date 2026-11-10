# Security System — Parent / Trusted Person Frontend

Interface for parents and trusted persons in the school access-control
system: log in, see linked children and their verification status,
and generate a one-time QR code once approved.

This is the **Parent interface only**. Security and Admin interfaces
come next, as separate route groups in the same app (or separate apps —
to be decided together).

No backend calls are made yet — everything runs on mock data so the UI
can be reviewed and iterated on independently of the FastAPI backend.

## Stack

- React 18 + TypeScript
- Vite
- react-router-dom
- qrcode.react (renders the QR as an SVG client-side)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. On the login screen, sign in with any
password using one of the demo accounts:

| Email | Role | Status |
|---|---|---|
| `aigerim.satpayeva@example.kz` | PARENT | has one APPROVED child and one PENDING child |
| `daniyar.akhmetov@example.kz` | TRUSTED_PERSON | has one REJECTED child |

## Project structure

```
src/
├── components/       # StatusBadge, StudentCard, QRDisplay, Layout, ProtectedRoute
├── pages/            # LoginPage, DashboardPage, StudentDetailPage
├── services/api/     # login, guardian, and QR service functions + fetch client
├── types/            # TypeScript types mirroring the Postgres schema
├── mock/             # In-memory mock data standing in for the 6 DB tables
├── context/          # AuthContext (session state)
├── hooks/            # useAuth, useCountdown
├── App.tsx           # Routes
└── main.tsx          # Entry point
```

## How this maps to the database schema

`types/` mirrors the six tables 1:1 (camelCase instead of snake_case):
`user.ts` → `users`, `student.ts` → `students`,
`guardianStudent.ts` → `guardian_student` (plus a `GuardianStudentWithDetails`
convenience type that joins in the `student`), `qrCode.ts` → `qr_codes`,
`verificationRequest.ts` → `verification_requests`. `access_logs` isn't
needed by the Parent UI and will be added when we build the Security
interface.

## Swapping mock data for the real FastAPI backend

Only `src/services/api/*.ts` needs to change — nothing in `pages/` or
`components/` talks to mock data or `fetch` directly.

1. Set `VITE_API_BASE_URL` in a `.env` file (see `.env.example`).
2. In each service function (`authService.ts`, `guardianService.ts`,
   `qrService.ts`), replace the mock body with the `apiRequest(...)`
   call already sketched in a comment above each function, e.g.:

   ```ts
   // before (mock)
   export async function getMyChildren(guardianId: string) { ... }

   // after (real API)
   export async function getMyChildren(guardianId: string) {
     return apiRequest<GuardianStudentWithDetails[]>(`/guardians/${guardianId}/children`, { token });
   }
   ```
3. Delete or stop importing `src/mock/*` once nothing references it.

`AuthContext` stores `{ user, token }` from `login()` in
`localStorage` and passes `token` through — the request layer already
expects a bearer token, so wiring up real auth is a matter of the
backend issuing one (e.g. via PyJWT) that `login()` returns.

## Business rules already encoded in the UI

- The "Generate QR" button only appears when `verificationStatus === 'APPROVED'`.
  PENDING and REJECTED show an explanatory notice instead, per the spec.
- A generated QR shows a live countdown and flips to an "expired" look
  client-side once its `expiresAt` passes — this is a display
  convenience only; the backend must independently re-validate
  expiry, one-time use, and approval status on every scan.
- QR status colors follow the same badge component used for
  verification status, so `ACTIVE`/`APPROVED` are visually consistent
  across the app.

## Next steps

- Security interface: QR scan screen + access_logs.
- Admin interface: verification request queue, APPROVE/REJECT.
- Wire `services/api` to the real FastAPI endpoints once they exist.
