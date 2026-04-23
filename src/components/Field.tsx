import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, required = false, helper, error, className, children }: FieldProps) {
  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      <label className="field__label" htmlFor={htmlFor}>
        <span>{label}</span>
        {required ? <span className="field__required">Required</span> : null}
      </label>
      {children}
      {error ? (
        <p className="field__message field__message--error" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="field__message">{helper}</p>
      ) : null}
    </div>
  );
}
