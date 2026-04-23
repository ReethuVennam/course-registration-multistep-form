import { useEffect, useMemo, useState } from 'react';
import { getCourses, submitEnrollment } from './api/mockApi';
import { CompletionScreen } from './components/CompletionScreen';
import { ConfirmationStep } from './components/ConfirmationStep';
import { CourseSelectionStep } from './components/CourseSelectionStep';
import { StepIndicator } from './components/StepIndicator';
import { StudentInformationStep } from './components/StudentInformationStep';
import { getCourseById } from './data/courses';
import { buildEnrollmentRequest, countRequestedSeats, createEmptyDraft, createEmptyGroupDraft, createParticipant, hasGroupData, isDraftDirty } from './lib/draft';
import { formatDateTime } from './lib/format';
import { clearDraftSnapshot, loadDraftSnapshot, saveDraftSnapshot } from './lib/storage';
import { getStepFromErrorPaths, validateStep1, validateStep2, validateStep3 } from './lib/validation';
import { useUnsavedChangesGuard } from './hooks/useUnsavedChangesGuard';
import { COURSE_CATEGORIES, type Course, type CourseCategory } from './types/course';
import type { EnrollmentDraft, EnrollmentRequest, EnrollmentResponse, ErrorResponse, FormStep, ValidationErrors } from './types/enrollment';

interface CourseQueryState {
  status: 'loading' | 'ready' | 'error';
  categories: CourseCategory[];
  courses: Course[];
  errorMessage: string | null;
}

type SubmissionState =
  | { status: 'idle'; error: null }
  | { status: 'submitting'; error: null }
  | { status: 'error'; error: ErrorResponse };

interface CompletionState {
  payload: EnrollmentRequest;
  response: EnrollmentResponse;
}

function focusField(path: string): void {
  window.requestAnimationFrame(() => {
    const element = document.querySelector<HTMLElement>(`[data-field-path="${path}"]`);

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus?.();
  });
}

function getCurrentStepErrors(step: FormStep, draft: EnrollmentDraft): ValidationErrors {
  if (step === 1) {
    return validateStep1(draft, getCourseById(draft.courseId));
  }

  if (step === 2) {
    return validateStep2(draft);
  }

  return validateStep3(draft);
}

function hasTouchedFieldForStep(step: FormStep, touched: Record<string, boolean>): boolean {
  return Object.keys(touched).some((path) => {
    if (step === 1) {
      return path === 'courseId' || path === 'type';
    }

    if (step === 2) {
      return path.startsWith('applicant.') || path.startsWith('group.');
    }

    return path === 'agreedToTerms';
  });
}

