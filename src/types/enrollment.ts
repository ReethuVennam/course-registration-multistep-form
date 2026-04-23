import type { CourseCategory } from './course';

export type ApplicationType = 'personal' | 'group';
export type FormStep = 1 | 2 | 3;

export interface ApplicantDraft {
  name: string;
  email: string;
  phone: string;
  motivation: string;
}

export interface GroupParticipantDraft {
  id: string;
  name: string;
  email: string;
}

export interface GroupDraft {
  organizationName: string;
  headCount: string;
  participants: GroupParticipantDraft[];
  contactPerson: string;
}

export interface EnrollmentDraft {
  courseId: string;
  categoryFilter: CourseCategory | 'all';
  type: ApplicationType;
  applicant: ApplicantDraft;
  group: GroupDraft;
  agreedToTerms: boolean;
}

export interface PersonalEnrollmentRequest {
  courseId: string;
  type: 'personal';
  applicant: {
    name: string;
    email: string;
    phone: string;
    motivation?: string;
  };
  agreedToTerms: boolean;
}

export interface GroupEnrollmentRequest {
  courseId: string;
  type: 'group';
  applicant: {
    name: string;
    email: string;
    phone: string;
    motivation?: string;
  };
  group: {
    organizationName: string;
    headCount: number;
    participants: Array<{ name: string; email: string }>;
    contactPerson: string;
  };
  agreedToTerms: boolean;
}

export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

export interface EnrollmentResponse {
  enrollmentId: string;
  status: 'confirmed' | 'pending';
  enrolledAt: string;
}

export interface ErrorResponse {
  code: 'COURSE_FULL' | 'DUPLICATE_ENROLLMENT' | 'INVALID_INPUT' | 'UNKNOWN';
  message: string;
  details?: Record<string, string>;
}

export type ValidationErrors = Record<string, string>;

export interface StoredDraftSnapshot {
  version: 1;
  savedAt: string;
  draft: EnrollmentDraft;
}

export interface StoredEnrollmentRecord {
  enrollmentId: string;
  courseId: string;
  applicantEmail: string;
  participantEmails: string[];
  seatCount: number;
  enrolledAt: string;
  status: 'confirmed' | 'pending';
}
