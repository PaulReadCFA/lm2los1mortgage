/**
 * Results Display Module
 * Renders mortgage payment and analysis results
 */

import { formatCurrency, createElement } from './utils.js';

/**
 * Render results and analysis section
 * @param {Object} calc - Calculation results {payment, totals}
 * @param {Object} inputs - Input parameters {years}
 */
export function renderResults(calc, inputs) {
  const container = document.getElementById('results-content');
  
  if (!container) {
    console.error('Results container not found');
    return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Create payment result box
  const paymentBox = createPaymentBox(calc.payment);
  container.appendChild(paymentBox);
  
  // Create totals analysis box
  const totalsBox = createTotalsBox(calc.totals, inputs.years);
  container.appendChild(totalsBox);
}

/**
 * Create annual payment display box
 * @param {number} payment - Annual payment amount
 * @returns {Element} Payment box element
 */
function createPaymentBox(payment) {
  const box = createElement('div', { className: 'result-box price' });
  
  const title = createElement('h5', { className: 'result-title price' }, 
    'Annual Payment (PMT)'
  );
  box.appendChild(title);
  
  const valueContainer = createElement('div', { className: 'result-value' });
  
  // Payment value with aria-live for screen reader announcements
  const priceValue = createElement('div', {
    'aria-live': 'polite',
    'aria-atomic': 'true'
  }, formatCurrency(payment));
  valueContainer.appendChild(priceValue);
  
  // Per year text
  const parText = createElement('span', { className: 'result-value-small' }, 
    ' per year'
  );
  valueContainer.appendChild(parText);
  
  box.appendChild(valueContainer);
  
  return box;
}

/**
 * Create totals analysis box
 * @param {Object} totals - Totals object {interest, principal, payment}
 * @param {number} years - Loan term in years
 * @returns {Element} Totals box element
 */
function createTotalsBox(totals, years) {
  const box = createElement('div', { className: 'result-box analysis' });
  
  const title = createElement('h5', { className: 'result-title analysis' }, 
    'Payment Breakdown'
  );
  box.appendChild(title);
  
  const content = createElement('div', { 
    className: 'analysis-content',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  });
  
  // Analysis header
  const headerDiv = createElement('div', { className: 'analysis-type' }, 
    `Over ${years} year${years === 1 ? '' : 's'}`
  );
  content.appendChild(headerDiv);
  
  // Calculate interest percentage
  const interestPercent = ((totals.interest / totals.payment) * 100).toFixed(1);
  
  // Summary text
  const summaryDiv = createElement('div');
  summaryDiv.textContent = `Total of ${formatCurrency(totals.payment)} includes ${interestPercent}% interest`;
  content.appendChild(summaryDiv);
  
  // Breakdown details
  const breakdownDiv = createElement('div', { className: 'analysis-details' });
  
  const totalInterestDiv = createElement('div');
  totalInterestDiv.textContent = `Interest: ${formatCurrency(totals.interest)}`;
  breakdownDiv.appendChild(totalInterestDiv);
  
  const totalPrincipalDiv = createElement('div');
  totalPrincipalDiv.textContent = `Principal: ${formatCurrency(totals.principal)}`;
  breakdownDiv.appendChild(totalPrincipalDiv);
  
  content.appendChild(breakdownDiv);
  box.appendChild(content);
  
  return box;
}