import type { Course, CourseCategory } from '../types/course';
import type { ApplicationType, ErrorResponse, ValidationErrors } from '../types/enrollment';
import { formatApplicationType, formatCategory, formatDateRange, formatPrice, getSeatsLeft } from '../lib/format';

interface CourseSelectionStepProps {
  categories: CourseCategory[];
  activeCategory: CourseCategory | 'all';
  courses: Course[];
  loading: boolean;
  selectedCourse: Course | null;
  applicationType: ApplicationType;
  errors: ValidationErrors;
  serverError: ErrorResponse | null;
  onCategoryChange: (category: CourseCategory | 'all') => void;
  onCourseSelect: (courseId: string) => void;
  onTypeChange: (type: ApplicationType) => void;
  onNext: () => void;
}

export function CourseSelectionStep({
  categories,
  activeCategory,
  courses,
  loading,
  selectedCourse,
  applicationType,
  errors,
  serverError,
  onCategoryChange,
  onCourseSelect,
  onTypeChange,
  onNext
}: CourseSelectionStepProps) {
  const seatsLeft = selectedCourse ? getSeatsLeft(selectedCourse) : 0;

  return (
    <section className="step-panel">
      {serverError?.code === 'INVALID_INPUT' ? (
        <div className="alert alert--danger" role="alert">
          {serverError.message}
        </div>
      ) : null}

      <div className="panel-grid panel-grid--course">
        <div className="panel-card">
          <div className="section-heading">
            <span className="section-heading__eyebrow">Step 1</span>
            <h2>Select a course</h2>
            <p>Pick a course, compare capacity, and choose whether you are registering alone or on behalf of a group.</p>
          </div>

          <div className="filter-row" role="tablist" aria-label="Course categories">
            <button
              type="button"
              className={`filter-chip ${activeCategory === 'all' ? 'is-active' : ''}`}
              onClick={() => onCategoryChange('all')}
            >
              All categories
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`filter-chip ${activeCategory === category ? 'is-active' : ''}`}
                onClick={() => onCategoryChange(category)}
              >
                {formatCategory(category)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="state-card">
              <h3>Loading course catalog</h3>
              <p>Please wait while we load the latest course list.</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="state-card">
              <h3>No courses in this category</h3>
              <p>Try a different category filter to see more options.</p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => {
                const courseSeatsLeft = getSeatsLeft(course);
                const isSelected = selectedCourse?.id === course.id;
                const isFull = courseSeatsLeft === 0;
                const isAlmostFull = courseSeatsLeft > 0 && courseSeatsLeft <= 3;

                return (
                  <button
                    type="button"
                    key={course.id}
                    className={`course-card ${isSelected ? 'is-selected' : ''} ${isFull ? 'is-disabled' : ''}`}
                    onClick={() => onCourseSelect(course.id)}
                    disabled={isFull}
                    data-field-path="courseId"
                    aria-pressed={isSelected}
                  >
                    <div className="course-card__header">
                      <span className="badge">{formatCategory(course.category)}</span>
                      <span className={`capacity-tag ${isFull ? 'is-full' : isAlmostFull ? 'is-tight' : ''}`}>
                        {isFull ? 'Full' : `${courseSeatsLeft} seats left`}
                      </span>
                    </div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <dl className="course-card__meta">
                      <div>
                        <dt>Schedule</dt>
                        <dd>{formatDateRange(course)}</dd>
                      </div>
                      <div>
                        <dt>Instructor</dt>
                        <dd>{course.instructor}</dd>
                      </div>
                      <div>
                        <dt>Price</dt>
                        <dd>{formatPrice(course.price)}</dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          )}

          {errors.courseId ? (
            <p className="inline-error" role="alert">
              {errors.courseId}
            </p>
          ) : null}
        </div>

        <aside className="panel-card panel-card--summary">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__eyebrow">Selection summary</span>
            <h2>{selectedCourse ? selectedCourse.title : 'No course selected yet'}</h2>
            <p>
              {selectedCourse
                ? 'Review the selected course details before moving to the applicant information step.'
                : 'Choose a course to see its schedule, price, and availability here.'}
            </p>
          </div>

          {selectedCourse ? (
            <>
              <dl className="summary-list">
                <div>
                  <dt>Category</dt>
                  <dd>{formatCategory(selectedCourse.category)}</dd>
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
                  <dt>Capacity</dt>
                  <dd>
                    {selectedCourse.currentEnrollment} / {selectedCourse.maxCapacity} enrolled
                  </dd>
                </div>
              </dl>

              {seatsLeft > 0 && seatsLeft <= 3 ? (
                <div className="alert alert--warning" role="status">
                  This course is almost full. Seats may run out before you submit, so review the form promptly.
                </div>
              ) : null}
            </>
          ) : (
            <div className="placeholder-card">
              <p>Pick any course card from the list to continue.</p>
            </div>
          )}

          <div className="type-switcher" role="radiogroup" aria-label="Application type">
            {(['personal', 'group'] as ApplicationType[]).map((type) => (
              <label
                key={type}
                className={`type-switcher__option ${applicationType === type ? 'is-active' : ''}`}
              >
                <input
                  type="radio"
                  name="application-type"
                  value={type}
                  checked={applicationType === type}
                  onChange={() => onTypeChange(type)}
                  data-field-path="type"
                />
                <span>{formatApplicationType(type)}</span>
              </label>
            ))}
          </div>

          {errors.type ? (
            <p className="inline-error" role="alert">
              {errors.type}
            </p>
          ) : null}

          <button type="button" className="button button--primary button--block" onClick={onNext}>
            Continue to student information
          </button>
        </aside>
      </div>
    </section>
  );
}
