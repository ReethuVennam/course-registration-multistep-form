import type { ReactNode } from 'react';
import type { Course } from '../types/course';
import type { EnrollmentDraft, ErrorResponse, FormStep, ValidationErrors } from '../types/enrollment';
import { formatApplicationType, formatDateRange, formatPhonePreview, formatPrice, getSeatsLeft } from '../lib/format';
import { countRequestedSeats } from '../lib/draft';

interface ConfirmationStepProps {
  draft: EnrollmentDraft;
  selectedCourse: Course | null;
  errors: ValidationErrors;
  serverError: ErrorResponse | null;
  isSubmitting: boolean;
  onEdit: (step: FormStep) => void;
  onAgreeChange: (agreed: boolean) => void;
  onAgreeBlur: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

function ServerErrorBanner({ error }: { error: ErrorResponse }) {
  if (error.code === 'COURSE_FULL') {
    return (
      <div className="alert alert--danger" role="alert">
        {error.message} Please edit Step 1 and choose a different course, or reduce the group size if that fits your
        needs.
      </div>
    );
  }

  if (error.code === 'DUPLICATE_ENROLLMENT') {
    return (
      <div className="alert alert--danger" role="alert">
        {error.message} You can correct the details and submit again without losing your current draft.
      </div>
    );
  }

  return (
    <div className="alert alert--danger" role="alert">
      {error.message}
    </div>
  );
}

function SummarySection({
  title,
  onEdit,
  children
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="summary-card">
      <div className="summary-card__header">
        <h3>{title}</h3>
        <button type="button" className="text-button" onClick={onEdit}>
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

export function ConfirmationStep({
  draft,
  selectedCourse,
  errors,
  serverError,
  isSubmitting,
  onEdit,
  onAgreeChange,
  onAgreeBlur,
  onBack,
  onSubmit
}: ConfirmationStepProps) {
  const requestedSeats = countRequestedSeats(draft);
  const seatsLeft = selectedCourse ? getSeatsLeft(selectedCourse) : 0;

  return (
    <section className="step-panel step-panel--stacked">
      {serverError ? <ServerErrorBanner error={serverError} /> : null}

      <div className="panel-card">
        <div className="section-heading">
          <span className="section-heading__eyebrow">Step 3</span>
          <h2>Confirm and submit</h2>
          <p>Review both sections below before sending the application.</p>
        </div>

        <div className="confirmation-grid">
          <SummarySection title="Course selection" onEdit={() => onEdit(1)}>
            {selectedCourse ? (
              <dl className="summary-list">
                <div>
                  <dt>Course</dt>
                  <dd>{selectedCourse.title}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{formatDateRange(selectedCourse)}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{formatPrice(selectedCourse.price)}</dd>
                </div>
                <div>
                  <dt>Application type</dt>
                  <dd>{formatApplicationType(draft.type)}</dd>
                </div>
                <div>
                  <dt>Requested seats</dt>
                  <dd>{requestedSeats}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted-copy">No course selected.</p>
            )}
          </SummarySection>

          <SummarySection title="Student information" onEdit={() => onEdit(2)}>
            <dl className="summary-list">
              <div>
                <dt>Name</dt>
                <dd>{draft.applicant.name || '-'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{draft.applicant.email || '-'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{draft.applicant.phone ? formatPhonePreview(draft.applicant.phone) : '-'}</dd>
              </div>
              <div>
                <dt>Motivation</dt>
                <dd>{draft.applicant.motivation.trim() || 'Not provided'}</dd>
              </div>
            </dl>

            {draft.type === 'group' ? (
              <>
                <div className="summary-divider" />
                <dl className="summary-list">
                  <div>
                    <dt>Organization</dt>
                    <dd>{draft.group.organizationName || '-'}</dd>
                  </div>
                  <div>
                    <dt>Head count</dt>
                    <dd>{draft.group.headCount || '-'}</dd>
                  </div>
                  <div>
                    <dt>Contact person</dt>
                    <dd>{draft.group.contactPerson || '-'}</dd>
                  </div>
                </dl>

                <div className="participant-summary">
                  <h4>Participants</h4>
                  {draft.group.participants.length === 0 ? (
                    <p className="muted-copy">No participant rows added yet.</p>
                  ) : (
                    <ul className="summary-table">
                      {draft.group.participants.map((participant) => (
                        <li key={participant.id}>
                          <span>{participant.name || 'Unnamed participant'}</span>
                          <span>{participant.email || 'No email entered'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </SummarySection>
        </div>
      </div>

      <div className="panel-card">
        {selectedCourse && seatsLeft > 0 && seatsLeft <= 3 ? (
          <div className="alert alert--warning" role="status">
            Only {seatsLeft} seats are currently available in this course. Availability may change before submission is
            processed.
          </div>
        ) : null}

        <label className={`terms-card ${errors.agreedToTerms ? 'has-error' : ''}`}>
          <input
            type="checkbox"
            checked={draft.agreedToTerms}
            onChange={(event) => onAgreeChange(event.target.checked)}
            onBlur={onAgreeBlur}
            data-field-path="agreedToTerms"
          />
          <span>
            <strong>Agree to Terms of Use</strong>
            <small>
              I confirm that the submitted information is accurate and I understand that enrollment can be pending if
              additional review is required.
            </small>
          </span>
        </label>

        {errors.agreedToTerms ? (
          <p className="inline-error" role="alert">
            {errors.agreedToTerms}
          </p>
        ) : null}

        <div className="step-actions">
          <button type="button" className="button button--ghost" onClick={onBack} disabled={isSubmitting}>
            Back to student information
          </button>
          <button type="button" className="button button--primary" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting application...' : 'Submit application'}
          </button>
        </div>
      </div>
    </section>
  );
}
