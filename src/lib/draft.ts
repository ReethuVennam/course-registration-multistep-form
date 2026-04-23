import type {
  EnrollmentDraft,
  EnrollmentRequest,
  GroupDraft,
  GroupEnrollmentRequest,
  GroupParticipantDraft,
  PersonalEnrollmentRequest
} from '../types/enrollment';

let participantSeed = 0;

export function createParticipant(): GroupParticipantDraft {
  participantSeed += 1;

  return {
    id: `participant-${participantSeed}`,
    name: '',
    email: ''
  };
}

export function createEmptyGroupDraft(): GroupDraft {
  return {
    organizationName: '',
    headCount: '',
    participants: [],
    contactPerson: ''
  };
}

export function createEmptyDraft(): EnrollmentDraft {
  return {
    courseId: '',
    categoryFilter: 'all',
    type: 'personal',
    applicant: {
      name: '',
      email: '',
      phone: '',
      motivation: ''
    },
    group: createEmptyGroupDraft(),
    agreedToTerms: false
  };
}

export function hasGroupData(group: GroupDraft): boolean {
  return Boolean(
    group.organizationName.trim() ||
      group.headCount.trim() ||
      group.contactPerson.trim() ||
      group.participants.some((participant) => participant.name.trim() || participant.email.trim())
  );
}

export function isDraftDirty(draft: EnrollmentDraft): boolean {
  return Boolean(
    draft.courseId ||
      draft.type === 'group' ||
      draft.applicant.name.trim() ||
      draft.applicant.email.trim() ||
      draft.applicant.phone.trim() ||
      draft.applicant.motivation.trim() ||
      hasGroupData(draft.group) ||
      draft.agreedToTerms
  );
}

export function countRequestedSeats(draft: EnrollmentDraft): number {
  if (draft.type === 'group') {
    const parsedHeadCount = Number.parseInt(draft.group.headCount, 10);
    return Number.isNaN(parsedHeadCount) ? 0 : parsedHeadCount;
  }

  return 1;
}

function trimApplicant(applicant: EnrollmentDraft['applicant']) {
  const motivation = applicant.motivation.trim();

  return {
    name: applicant.name.trim(),
    email: applicant.email.trim(),
    phone: applicant.phone.trim(),
    ...(motivation ? { motivation } : {})
  };
}

export function buildEnrollmentRequest(draft: EnrollmentDraft): EnrollmentRequest {
  if (draft.type === 'personal') {
    const personalRequest: PersonalEnrollmentRequest = {
      courseId: draft.courseId,
      type: 'personal',
      applicant: trimApplicant(draft.applicant),
      agreedToTerms: draft.agreedToTerms
    };

    return personalRequest;
  }

  const groupRequest: GroupEnrollmentRequest = {
    courseId: draft.courseId,
    type: 'group',
    applicant: trimApplicant(draft.applicant),
    group: {
      organizationName: draft.group.organizationName.trim(),
      headCount: Number.parseInt(draft.group.headCount, 10),
      participants: draft.group.participants
        .filter((participant) => participant.name.trim() || participant.email.trim())
        .map((participant) => ({
          name: participant.name.trim(),
          email: participant.email.trim()
        })),
      contactPerson: draft.group.contactPerson.trim()
    },
    agreedToTerms: draft.agreedToTerms
  };

  return groupRequest;
}
