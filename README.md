# Project Overview

This project implements the requested multi-step course registration flow as a small React + TypeScript application.

The experience covers:

- Step 1 course selection with category filtering, course detail preview, capacity messaging, and application type switching
- Step 2 applicant data entry with step-scoped validation, conditional group fields, dynamic participant rows, and duplicate email checks
- Step 3 confirmation with editable summary sections, terms agreement, mock submission, retry handling, and completion screen
- Resilience features such as local draft recovery through `localStorage` and unsaved-changes warnings for refresh/close/back navigation

# Tech Stack

- React
  Reason: a good fit for multi-step UI state, conditional rendering, and componentized review screens.
- TypeScript
  Reason: required by the assignment, and especially useful here for discriminating personal vs. group submission payloads.
- Vite
  Reason: lightweight setup with fast development/build tooling for a small front-end-only assignment.
- No external form library
  Reason: I chose a custom centralized state + validation approach to make the step transitions, conditional resets, and validation policy explicit in the code rather than hiding the decisions behind library abstractions.

# How to Run the Project

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

# Project Structure Description

```text
src/
  api/
    mockApi.ts                 # Mocked course list and enrollment submission logic
  components/
    CourseSelectionStep.tsx    # Step 1 UI
    StudentInformationStep.tsx # Step 2 UI
    ConfirmationStep.tsx       # Step 3 UI
    CompletionScreen.tsx       # Success state
    Field.tsx                  # Shared field shell
    StepIndicator.tsx          # Progress indicator
  data/
    courses.ts                 # Mock course data
  hooks/
    useUnsavedChangesGuard.ts  # beforeunload + back navigation warning
  lib/
    draft.ts                   # Draft creation, reset policy, request payload builder
    format.ts                  # Formatting helpers
    storage.ts                 # localStorage persistence
    validation.ts              # Step-by-step validation logic
  types/
    course.ts
    enrollment.ts
  App.tsx                      # Main orchestration
  styles.css                   # Responsive styling
```

# Requirement Interpretation and Assumptions

- Application type defaults to `personal`, but users can switch to `group` at any time from Step 1.
- When switching from `group` to `personal`, group-only data is cleared after a confirmation dialog.
  This is intentional so stale organization/headcount/participant data is never silently submitted on a personal application.
- Group `headCount` is interpreted as the total number of seats requested for the group.
- The participant list is optional in the sense that the roster may be incomplete at submission time, but every participant row that exists must be fully valid.
- Participant email addresses must be unique within the participant list, and they also cannot reuse the main applicant email.
- Full courses are shown but disabled in Step 1.
  Near-capacity courses show a warning, and server-side capacity is still checked again on submit in case availability changes.
- Duplicate enrollment detection is handled by submitted email overlap on the same course.
  For groups, participant emails are also considered so the mock behaves more like a real enrollment safeguard.
- The mock API is implemented in the client layer rather than as a separate mock server process.
  It still mirrors the provided response and error shapes.

# Design Decisions and Rationale

- Centralized draft state in `App.tsx`
  One draft object keeps every step in sync and guarantees data retention when moving backward.
- Validation logic separated into `src/lib/validation.ts`
  UI components stay focused on rendering, while the rules for step validation and error routing live in a single reusable place.
- Discriminated request building in `src/lib/draft.ts`
  The final API payload is constructed from the draft only after validation, which keeps the UI draft flexible and the submission payload strict.
- Step-by-step validation strategy
  Validation runs:
  - when moving to the next step
  - on blur for visible fields
  - live after a step has already been attempted or touched
- Server error handling
  `COURSE_FULL` and `DUPLICATE_ENROLLMENT` remain on the confirmation step so the user can retry without losing context.
  `INVALID_INPUT` with field-level details routes the user back to the relevant step and focuses the first invalid field.
- Persistence strategy
  Drafts are saved locally on every meaningful change and cleared after a successful submission.
- Mobile UX
  The layout collapses to a vertically stacked step flow on smaller screens instead of squeezing desktop columns.

# Unimplemented Features / Limitations

- No automated test suite was added in this pass.
  The project was verified with a production build, but unit/integration tests would be the next improvement.
- The mock API is in-browser and backed by `localStorage`.
  It is suitable for the assignment, but not a substitute for a real backend or a dedicated API mock server.
- Browser back/close warnings rely on standard browser behavior.
  Modern browsers limit the text/customization of unload dialogs, so the implementation uses the supported confirmation patterns only.
- Accessibility was considered in structure and focus handling, but a full accessibility audit was not performed.

# Scope of AI Usage

AI was used to help draft and implement the project structure, validation logic, UI components, and README documentation.

Final code assembly, dependency installation, and production build verification were completed in the workspace during this session.