export default function App() {
  const restoredSnapshot = useMemo(() => loadDraftSnapshot(), []);
  const [restoredAt, setRestoredAt] = useState<string | null>(() => restoredSnapshot?.savedAt ?? null);
  const [draft, setDraft] = useState<EnrollmentDraft>(() => restoredSnapshot?.draft ?? createEmptyDraft());
  const [step, setStep] = useState<FormStep>(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSteps, setAttemptedSteps] = useState<Record<FormStep, boolean>>({
    1: false,
    2: false,
    3: false
  });
  const [courseState, setCourseState] = useState<CourseQueryState>({
    status: 'loading',
    categories: [...COURSE_CATEGORIES],
    courses: [],
    errorMessage: null
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle', error: null });
  const [completion, setCompletion] = useState<CompletionState | null>(null);

  const selectedCourse = getCourseById(draft.courseId) ?? null;
  const requestedSeats = countRequestedSeats(draft);
  const hasUnsavedChanges = isDraftDirty(draft) && completion === null;

  useUnsavedChangesGuard(hasUnsavedChanges);

  useEffect(() => {
    let isActive = true;

    setCourseState((previous) => ({
      ...previous,
      status: 'loading',
      errorMessage: null
    }));

    getCourses(draft.categoryFilter === 'all' ? undefined : draft.categoryFilter)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setCourseState({
          status: 'ready',
          categories: response.categories,
          courses: response.courses,
          errorMessage: null
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setCourseState((previous) => ({
          status: 'error',
          categories: previous.categories.length > 0 ? previous.categories : [...COURSE_CATEGORIES],
          courses: previous.courses,
          errorMessage: 'The course catalog could not be loaded. Try switching categories to retry.'
        }));
      });

    return () => {
      isActive = false;
    };
  }, [draft.categoryFilter]);

  useEffect(() => {
    if (completion) {
      clearDraftSnapshot();
      return;
    }

    if (isDraftDirty(draft)) {
      saveDraftSnapshot(draft);
      return;
    }

    clearDraftSnapshot();
  }, [completion, draft]);

  function updateDraft(nextDraft: EnrollmentDraft, affectedStep?: FormStep) {
    setDraft(nextDraft);
    setSubmissionState({ status: 'idle', error: null });

    if (affectedStep && step === affectedStep && (attemptedSteps[affectedStep] || hasTouchedFieldForStep(affectedStep, touched))) {
      setErrors(getCurrentStepErrors(affectedStep, nextDraft));
    }
  }

  function handleCategoryChange(category: CourseCategory | 'all') {
    updateDraft(
      {
        ...draft,
        categoryFilter: category
      },
      1
    );
  }

  function handleCourseSelect(courseId: string) {
    updateDraft(
      {
        ...draft,
        courseId
      },
      1
    );
  }

  function handleTypeChange(type: 'personal' | 'group') {
    if (type === draft.type) {
      return;
    }

    if (type === 'personal' && hasGroupData(draft.group)) {
      const confirmed = window.confirm(
        'Switching to an individual application will clear all group-only fields. Do you want to continue?'
      );

      if (!confirmed) {
        return;
      }
    }

    const nextDraft: EnrollmentDraft = {
      ...draft,
      type,
      group: type === 'personal' ? createEmptyGroupDraft() : draft.group,
      agreedToTerms: false
    };

    setTouched((previous) => {
      if (type === 'group') {
        return previous;
      }

      return Object.fromEntries(Object.entries(previous).filter(([path]) => !path.startsWith('group.')));
    });

    updateDraft(nextDraft, 1);
  }

  function handleApplicantChange(field: 'name' | 'email' | 'phone' | 'motivation', value: string) {
    updateDraft(
      {
        ...draft,
        applicant: {
          ...draft.applicant,
          [field]: value
        }
      },
      2
    );
  }

  function handleGroupChange(field: 'organizationName' | 'headCount' | 'contactPerson', value: string) {
    updateDraft(
      {
        ...draft,
        group: {
          ...draft.group,
          [field]: value
        }
      },
      2
    );
  }

  function handleParticipantChange(participantId: string, field: 'name' | 'email', value: string) {
    updateDraft(
      {
        ...draft,
        group: {
          ...draft.group,
          participants: draft.group.participants.map((participant) =>
            participant.id === participantId ? { ...participant, [field]: value } : participant
          )
        }
      },
      2
    );
  }

  function handleAddParticipant() {
    updateDraft(
      {
        ...draft,
        group: {
          ...draft.group,
          participants: [...draft.group.participants, createParticipant()]
        }
      },
      2
    );
  }

  function handleRemoveParticipant(participantId: string) {
    updateDraft(
      {
        ...draft,
        group: {
          ...draft.group,
          participants: draft.group.participants.filter((participant) => participant.id !== participantId)
        }
      },
      2
    );
  }

  function handleAgreeChange(agreedToTerms: boolean) {
    updateDraft(
      {
        ...draft,
        agreedToTerms
      },
      3
    );
  }

  function handleBlur(path: string) {
    setTouched((previous) => ({
      ...previous,
      [path]: true
    }));
    setErrors(getCurrentStepErrors(step, draft));
  }

  function navigateToStep(nextStep: FormStep) {
    if (nextStep > step) {
      return;
    }

    setStep(nextStep);
    setErrors({});
    setSubmissionState({ status: 'idle', error: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNextStep() {
    const stepErrors = getCurrentStepErrors(step, draft);

    setAttemptedSteps((previous) => ({
      ...previous,
      [step]: true
    }));

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      focusField(Object.keys(stepErrors)[0]);
      return;
    }

    setErrors({});
    setSubmissionState({ status: 'idle', error: null });
    setStep((previous) => (previous === 1 ? 2 : 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    const confirmationErrors = validateStep3(draft);

    setAttemptedSteps((previous) => ({
      ...previous,
      3: true
    }));

    if (Object.keys(confirmationErrors).length > 0) {
      setErrors(confirmationErrors);
      focusField(Object.keys(confirmationErrors)[0]);
      return;
    }

    const payload = buildEnrollmentRequest(draft);
    setErrors({});
    setSubmissionState({ status: 'submitting', error: null });

    try {
      const response = await submitEnrollment(payload);
      setCompletion({ payload, response });
      setSubmissionState({ status: 'idle', error: null });
      setErrors({});
      setTouched({});
      setAttemptedSteps({
        1: false,
        2: false,
        3: false
      });
    } catch (error) {
      const typedError = error as ErrorResponse;

      if (typedError.code === 'INVALID_INPUT' && typedError.details) {
        const targetStep = getStepFromErrorPaths(typedError.details);
        setStep(targetStep);
        setErrors(typedError.details);
        setSubmissionState({ status: 'error', error: typedError });
        setAttemptedSteps((previous) => ({
          ...previous,
          [targetStep]: true
        }));
        focusField(Object.keys(typedError.details)[0]);
        return;
      }

      setSubmissionState({
        status: 'error',
        error: typedError ?? {
          code: 'UNKNOWN',
          message: 'Something went wrong while submitting the application.'
        }
      });
    }
  }

  function handleReset() {
    setDraft(createEmptyDraft());
    setRestoredAt(null);
    setStep(1);
    setErrors({});
    setTouched({});
    setAttemptedSteps({
      1: false,
      2: false,
      3: false
    });
    setSubmissionState({ status: 'idle', error: null });
    setCompletion(null);
    clearDraftSnapshot();
  }

  const draftRestoredLabel = restoredAt
    ? `Draft restored from local storage. Last saved ${formatDateTime(restoredAt)}.`
    : 'Draft saves automatically on this device.';

  if (completion) {
    return (
      <main className="app-shell">
        <header className="hero">
          <div className="hero__content">
            <span className="hero__eyebrow">Online education platform</span>
            <h1>Course registration</h1>
            <p>Multi-step registration flow with step review, draft retention, and mock API submission handling.</p>
          </div>
        </header>

        <CompletionScreen
          response={completion.response}
          payload={completion.payload}
          selectedCourse={getCourseById(completion.payload.courseId) ?? null}
          onReset={handleReset}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Online education platform</span>
          <h1>Course registration</h1>
          <p>Enroll in a course through a three-step flow with inline validation, summary review, and resilient retries.</p>
          <div className="hero__meta">
            <span className="status-pill">Auto-save enabled</span>
            <span className="hero__hint">{draftRestoredLabel}</span>
          </div>
        </div>

        {requestedSeats > 0 && selectedCourse ? (
          <aside className="hero__stats">
            <div>
              <span>Selected course</span>
              <strong>{selectedCourse.title}</strong>
            </div>
            <div>
              <span>Requested seats</span>
              <strong>{requestedSeats}</strong>
            </div>
          </aside>
        ) : null}
      </header>

      <section className="workspace">
        <StepIndicator currentStep={step} onSelectStep={navigateToStep} />

        {courseState.status === 'error' ? (
          <div className="alert alert--danger" role="alert">
            {courseState.errorMessage}
          </div>
        ) : null}

        {step === 1 ? (
          <CourseSelectionStep
            categories={courseState.categories}
            activeCategory={draft.categoryFilter}
            courses={courseState.courses}
            loading={courseState.status === 'loading' && courseState.courses.length === 0}
            selectedCourse={selectedCourse}
            applicationType={draft.type}
            errors={errors}
            serverError={submissionState.status === 'error' ? submissionState.error : null}
            onCategoryChange={handleCategoryChange}
            onCourseSelect={handleCourseSelect}
            onTypeChange={handleTypeChange}
            onNext={handleNextStep}
          />
        ) : null}

        {step === 2 ? (
          <StudentInformationStep
            draft={draft}
            selectedCourse={selectedCourse}
            errors={errors}
            serverError={submissionState.status === 'error' ? submissionState.error : null}
            onApplicantChange={handleApplicantChange}
            onGroupChange={handleGroupChange}
            onParticipantChange={handleParticipantChange}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onBlur={handleBlur}
            onBack={() => navigateToStep(1)}
            onNext={handleNextStep}
          />
        ) : null}

        {step === 3 ? (
          <ConfirmationStep
            draft={draft}
            selectedCourse={selectedCourse}
            errors={errors}
            serverError={submissionState.status === 'error' ? submissionState.error : null}
            isSubmitting={submissionState.status === 'submitting'}
            onEdit={navigateToStep}
            onAgreeChange={handleAgreeChange}
            onAgreeBlur={() => handleBlur('agreedToTerms')}
            onBack={() => navigateToStep(2)}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </main>
  );
}
