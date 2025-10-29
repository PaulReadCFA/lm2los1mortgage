/**
 * Validation Module – CFA Standard Pattern
 * Used for inline field validation and error summary rendering.
 */

import { $, announceToScreenReader } from './utils.js';

/* -------------------------------------------------------------
   Validation Rules (customize these per calculator)
------------------------------------------------------------- */
const validationRules = {
  loanAmount: {
    min: 1000,
    max: 10000000,
    label: 'Loan Amount',
    errorMessage: 'Loan amount must be between $1,000 and $10,000,000'
  },
  annualRate: {
    min: 0,
    max: 25,
    label: 'Annual Interest Rate (%)',
    errorMessage: 'Rate must be between 0% and 25%'
  },
  years: {
    min: 1,
    max: 40,
    label: 'Loan Term (Years)',
    errorMessage: 'Term must be between 1 and 40 years'
  }
};

/* -------------------------------------------------------------
   Field-level Validation
------------------------------------------------------------- */
export function validateField(field, value) {
  const rules = validationRules[field];
  if (!rules) return null;

  if (isNaN(value) || value === '') {
    return `${rules.label} is required`;
  }

  if (value < rules.min || value > rules.max) {
    return rules.errorMessage;
  }

  return null;
}

/* -------------------------------------------------------------
   Full-form Validation
------------------------------------------------------------- */
export function validateAllInputs(inputs) {
  const errors = {};
  Object.keys(validationRules).forEach(field => {
    const error = validateField(field, inputs[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

/* -------------------------------------------------------------
   Inline Field Error Updater
------------------------------------------------------------- */
export function updateFieldError(fieldId, errorMessage) {
  const input = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (!input || !errorElement) return;

  if (errorMessage) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `${fieldId}-error`);
    errorElement.textContent = errorMessage;
  } else {
    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
    errorElement.textContent = '';
  }
}

/* -------------------------------------------------------------
   Validation Summary
------------------------------------------------------------- */
export function updateValidationSummary(errors) {
  const summary = $('#validation-summary');
  const list = $('#validation-list');
  if (!summary || !list) return;

  if (hasErrors(errors)) {
    list.innerHTML = '';
    Object.values(errors).forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      list.appendChild(li);
    });
    summary.style.display = 'block';
    announceToScreenReader('Validation errors found.');
  } else {
    summary.style.display = 'none';
    list.innerHTML = '';
  }
}

/* -------------------------------------------------------------
   Helper
------------------------------------------------------------- */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
