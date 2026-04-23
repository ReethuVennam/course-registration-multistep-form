import type { Course } from '../types/course';

export const COURSE_DATA: Course[] = [
  {
    id: 'dev-react-bootcamp',
    title: 'React Product Engineering Bootcamp',
    description: 'Build production-ready interfaces with TypeScript, state patterns, and collaborative frontend workflows.',
    category: 'development',
    price: 420000,
    maxCapacity: 24,
    currentEnrollment: 21,
    startDate: '2026-05-12T09:00:00+09:00',
    endDate: '2026-06-30T18:00:00+09:00',
    instructor: 'Jisoo Park'
  },
  {
    id: 'dev-node-api',
    title: 'Node.js API Architecture Lab',
    description: 'Design resilient APIs with validation, testing, and deployment practices for modern web services.',
    category: 'development',
    price: 390000,
    maxCapacity: 20,
    currentEnrollment: 12,
    startDate: '2026-05-20T19:00:00+09:00',
    endDate: '2026-07-01T21:30:00+09:00',
    instructor: 'Minho Lee'
  },
  {
    id: 'design-ui-system',
    title: 'UI Systems for Product Teams',
    description: 'Create scalable design systems, documentation patterns, and handoff workflows that teams can maintain.',
    category: 'design',
    price: 360000,
    maxCapacity: 18,
    currentEnrollment: 17,
    startDate: '2026-05-08T14:00:00+09:00',
    endDate: '2026-06-19T17:00:00+09:00',
    instructor: 'Sora Choi'
  },
  {
    id: 'design-brand-storytelling',
    title: 'Brand Storytelling for Digital Products',
    description: 'Blend messaging, visuals, and campaign thinking into a cohesive product launch narrative.',
    category: 'design',
    price: 310000,
    maxCapacity: 16,
    currentEnrollment: 16,
    startDate: '2026-05-15T10:00:00+09:00',
    endDate: '2026-06-12T16:00:00+09:00',
    instructor: 'Haein Kim'
  },
  {
    id: 'mkt-growth-experiments',
    title: 'Growth Experimentation Sprint',
    description: 'Plan, measure, and communicate growth experiments with channel-specific tactics and KPI tracking.',
    category: 'marketing',
    price: 330000,
    maxCapacity: 28,
    currentEnrollment: 19,
    startDate: '2026-05-18T19:30:00+09:00',
    endDate: '2026-06-29T21:00:00+09:00',
    instructor: 'Daniel Han'
  },
  {
    id: 'mkt-content-funnel',
    title: 'Content Funnel Strategy Studio',
    description: 'Turn content planning into measurable funnel performance with practical campaign frameworks.',
    category: 'marketing',
    price: 280000,
    maxCapacity: 22,
    currentEnrollment: 9,
    startDate: '2026-05-25T13:00:00+09:00',
    endDate: '2026-07-06T15:30:00+09:00',
    instructor: 'Ara Lim'
  },
  {
    id: 'biz-leadership-ops',
    title: 'Operations Leadership for Team Leads',
    description: 'Improve planning, delegation, and cross-functional communication for growing education and product teams.',
    category: 'business',
    price: 370000,
    maxCapacity: 26,
    currentEnrollment: 24,
    startDate: '2026-05-10T09:30:00+09:00',
    endDate: '2026-06-21T12:30:00+09:00',
    instructor: 'Yuna Seo'
  },
  {
    id: 'biz-data-storytelling',
    title: 'Data Storytelling for Business Decisions',
    description: 'Translate metrics into persuasive recommendations with concise visual narratives and stakeholder-ready reports.',
    category: 'business',
    price: 340000,
    maxCapacity: 30,
    currentEnrollment: 15,
    startDate: '2026-05-27T18:30:00+09:00',
    endDate: '2026-07-08T20:30:00+09:00',
    instructor: 'Kevin Jeong'
  }
];

export function getCourseById(courseId: string): Course | undefined {
  return COURSE_DATA.find((course) => course.id === courseId);
}
