export const COURSE_CATEGORIES = ['development', 'design', 'marketing', 'business'] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  instructor: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: CourseCategory[];
}
