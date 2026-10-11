# [IAN] Client Portal — Code Structure

This is the current plain-local React + TypeScript frontend. It intentionally uses mock services so a future backend can replace data access without rebuilding the UI.

## Repository tree

```text
ian-client-portal/
├── index.html                 # Vite document shell and page metadata
├── package.json               # React, Vite, TypeScript and Lucide dependencies
├── package-lock.json          # Locked npm dependency graph
├── tsconfig.json              # Strict TypeScript configuration
├── vite.config.ts             # React plugin and shared preview host config
├── ideas.md                   # Accepted visual direction and design tokens
├── BACKEND-DATA-LABELS.md     # Backend agent handoff: labels and API contract
├── CODE-STRUCTURE.md          # This architecture reference
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # Portal shell, navigation and page compositions
    ├── components/
    │   ├── PortalPrimitives.tsx # PageIntro, StatusBadge, ProgressRing
    │   ├── IntakeFlow.tsx        # Simple mobile-first intake flow
    │   ├── AdminPortal.tsx       # Admin directory, detail and template manager
    │   └── ThemeToggle.tsx       # Shared dark/light theme control
    ├── content/
    │   └── intake-templates.md  # Editable business-type intake sections
    ├── styles.css             # Responsive design system and Canva-derived styles
    └── services/
        └── mockPortal.ts      # Typed models, mock snapshot and service methods
```

## Frontend layers

### `src/main.tsx`

Bootstraps React and imports the global stylesheet. It is the only file that mounts the application into `#root`.

### `src/App.tsx`

Owns the current portal composition:

- `App` — hash-based local route state and page switch
- `Sidebar` — desktop navigation
- `Topbar` / `MobileMenu` — responsive navigation
- Shared composition: `Timeline`; reusable primitives are imported from `src/components/PortalPrimitives.tsx`
- Client pages: overview, onboarding, intake, files, brand, project, agreement, invoices and handover

Page compositions remain together for fast visual iteration, while shared primitives and the intake flow now have explicit reusable component boundaries.

### `src/components/PortalPrimitives.tsx`

Reusable UI primitives used by multiple page compositions: `PageIntro`, `StatusBadge`, and `ProgressRing`.

### `src/components/IntakeFlow.tsx`

Owns the simplified one-question-at-a-time intake interaction: progress, answer controls, autosave state, and mobile action controls. It receives the typed snapshot and change handler as props.

### `src/components/AdminPortal.tsx`

Provides the admin-facing directory at `#/admin/clients` and detail routes at `#/admin/clients/:clientId`. It includes searchable client records, status filters, progress, intake completion, due dates, last activity, and a client detail overview.

The directory also includes the Markdown template manager. Edit `src/content/intake-templates.md` directly in the editor or use the embedded source editor, create a new business-type template, select existing templates as buttons or from the dropdown, then assign a parsed template to any listed client. Assignments are stored per client in local storage for this prototype.

### `src/components/ThemeToggle.tsx`

Shared theme control used by the client intake, client portal top bar, and admin top bar. The selected mode is stored as `ian-theme` and applied through `data-theme` overrides in `src/styles.css`.

### `src/services/mockPortal.ts`

The UI does not fetch static objects directly. It consumes the `portalService` interface:

```ts
portalService.getSnapshot()
portalService.saveIntakeAnswer(index, value)
portalService.approve(label)
```

The mock layer includes typed models for:

- `PortalPage`
- `PhaseState`
- `Phase`
- `FileAsset`
- `IntakeQuestion`
- `PortalSnapshot`

The portal snapshot resolves the assigned intake template for the current client before rendering the intake flow.

### `src/services/intakeTemplates.ts`

Parses the editable Markdown source into typed templates and sections. The format uses `##` for a business type, `###` for a question, and simple `- question`, `- helper`, `- type`, and `- options` fields. This keeps adding or removing questions readable for future editing.

A future implementation can replace this file with API-backed modules such as:

```text
src/services/
├── auth/
├── clients/
├── projects/
├── intake/
├── files/
├── palettes/
├── brandBoards/
├── agreements/
├── invoices/
├── approvals/
├── comments/
└── notifications/
```

## Current route map

The prototype uses hash routes so it works as a static local frontend without a backend router:

| Route | View |
|---|---|
| `#/home` | Client overview |
| `#/onboarding` | Master onboarding checklist |
| `#/intake` | One-question-at-a-time website intake |
| `#/files` | Files and assets workspace |
| `#/brand` | Brand direction and approval board |
| `#/project` | Project milestones and progress |
| `#/agreement` | Agreement view and signature record layout |
| `#/invoices` | Read-only invoice view |
| `#/handover` | Final delivery and handover |
| `#/admin/clients` | Admin client directory |
| `#/admin/clients/:clientId` | Admin client detail |

The production route contract should become `/client/*` and `/admin/*` once the existing [IAN] website router and authentication system are available.

## Design system direction

`src/styles.css` translates the supplied Canva references into reusable CSS rules:

- near-black `#080808` canvas
- white and soft-grey type
- fine `#2d2d2b` rules
- compact uppercase mono labels
- square editorial controls
- mobile-first stacked layouts
- desktop sidebar with responsive mobile menu

The agreement, invoice and welcome surfaces are intentionally document-like rather than dense SaaS cards.

## Backend handoff contract

The future backend must provide authorization and persistence for:

- authenticated client/admin sessions
- project and client records using opaque identifiers
- intake autosave, submission and reopen state
- file validation, upload progress and storage URLs
- palette and brand board revisions
- agreements and signature records
- invoice records and payment status
- milestone state and activity history
- contextual comments and approvals
- notifications

The frontend must remain presentation-only for permissions. It must not be treated as the security boundary.

## Local commands

```bash
npm install
npm run dev -- --port 4173
npm run check
npm run build
```
