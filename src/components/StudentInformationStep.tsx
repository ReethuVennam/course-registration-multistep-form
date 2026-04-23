import { Field } from './Field';
import type { Course } from '../types/course';
import type {
  EnrollmentDraft,
  ErrorResponse,
  GroupParticipantDraft,
  ValidationErrors
} from '../types/enrollment';
import { formatApplicationType, formatDateRange, formatPhonePreview } from '../lib/format';

interface StudentInformationStepProps {
  draft: EnrollmentDraft;
  selectedCourse: Course | null;
  errors: ValidationErrors;
  serverError: ErrorResponse | null;
  onApplicantChange: (field: 'name' | 'email' | 'phone' | 'motivation', value: string) => void;
  onGroupChange: (field: 'organizationName' | 'headCount' | 'contactPerson', value: string) => void;
  onParticipantChange: (participantId: string, field: 'name' | 'email', value: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (participantId: string) => void;
  onBlur: (path: string) => void;
  onBack: () => void;
  onNext: () => void;
}

function getParticipantPath(index: number, field: 'name' | 'email'): string {
  return `group.participants.${index}.${field}`;
}

function isAddParticipantDisabled(draft: EnrollmentDraft): boolean {
  if (draft.type !== 'group') {
    return true;
  }

  const parsedHeadCount = Number.parseInt(draft.group.headCount, 10);

  if (!Number.isInteger(parsedHeadCount) || parsedHeadCount < 2 || parsedHeadCount > 10) {
    return true;
  }

  return draft.group.participants.length >= parsedHeadCount;
}

function ParticipantCard({
  participant,
  index,
  errors,
  onParticipantChange,
  onRemoveParticipant,
  onBlur
}: {
  participant: GroupParticipantDraft;
  index: number;
  errors: ValidationErrors;
  onParticipantChange: (participantId: string, field: 'name' | 'email', value: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onBlur: (path: string) => void;
}) {
  const namePath = getParticipantPath(index, 'name');
  const emailPath = getParticipantPath(index, 'email');

  return (
    <div className="participant-card">
      <div className="participant-card__header">
        <h4>Participant {index + 1}</h4>
        <button type="button" className="text-button" onClick={() => onRemoveParticipant(participant.id)}>
          Remove
        </button>
      </div>

      <div className="form-grid">
        <Field label="Participant name" required error={errors[namePath]}>
          <input
            id={`${participant.id}-name`}
            className={errors[namePath] ? 'has-error' : ''}
            value={participant.name}
            onChange={(event) => onParticipantChange(participant.id, 'name', event.target.value)}
            onBlur={() => onBlur(namePath)}
            data-field-path={namePath}
          />
        </Field>

        <Field label="Participant email" required error={errors[emailPath]}>
          <input
            id={`${participant.id}-email`}
            type="email"
            className={errors[emailPath] ? 'has-error' : ''}
            value={participant.email}
            onChange={(event) => onParticipantChange(participant.id, 'email', event.target.value)}
            onBlur={() => onBlur(emailPath)}
            data-field-path={emailPath}
          />
        </Field>
      </div>
    </div>
  );
}

export function StudentInformationStep({
  draft,
  selectedCourse,
  errors,
  serverError,
  onApplicantChange,
  onGroupChange,
  onParticipantChange,
  onAddParticipant,
  onRemoveParticipant,
  onBlur,
  onBack,
  onNext
}: StudentInformationStepProps) {
  const addDisabled = isAddParticipantDisabled(draft);
  const applicantPhonePreview = draft.applicant.phone ? formatPhonePreview(draft.applicant.phone) : '010-1234-5678';

  return (
    <section className="step-panel step-panel--stacked">
      {serverError?.code === 'INVALID_INPUT' ? (
        <div className="alert alert--danger" role="alert">
          {serverError.message}
        </div>
      ) : null}

      <div className="panel-card">
        <div className="section-heading">
          <span className="section-heading__eyebrow">Step 2</span>
          <h2>Enter student information</h2>
          <p>The details entered here stay in place when you move back and forth between steps.</p>
        </div>

        {selectedCourse ? (
          <div className="mini-summary">
            <div>
              <span className="mini-summary__label">Selected course</span>
              <strong>{selectedCourse.title}</strong>
            </div>
            <div>
              <span className="mini-summary__label">Application</span>
              <strong>{formatApplicationType(draft.type)}</strong>
            </div>
            <div>
              <span className="mini-summary__label">Schedule</span>
              <strong>{formatDateRange(selectedCourse)}</strong>
            </div>
          </div>
        ) : null}

        <div className="form-grid">
          <Field label="Name" required error={errors['applicant.name']}>
            <input
              id="applicant-name"
              className={errors['applicant.name'] ? 'has-error' : ''}
              value={draft.applicant.name}
              onChange={(event) => onApplicantChange('name', event.target.value)}
              onBlur={() => onBlur('applicant.name')}
              data-field-path="applicant.name"
            />
          </Field>

          <Field label="Email" required error={errors['applicant.email']}>
            <input
              id="applicant-email"
              type="email"
              className={errors['applicant.email'] ? 'has-error' : ''}
              value={draft.applicant.email}
              onChange={(event) => onApplicantChange('email', event.target.value)}
              onBlur={() => onBlur('applicant.email')}
              data-field-path="applicant.email"
            />
          </Field>

          <Field
            label="Phone number"
            required
            error={errors['applicant.phone']}
            helper={`Korean phone format, for example ${applicantPhonePreview}`}
          >
            <input
              id="applicant-phone"
              type="tel"
              className={errors['applicant.phone'] ? 'has-error' : ''}
              value={draft.applicant.phone}
              onChange={(event) => onApplicantChange('phone', event.target.value)}
              onBlur={() => onBlur('applicant.phone')}
              data-field-path="applicant.phone"
            />
          </Field>

          <Field
            label="Motivation"
            helper={`${draft.applicant.motivation.trim().length} / 300 characters`}
            error={errors['applicant.motivation']}
            className="field--full"
          >
            <textarea
              id="applicant-motivation"
              rows={5}
              className={errors['applicant.motivation'] ? 'has-error' : ''}
              value={draft.applicant.motivation}
              onChange={(event) => onApplicantChange('motivation', event.target.value)}
              onBlur={() => onBlur('applicant.motivation')}
              data-field-path="applicant.motivation"
            />
          </Field>
        </div>
      </div>

      {draft.type === 'group' ? (
        <div className="panel-card">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__eyebrow">Group-only details</span>
            <h2>Group application information</h2>
            <p>
              Switching back to an individual application clears this section to prevent stale group data from being
              submitted accidentally.
            </p>
          </div>

          <div className="form-grid">
            <Field label="Organization name" required error={errors['group.organizationName']}>
              <input
                id="group-organization"
                className={errors['group.organizationName'] ? 'has-error' : ''}
                value={draft.group.organizationName}
                onChange={(event) => onGroupChange('organizationName', event.target.value)}
                onBlur={() => onBlur('group.organizationName')}
                data-field-path="group.organizationName"
              />
            </Field>

            <Field
              label="Number of applicants"
              required
              error={errors['group.headCount']}
              helper="Between 2 and 10 people"
            >
              <input
                id="group-headcount"
                type="number"
                inputMode="numeric"
                min={2}
                max={10}
                className={errors['group.headCount'] ? 'has-error' : ''}
                value={draft.group.headCount}
                onChange={(event) => onGroupChange('headCount', event.target.value)}
                onBlur={() => onBlur('group.headCount')}
                data-field-path="group.headCount"
              />
            </Field>

            <Field label="Contact person" required error={errors['group.contactPerson']} className="field--full">
              <input
                id="group-contact-person"
                className={errors['group.contactPerson'] ? 'has-error' : ''}
                value={draft.group.contactPerson}
                onChange={(event) => onGroupChange('contactPerson', event.target.value)}
                onBlur={() => onBlur('group.contactPerson')}
                data-field-path="group.contactPerson"
              />
            </Field>
          </div>

          <div className="participant-toolbar">
            <div>
              <h3>Participant list</h3>
              <p>You can add fewer participants than the full head count if your final roster is not ready yet.</p>
            </div>
            <button type="button" className="button button--secondary" onClick={onAddParticipant} disabled={addDisabled}>
              Add participant
            </button>
          </div>

          {errors['group.participants'] ? (
            <p className="inline-error" role="alert">
              {errors['group.participants']}
            </p>
          ) : null}

          {draft.group.participants.length === 0 ? (
            <div className="placeholder-card">
              <p>No participants have been added yet.</p>
            </div>
          ) : (
            <div className="participant-list">
              {draft.group.participants.map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  index={index}
                  errors={errors}
                  onParticipantChange={onParticipantChange}
                  onRemoveParticipant={onRemoveParticipant}
                  onBlur={onBlur}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="step-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>
          Back to course selection
        </button>
        <button type="button" className="button button--primary" onClick={onNext}>
          Review application
        </button>
      </div>
    </section>
  );
}
