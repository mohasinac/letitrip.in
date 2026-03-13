# Events Feature

**Feature path:** `src/features/events/`  
**Repository:** `eventRepository`, `eventEntryRepository`  
**Service:** `eventService`  
**Actions:** `createEventAction`, `updateEventAction`, `deleteEventAction`, `changeEventStatusAction`, `adminUpdateEventEntryAction`

---

## Overview

Events are platform-driven interactive campaigns. They drive user engagement and can be used for promotions, market research, or giveaways.

### Event Types

| Type       | Description                                 |
| ---------- | ------------------------------------------- |
| `poll`     | Multiple-choice vote, one vote per user     |
| `survey`   | Multi-question dynamic form                 |
| `feedback` | Product/service feedback with rating        |
| `sale`     | Time-limited sale promotion (informational) |
| `offer`    | Special offer tied to purchase              |

---

## Event Status Lifecycle

```
draft → published → active → ended → archived
```

Status transitions are admin-controlled via `changeEventStatusAction`.

---

## Public Pages

### `EventsListView` (`/events`)

Paginated public event listing:

- Filter by type and status
- Sort by start date, prize value
- Data: `usePublicEvents()` → `GET /api/events`

### `EventDetailView` (`/events/[id]`)

Event landing page:

- `EventStatsBanner` — total entries, time remaining, prize
- `EventStatusBadge` — current status chip
- Event rules and description
- CTA to participate

### `EventParticipateView` (`/events/[id]/participate`)

Dispatches to the correct participation UI based on event type:

#### `PollVotingSection`

- Radio button choice per poll option
- Shows current vote count (after voting)
- Submit via `usePollVote`

#### `FeedbackEventSection`

- Star rating + text feedback
- Submit via `useFeedbackSubmit`

#### `SurveyEventSection`

- `SurveyFieldBuilder` renders dynamic form fields (text, radio, checkbox, select, textarea)
- Field types defined by `FormFieldTypeValue`
- Submit via survey submission mutation

### `EventLeaderboard`

Top entries ranked by score/votes. Updates in real-time for active events.

---

## Admin Pages

### `AdminEventsView` (`/admin/events`)

Manage all events:

- DataTable with `useEvents(params)` + `EventFilters`
- Status filter: draft, published, active, ended
- Create/edit via `EventFormDrawer`

**Columns:** `useEventsTableColumns`

### `AdminEventEntriesView` (`/admin/events/[id]/entries`)

Review individual participant entries:

- DataTable with `useEventEntries(eventId)` + `EventEntryFilters`
- `EntryReviewDrawer` — view full entry content, approve/reject with note

**Columns:** `useEventEntriesTableColumns`

---

## `EventFormDrawer`

Side drawer for create/edit events. Fields vary by type:

**Common fields:**

- Title, description, type, status
- Start date, end date
- Prize / reward description
- Cover image

**Type-specific config forms:**

| Type       | Config Form          | Fields                        |
| ---------- | -------------------- | ----------------------------- |
| `poll`     | `PollConfigForm`     | Options array, max votes      |
| `survey`   | `SurveyConfigForm`   | Dynamic field builder         |
| `feedback` | `FeedbackConfigForm` | Rating type, product link     |
| `sale`     | `SaleConfigForm`     | Discount, linked products     |
| `offer`    | `OfferConfigForm`    | Offer terms, redemption limit |

### `SurveyFieldBuilder`

Dynamic form field builder used inside `SurveyConfigForm`. Admin adds fields of type:

- `text`, `textarea`, `number`, `email`, `phone`
- `radio`, `checkbox`, `select`
- `rating`, `date`, `file`

---

## Event Entry Review

`EntryReviewDrawer` shows the submitted entry data alongside the participant's profile.  
`adminUpdateEventEntryAction({ entryId, status, note? })` — approve or reject.

---

## Hooks

| Hook                       | Description                   |
| -------------------------- | ----------------------------- |
| `useEvents(params)`        | Admin/public event list       |
| `usePublicEvent(id)`       | Public event detail           |
| `useEventEntries(eventId)` | Admin entries for an event    |
| `useEventLeaderboard(id)`  | Event leaderboard             |
| `useEventStats(id)`        | Entry count, vote totals      |
| `useCreateEvent`           | Create event mutation         |
| `useUpdateEvent`           | Update event mutation         |
| `useDeleteEvent`           | Delete event mutation         |
| `usePollVote`              | Submit poll vote              |
| `useFeedbackSubmit`        | Submit feedback               |
| `useEventMutations`        | Combined create/update/delete |

---

## Constants

| Constant                 | Type       | Description                   |
| ------------------------ | ---------- | ----------------------------- |
| `EVENT_SORT_OPTIONS`     | `string[]` | Sort options for filter panel |
| `EVENT_STATUS_VALUES`    | `string[]` | Status enum values            |
| `EventStatusFilterValue` | type       | Filter status type            |
| `EVENT_TYPE_VALUES`      | `string[]` | Type enum values              |
| `EventTypeValue`         | type       | Event type union              |
| `FORM_FIELD_TYPE_VALUES` | `string[]` | Survey field type enum        |
| `FormFieldTypeValue`     | type       | Survey field type union       |

---

## API Routes

| Method  | Route                                      | Description                |
| ------- | ------------------------------------------ | -------------------------- |
| `GET`   | `/api/events`                              | Public event listing       |
| `GET`   | `/api/events/[id]`                         | Event detail               |
| `GET`   | `/api/events/[id]/leaderboard`             | Leaderboard                |
| `POST`  | `/api/events/[id]/enter`                   | Submit participation entry |
| `PATCH` | `/api/admin/events/[id]/status`            | Change event status        |
| `GET`   | `/api/admin/events/[id]/stats`             | Event stats                |
| `PATCH` | `/api/admin/events/[id]/entries/[entryId]` | Update entry status        |
