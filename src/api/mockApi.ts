import { COURSE_CATEGORIES, type CourseListResponse } from '../types/course';
import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '../types/enrollment';
import { COURSE_DATA, getCourseById } from '../data/courses';
import { isEmailValid, isKoreanPhoneValid, normalizeEmail } from '../lib/validation';
import { loadEnrollmentRecords, saveEnrollmentRecords } from '../lib/storage';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function raiseError(error: ErrorResponse): never {
  throw error;
}

function getRequestedSeatCount(request: EnrollmentRequest): number {
  return request.type === 'group' ? request.group.headCount : 1;
}

function getRegisteredEmails(request: EnrollmentRequest): string[] {
  const applicantEmail = normalizeEmail(request.applicant.email);

  if (request.type === 'personal') {
    return [applicantEmail];
  }

  return [applicantEmail, ...request.group.participants.map((participant) => normalizeEmail(participant.email))];
}

function validateRequest(request: EnrollmentRequest): Record<string, string> {
  const details: Record<string, string> = {};

  if (!request.courseId || !getCourseById(request.courseId)) {
    details.courseId = 'Please select a valid course.';
  }

  if (!request.applicant.name || request.applicant.name.trim().length < 2 || request.applicant.name.trim().length > 20) {
    details['applicant.name'] = 'Applicant name must be between 2 and 20 characters.';
  }

  if (!request.applicant.email || !isEmailValid(request.applicant.email)) {
    details['applicant.email'] = 'Please enter a valid applicant email.';
  }

  if (!request.applicant.phone || !isKoreanPhoneValid(request.applicant.phone)) {
    details['applicant.phone'] = 'Please enter a valid Korean phone number.';
  }

  if ((request.applicant.motivation ?? '').trim().length > 300) {
    details['applicant.motivation'] = 'Motivation must be 300 characters or fewer.';
  }

  if (!request.agreedToTerms) {
    details.agreedToTerms = 'Terms agreement is required.';
  }

  if (request.type === 'group') {
    if (!request.group.organizationName.trim()) {
      details['group.organizationName'] = 'Organization name is required.';
    }

    if (!Number.isInteger(request.group.headCount) || request.group.headCount < 2 || request.group.headCount > 10) {
      details['group.headCount'] = 'Group size must be between 2 and 10 people.';
    }

    if (!request.group.contactPerson.trim()) {
      details['group.contactPerson'] = 'Contact person is required.';
    }

    const emailMap = new Map<string, number[]>();

    request.group.participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        details[`group.participants.${index}.name`] = 'Participant name is required.';
      }

      if (!participant.email.trim() || !isEmailValid(participant.email)) {
        details[`group.participants.${index}.email`] = 'Participant email must be valid.';
      } else {
        const normalized = normalizeEmail(participant.email);
        const indexes = emailMap.get(normalized) ?? [];
        indexes.push(index);
        emailMap.set(normalized, indexes);

        if (normalizeEmail(request.applicant.email) === normalized) {
          details[`group.participants.${index}.email`] = 'Participant email must be different from the applicant email.';
        }
      }
    });

    emailMap.forEach((indexes) => {
      if (indexes.length < 2) {
        return;
      }

      indexes.forEach((index) => {
        details[`group.participants.${index}.email`] = 'Participant emails must be unique.';
      });
    });

    if (request.group.participants.length > request.group.headCount) {
      details['group.participants'] = 'Participant rows cannot exceed the declared group size.';
    }
  }

  return details;
}

export async function getCourses(category?: string): Promise<CourseListResponse> {
  await delay(450);

  return {
    courses: category ? COURSE_DATA.filter((course) => course.category === category) : COURSE_DATA,
    categories: [...COURSE_CATEGORIES]
  };
}

export async function submitEnrollment(request: EnrollmentRequest): Promise<EnrollmentResponse> {
  await delay(900);

  const validationDetails = validateRequest(request);

  if (Object.keys(validationDetails).length > 0) {
    raiseError({
      code: 'INVALID_INPUT',
      message: 'Some fields did not pass server validation.',
      details: validationDetails
    });
  }

  const selectedCourse = getCourseById(request.courseId);

  if (!selectedCourse) {
    raiseError({
      code: 'INVALID_INPUT',
      message: 'The selected course no longer exists.',
      details: {
        courseId: 'Please choose a different course.'
      }
    });
  }

  const storedRecords = loadEnrollmentRecords();
  const requestedSeats = getRequestedSeatCount(request);
  const consumedSeats = storedRecords
    .filter((record) => record.courseId === request.courseId)
    .reduce((total, record) => total + record.seatCount, selectedCourse.currentEnrollment);

  if (consumedSeats + requestedSeats > selectedCourse.maxCapacity) {
    raiseError({
      code: 'COURSE_FULL',
      message: 'The selected course does not have enough seats left for this application.'
    });
  }

  const requestEmails = getRegisteredEmails(request);
  const hasDuplicateEnrollment = storedRecords.some(
    (record) =>
      record.courseId === request.courseId &&
      requestEmails.some((email) => record.applicantEmail === email || record.participantEmails.includes(email))
  );

  if (hasDuplicateEnrollment) {
    raiseError({
      code: 'DUPLICATE_ENROLLMENT',
      message: 'An application already exists for this course with one of the submitted email addresses.'
    });
  }

  const enrollmentId = `ENR-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const response: EnrollmentResponse = {
    enrollmentId,
    status: request.type === 'group' && request.group.headCount >= 6 ? 'pending' : 'confirmed',
    enrolledAt: new Date().toISOString()
  };

  storedRecords.push({
    enrollmentId,
    courseId: request.courseId,
    applicantEmail: normalizeEmail(request.applicant.email),
    participantEmails:
      request.type === 'group' ? request.group.participants.map((participant) => normalizeEmail(participant.email)) : [],
    seatCount: requestedSeats,
    enrolledAt: response.enrolledAt,
    status: response.status
  });
  saveEnrollmentRecords(storedRecords);

  return response;
}
