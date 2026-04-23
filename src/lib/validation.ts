import type { Course } from '../types/course';
import type { EnrollmentDraft, FormStep, ValidationErrors } from '../types/enrollment';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KOREAN_PHONE_PATTERN = /^(0\d{1,2})-?(\d{3,4})-?(\d{4})$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmailValid(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isKoreanPhoneValid(value: string): boolean {
  return KOREAN_PHONE_PATTERN.test(value.trim());
}

export function validateStep1(draft: EnrollmentDraft, selectedCourse?: Course): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!draft.courseId) {
    errors.courseId = 'Please choose a course before continuing.';
  } else if (!selectedCourse) {
    errors.courseId = 'The selected course could not be found. Please choose again.';
  }

  if (!draft.type) {
    errors.type = 'Please choose an application type.';
  }

  return errors;
}

export function validateStep2(draft: EnrollmentDraft): ValidationErrors {
  const errors: ValidationErrors = {};
  const applicantName = draft.applicant.name.trim();
  const applicantEmail = draft.applicant.email.trim();
  const applicantPhone = draft.applicant.phone.trim();
  const motivation = draft.applicant.motivation.trim();

  if (!applicantName) {
    errors['applicant.name'] = 'Name is required.';
  } else if (applicantName.length < 2 || applicantName.length > 20) {
    errors['applicant.name'] = 'Name must be between 2 and 20 characters.';
  }

  if (!applicantEmail) {
    errors['applicant.email'] = 'Email is required.';
  } else if (!isEmailValid(applicantEmail)) {
    errors['applicant.email'] = 'Enter a valid email address.';
  }

  if (!applicantPhone) {
    errors['applicant.phone'] = 'Phone number is required.';
  } else if (!isKoreanPhoneValid(applicantPhone)) {
    errors['applicant.phone'] = 'Use a Korean phone number format such as 010-1234-5678.';
  }

  if (motivation.length > 300) {
    errors['applicant.motivation'] = 'Motivation must be 300 characters or fewer.';
  }

  if (draft.type !== 'group') {
    return errors;
  }

  if (!draft.group.organizationName.trim()) {
    errors['group.organizationName'] = 'Organization name is required for group applications.';
  }

  if (!draft.group.headCount.trim()) {
    errors['group.headCount'] = 'Number of applicants is required.';
  } else {
    const headCount = Number.parseInt(draft.group.headCount, 10);

    if (!Number.isInteger(headCount) || headCount < 2 || headCount > 10) {
      errors['group.headCount'] = 'Group size must be between 2 and 10 people.';
    }
  }

  if (!draft.group.contactPerson.trim()) {
    errors['group.contactPerson'] = 'Contact person is required.';
  }

  const seenEmails = new Map<string, number[]>();
  const parsedHeadCount = Number.parseInt(draft.group.headCount, 10);

  draft.group.participants.forEach((participant, index) => {
    const namePath = `group.participants.${index}.name`;
    const emailPath = `group.participants.${index}.email`;
    const trimmedName = participant.name.trim();
    const trimmedEmail = participant.email.trim();
    const hasRowData = Boolean(trimmedName || trimmedEmail);

    if (!hasRowData) {
      errors[namePath] = 'Enter a participant name or remove this row.';
      errors[emailPath] = 'Enter a participant email or remove this row.';
      return;
    }

    if (!trimmedName) {
      errors[namePath] = 'Participant name is required.';
    } else if (trimmedName.length < 2 || trimmedName.length > 20) {
      errors[namePath] = 'Participant name must be between 2 and 20 characters.';
    }

    if (!trimmedEmail) {
      errors[emailPath] = 'Participant email is required.';
    } else if (!isEmailValid(trimmedEmail)) {
      errors[emailPath] = 'Enter a valid participant email.';
    } else {
      const normalized = normalizeEmail(trimmedEmail);
      const indexes = seenEmails.get(normalized) ?? [];
      indexes.push(index);
      seenEmails.set(normalized, indexes);

      if (normalizeEmail(applicantEmail) === normalized) {
        errors[emailPath] = 'This email is already used by the main applicant.';
      }
    }
  });

  seenEmails.forEach((indexes) => {
    if (indexes.length < 2) {
      return;
    }

    indexes.forEach((index) => {
      errors[`group.participants.${index}.email`] = 'Participant emails must be unique.';
    });
  });

  if (!Number.isNaN(parsedHeadCount) && draft.group.participants.length > parsedHeadCount) {
    errors['group.participants'] = 'Participant rows cannot exceed the declared group size.';
  }

  return errors;
}

export function validateStep3(draft: EnrollmentDraft): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!draft.agreedToTerms) {
    errors.agreedToTerms = 'You must agree to the Terms of Use before submitting.';
  }

  return errors;
}

export function getStepFromErrorPaths(errors: ValidationErrors): FormStep {
  const paths = Object.keys(errors);

  if (paths.some((path) => path === 'courseId' || path === 'type')) {
    return 1;
  }

  if (paths.some((path) => path.startsWith('applicant.') || path.startsWith('group.'))) {
    return 2;
  }

  return 3;
}
