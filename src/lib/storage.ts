import { createEmptyDraft, createEmptyGroupDraft } from './draft';
import type { EnrollmentDraft, StoredDraftSnapshot, StoredEnrollmentRecord } from '../types/enrollment';

const DRAFT_STORAGE_KEY = 'course-registration-draft-v1';
const ENROLLMENT_STORAGE_KEY = 'course-registration-submissions-v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeDraft(input: EnrollmentDraft | null | undefined): EnrollmentDraft {
  const empty = createEmptyDraft();

  if (!input) {
    return empty;
  }

  return {
    ...empty,
    ...input,
    applicant: {
      ...empty.applicant,
      ...input.applicant
    },
    group: {
      ...createEmptyGroupDraft(),
      ...input.group,
      participants: Array.isArray(input.group?.participants)
        ? input.group.participants.map((participant, index) => ({
            id: participant.id || `restored-participant-${index + 1}`,
            name: participant.name ?? '',
            email: participant.email ?? ''
          }))
        : []
    }
  };
}

export function loadDraftSnapshot(): StoredDraftSnapshot | null {
  if (!isBrowser()) {
    return null;
  }

  const parsed = safeParse<StoredDraftSnapshot>(window.localStorage.getItem(DRAFT_STORAGE_KEY));

  if (!parsed || parsed.version !== 1) {
    return null;
  }

  return {
    ...parsed,
    draft: normalizeDraft(parsed.draft)
  };
}

export function saveDraftSnapshot(draft: EnrollmentDraft): void {
  if (!isBrowser()) {
    return;
  }

  const payload: StoredDraftSnapshot = {
    version: 1,
    savedAt: new Date().toISOString(),
    draft
  };

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearDraftSnapshot(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function loadEnrollmentRecords(): StoredEnrollmentRecord[] {
  if (!isBrowser()) {
    return [];
  }

  return safeParse<StoredEnrollmentRecord[]>(window.localStorage.getItem(ENROLLMENT_STORAGE_KEY)) ?? [];
}

export function saveEnrollmentRecords(records: StoredEnrollmentRecord[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(records));
}
