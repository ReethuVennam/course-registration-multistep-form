import type { ApplicationType } from '../types/enrollment';
import type { Course, CourseCategory } from '../types/course';

const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const categoryLabels: Record<CourseCategory, string> = {
  development: 'Development',
  design: 'Design',
  marketing: 'Marketing',
  business: 'Business'
};

const applicationTypeLabels: Record<ApplicationType, string> = {
  personal: 'Individual application',
  group: 'Group application'
};

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatDateRange(course: Course): string {
  return `${dateFormatter.format(new Date(course.startDate))} - ${dateFormatter.format(new Date(course.endDate))}`;
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatCategory(category: CourseCategory): string {
  return categoryLabels[category];
}

export function formatApplicationType(type: ApplicationType): string {
  return applicationTypeLabels[type];
}

export function formatEnrollmentStatus(status: 'confirmed' | 'pending'): string {
  return status === 'confirmed' ? 'Confirmed' : 'Pending review';
}

export function getSeatsLeft(course: Course): number {
  return Math.max(course.maxCapacity - course.currentEnrollment, 0);
}

export function formatPhonePreview(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length >= 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  return value;
}
