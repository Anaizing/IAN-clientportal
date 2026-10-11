# [IAN] Client Portal — Backend Data Labels

This file is the handoff contract for the backend agent. The current frontend uses typed mock data and local storage; these labels define the persistence model to replace it.

## Identity and access

| Label | Type | Purpose |
|---|---|---|
| `user_id` | string | Authenticated user identifier |
| `workspace_id` | string | [IAN] workspace/agency identifier |
| `role` | enum | `admin` or `client` |
| `client_id` | string | Client record identifier |
| `created_at` | datetime | Record creation time |
| `updated_at` | datetime | Last update time |

## Client records

| Label | Type | Purpose |
|---|---|---|
| `client_id` | string | Stable client identifier |
| `client_name` | string | Primary contact name |
| `client_initials` | string | Display initials |
| `company_name` | string | Business name |
| `project_name` | string | Portal project label |
| `project_status` | enum | `your_action`, `with_ian`, `complete` |
| `project_progress` | integer | Completion percentage, 0–100 |
| `target_launch_date` | date/null | Planned launch date |
| `last_activity_at` | datetime/null | Most recent portal activity |
| `is_active` | boolean | Whether the portal is visible in active admin views |
| `archived_at` | datetime/null | When a client was removed from active views; data is retained |
| `archived_by` | string/null | Admin user that archived the client |

> Removing a client must set `is_active = false`; it must not delete the client, intake answers, files, agreements, invoices, comments, or activity history.

## Intake templates

| Label | Type | Purpose |
|---|---|---|
| `template_id` | string | Stable template identifier |
| `template_name` | string | Business type label |
| `template_markdown` | text | Editable Markdown source |
| `template_version` | integer | Increment on every saved edit |
| `template_is_active` | boolean | Whether the template can be assigned |
| `template_created_by` | string | Admin creator |
| `template_updated_by` | string | Admin editor |
| `template_created_at` | datetime | Creation time |
| `template_updated_at` | datetime | Last edit time |

## Intake sections and questions

| Label | Type | Purpose |
|---|---|---|
| `section_id` | string | Stable section identifier |
| `template_id` | string | Parent template |
| `section_title` | string | Markdown `###` title |
| `question_id` | string | Stable question identifier |
| `question_label` | string | Client-facing question |
| `question_helper` | string | Optional helper copy |
| `question_type` | enum | `textarea` or `options` |
| `question_options` | string[] | Available options when type is `options` |
| `sort_order` | integer | Display order |
| `is_required` | boolean | Validation rule |

## Client template assignments

| Label | Type | Purpose |
|---|---|---|
| `assignment_id` | string | Assignment identifier |
| `client_id` | string | Receiving client |
| `template_id` | string | Assigned business-type template |
| `template_version` | integer | Version assigned at the time |
| `assigned_by` | string | Admin user |
| `assigned_at` | datetime | Assignment time |
| `assignment_status` | enum | `active`, `replaced`, `completed` |

## Client intake answers

| Label | Type | Purpose |
|---|---|---|
| `answer_id` | string | Answer identifier |
| `client_id` | string | Client owner |
| `assignment_id` | string | Template assignment context |
| `question_id` | string | Answered question |
| `answer_value` | text/string[] | Client answer |
| `answered_by` | string | User who answered |
| `answered_at` | datetime | Last answer time |
| `is_complete` | boolean | Whether this question has an answer |

## Lifecycle and activity

| Label | Type | Purpose |
|---|---|---|
| `activity_id` | string | Activity identifier |
| `client_id` | string | Related client |
| `actor_user_id` | string | User who performed the action |
| `activity_type` | enum | `client_created`, `client_archived`, `client_restored`, `template_created`, `template_updated`, `template_assigned`, `intake_answer_saved`, `intake_completed` |
| `activity_payload` | json | Structured event details |
| `occurred_at` | datetime | Event time |

## Suggested API operations

- `GET /admin/clients?is_active=true`
- `POST /admin/clients`
- `PATCH /admin/clients/:client_id`
- `POST /admin/clients/:client_id/archive`
- `POST /admin/clients/:client_id/restore`
- `GET /admin/intake-templates`
- `POST /admin/intake-templates`
- `PATCH /admin/intake-templates/:template_id`
- `POST /admin/clients/:client_id/intake-template-assignment`
- `GET /client/:client_id/intake`
- `PUT /client/:client_id/intake/answers/:question_id`
- `POST /client/:client_id/intake/complete`

## Frontend replacement notes

Replace `src/services/mockPortal.ts` and `src/services/intakeTemplates.ts` with API-backed services. Keep the existing labels and response shapes stable so the reusable `IntakeFlow`, `AdminPortal`, and client page components do not need to know whether data is mocked or persisted.
