# Periskope Take-Home Technical Specification

## 1. Objective

Build a WhatsApp group management interface clone using Next.js, Tailwind CSS, TypeScript, and Supabase.

The UI must include:

- Sidebar (navigation UI only)
- Group table (scrollable, clickable rows)
- Side panel (UI-only details view)

## 2. Scope

### In Scope

- Next.js 13+ app using App Router
- Tailwind-based responsive UI
- Supabase-backed group list data
- Row selection behavior to drive side panel content
- Local setup documentation and deployment

### Out of Scope

- Functional routing from sidebar links
- Real WhatsApp integration
- Full feature parity with the reference screenshot
- Auth and role management

## 3. Functional Requirements

1. Render a three-area layout: sidebar, main table area, and right side panel.
2. Fetch group records from Supabase and display them in a scrollable table/list.
3. Support clickable rows in the table.
4. Display selected row details in the side panel (UI-level interaction).
5. Handle loading and empty states gracefully.

## 4. Non-Functional Requirements

- Use TypeScript across app code.
- Maintain clean, reusable component structure.
- Keep UI responsive for desktop and smaller screens.
- Keep implementation simple and interview-friendly.

## 5. Proposed Architecture

### Frontend

- Framework: Next.js 13+ (App Router)
- Styling: Tailwind CSS
- Language: TypeScript
- Page composition:
  - `app/page.tsx`: root layout container for this screen
  - `components/Sidebar.tsx`
  - `components/GroupsTable.tsx`
  - `components/DetailsPanel.tsx`

### Data Layer

- Supabase PostgreSQL as source of truth.
- Server-side data fetch in App Router where possible.
- Shared Supabase client helper in `lib/supabase.ts`.

## 6. Data Model (Supabase)

Primary tables:

### `groups`

- `id` (uuid, primary key, default generated)
- `name` (text, not null)
- `label` (text, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### `members`

- `id` (uuid, primary key, default generated)
- `name` (text, not null)
- `phone_number` (text, unique, not null)
- `created_at` (timestamptz, default now())

### `group_members` (join table)

- `group_id` (uuid, references `groups.id`, not null)
- `member_id` (uuid, references `members.id`, not null)
- `joined_at` (timestamptz, default now())
- `role` (text, default `'member'`)

Constraints:

- Composite primary key: (`group_id`, `member_id`)

### `messages`

- `id` (uuid, primary key, default generated)
- `group_id` (uuid, references `groups.id`, not null)
- `from_member_id` (uuid, references `members.id`, not null)
- `content` (text, not null)
- `sent_at` (timestamptz, default now())

Notes:

- `to_id` is not required for group messages.
- If group activity logs are needed beyond messages, add `group_logs` as a separate table.

Indexes:

- `members.phone_number`
- `group_members.group_id`
- `group_members.member_id`
- `messages.group_id`
- `messages.sent_at`

## 7. UX Behavior

1. Sidebar is static visual navigation.
2. Table supports vertical scrolling independent of the page.
3. Clicking a row sets active state and updates the side panel.
4. Side panel shows selected group metadata and placeholder actions.
5. If no row is selected, show a default empty prompt in side panel.

## 8. Implementation Plan

### Phase 1: Project Setup

- Initialize Next.js 13+ with TypeScript and Tailwind.
- Configure linting and basic project scripts.
- Add environment variable scaffolding via `.env.example`.

### Phase 2: Data Setup

- Create `groups`, `members`, `group_members`, and `messages` tables.
- Seed sample groups, members, memberships, and recent messages.
- Implement typed query utilities for group listing and selected-group details.

### Phase 3: UI Development

- Build sidebar component.
- Build groups table with scroll and row interaction.
- Build side panel and selected-row state wiring.

### Phase 4: Validation

- Manual verification of required behaviors.
- Validate responsive layout and basic accessibility labels.
- Production build check.

### Phase 5: Submission Prep

- Finalize README with setup/deploy instructions.
- Deploy to Vercel.
- Share repo URL and live URL.

## 9. Acceptance Criteria

- App runs locally with documented setup steps.
- Uses required stack: Next.js 13+, Tailwind, Supabase, TypeScript.
- Required UI components are present and usable.
- Table rows are clickable and scrollable.
- Side panel UI updates on selection.
- `.env.example` is present and complete.
- Deployment URL is live on Vercel.

## 10. Risks and Mitigations

- Risk: Supabase credentials misconfiguration.
  - Mitigation: clear `.env.example` and startup validation.
- Risk: UI mismatch with reference.
  - Mitigation: focus on layout hierarchy and spacing first, then polish.
- Risk: Time overrun on optional features.
  - Mitigation: prioritize only required components before enhancements.

## 11. Deliverables

- Source code in public GitHub repository
- Deployment on Vercel
- README with setup notes
- `.env.example`
