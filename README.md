# Course Registration Multi-Step Form

## 프로젝트 개요

This project implements a multi-step course registration flow using React and TypeScript.

The application simulates a real-world online education enrollment system with a focus on:

* Step-based form navigation
* Validation strategy (client + server-like)
* Conditional fields for group applications
* Data persistence and recovery
* Error handling and retry flows

### 주요 기능

* Step 1: Course selection with category filtering, course preview, and capacity handling
* Step 2: Applicant information input with validation and conditional group fields
* Step 3: Confirmation screen with editable sections and submission handling
* Draft persistence using localStorage
* Unsaved changes warning on refresh/back navigation

---

## 기술 스택

* **React**

  * Suitable for building multi-step UI with reusable components and state management
* **TypeScript**

  * Ensures type safety and enables discriminated union for personal/group applications
* **Vite**

  * Fast development environment and optimized build performance

---

## 실행 방법

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

---

## 프로젝트 구조 설명

```
src/
  api/
    mockApi.ts                 # Mock API for courses and enrollment
  components/
    CourseSelectionStep.tsx    # Step 1
    StudentInformationStep.tsx # Step 2
    ConfirmationStep.tsx       # Step 3
    CompletionScreen.tsx       # Success screen
    Field.tsx                  # Reusable field component
    StepIndicator.tsx          # Progress indicator
  data/
    courses.ts                 # Mock course data
  hooks/
    useUnsavedChangesGuard.ts  # Navigation warning logic
  lib/
    draft.ts                   # Draft state and payload builder
    validation.ts              # Validation logic
    storage.ts                 # localStorage handling
    format.ts                  # Formatting helpers
  types/
    course.ts
    enrollment.ts
  App.tsx                      # Main state and step control
  styles.css                   # Styling and responsive layout
```

---

## 요구사항 해석 및 가정

* Application type defaults to **personal**
* Switching from **group → personal clears group data** after user confirmation
* Group headCount represents total seats requested
* Participant list:

  * Can be partially filled
  * Each row must be valid if present
* Participant emails:

  * Must be unique
  * Must not match applicant email
* Courses:

  * Full → disabled
  * Near capacity → warning shown
* Server validation:

  * Rechecked on submission (capacity & duplicate enrollment)

---

## 설계 결정과 이유

### 1. Centralized State Management

A single draft state in `App.tsx` ensures:

* Data persistence across steps
* Easy back navigation without losing inputs

### 2. Validation Separation

Validation logic is implemented in `src/lib/validation.ts`:

* Keeps UI components clean
* Enables reuse and easier maintenance

### 3. Discriminated Union Types

Used for:

* Personal vs Group application handling
* Type-safe API request construction

### 4. Step-based Validation Strategy

Validation occurs:

* On step transition
* On field blur
* Live after interaction

This improves UX and prevents late-stage errors.

### 5. Conditional Field Handling

* Group-specific fields reset when switching to personal
* Prevents stale/invalid data submission

### 6. Persistence Strategy

* Draft is saved in localStorage
* Automatically restored on refresh
* Cleared after successful submission

### 7. Error Handling Design

* **COURSE_FULL / DUPLICATE_ENROLLMENT**

  * Stay on confirmation step
  * Allow retry without data loss
* **INVALID_INPUT**

  * Redirects user to the relevant step
  * Focuses the first invalid field

---

## 미구현 / 제약사항

* No automated test cases (planned for future improvement)
* Mock API is implemented on the client side only
* Browser limitations restrict customization of unload warnings
* Accessibility improvements can be further enhanced with audit tools

---

## AI 활용 범위

AI was used for:

* Structuring the project
* Generating initial component patterns
* Designing validation logic
* Drafting documentation

Manual work included:

* Final integration
* Debugging and validation flow adjustments
* Build verification and testing
* UX refinement decisions
