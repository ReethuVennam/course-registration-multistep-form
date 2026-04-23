import type { FormStep } from '../types/enrollment';

const STEPS: Array<{ id: FormStep; label: string; description: string }> = [
  { id: 1, label: 'Choose course', description: 'Course and application type' },
  { id: 2, label: 'Student info', description: 'Applicant and group details' },
  { id: 3, label: 'Confirm', description: 'Review, agree, and submit' }
];

interface StepIndicatorProps {
  currentStep: FormStep;
  onSelectStep: (step: FormStep) => void;
}

export function StepIndicator({ currentStep, onSelectStep }: StepIndicatorProps) {
  return (
    <ol className="step-indicator" aria-label="Registration progress">
      {STEPS.map((step, index) => {
        const status =
          step.id === currentStep ? 'current' : step.id < currentStep ? 'complete' : 'upcoming';

        return (
          <li key={step.id} className={`step-indicator__item step-indicator__item--${status}`}>
            <button
              type="button"
              className="step-indicator__button"
              onClick={() => onSelectStep(step.id)}
              disabled={step.id > currentStep}
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              <span className="step-indicator__count">{index + 1}</span>
              <span className="step-indicator__content">
                <span className="step-indicator__label">{step.label}</span>
                <span className="step-indicator__description">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
