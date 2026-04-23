import type { Course } from '../types/course';
import type { EnrollmentRequest, EnrollmentResponse } from '../types/enrollment';
import {
  formatApplicationType,
  formatDateRange,
  formatDateTime,
  formatEnrollmentStatus,
  formatPhonePreview,
  formatPrice
} from '../lib/format';

interface CompletionScreenProps {
  response: EnrollmentResponse;
  payload: EnrollmentRequest;
  selectedCourse: Course | null;
  onReset: () => void;
}

export function CompletionScreen({ response, payload, selectedCourse, onReset }: CompletionScreenProps) {
  return (
    <section className="completion-shell">
      <div className="completion-card">
        <span className="section-heading__eyebrow">Application complete</span>
        <h2>Your registration has been submitted</h2>
        <p>
          {response.status === 'confirmed'
            ? 'Your seat is confirmed. A follow-up message should arrive shortly.'
            : 'Your application was submitted successfully and is currently pending review.'}
        </p>

        <div className="completion-metrics">
          <div>
            <span>Application number</span>
            <strong>{response.enrollmentId}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{formatEnrollmentStatus(response.status)}</strong>
          </div>
          <div>
            <span>Submitted at</span>
            <strong>{formatDateTime(response.enrolledAt)}</strong>
          </div>
        </div>

        <div className="confirmation-grid">
          <div className="summary-card">
            <div className="summary-card__header">
              <h3>Course summary</h3>
            </div>
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
                  <dd>{formatApplicationType(payload.type)}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted-copy">The course information is no longer available.</p>
            )}
          </div>

          <div className="summary-card">
            <div className="summary-card__header">
              <h3>Applicant summary</h3>
            </div>
            <dl className="summary-list">
              <div>
                <dt>Name</dt>
                <dd>{payload.applicant.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{payload.applicant.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{formatPhonePreview(payload.applicant.phone)}</dd>
              </div>
              {payload.type === 'group' ? (
                <>
                  <div>
                    <dt>Organization</dt>
                    <dd>{payload.group.organizationName}</dd>
                  </div>
                  <div>
                    <dt>Head count</dt>
                    <dd>{payload.group.headCount}</dd>
                  </div>
                  <div>
                    <dt>Contact person</dt>
                    <dd>{payload.group.contactPerson}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
        </div>

        <button type="button" className="button button--primary" onClick={onReset}>
          Start a new application
        </button>
      </div>
    </section>
  );
}
