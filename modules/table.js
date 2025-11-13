/**
 * Table Rendering - Annual amortization schedule
 * Semantic, accessible alternative to chart
 */

import { $ } from './utils.js';

/**
 * Render annual amortization table
 * @param {Object} result - Calculation results with schedule
 */
export function renderTable({ schedule }) {
  const tbody = $('#table-body');
  
  if (!schedule || schedule.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No data available</td></tr>';
    return;
  }

  tbody.innerHTML = schedule.map((row, index) => `
    <tr>
      <th scope="row">Year ${row.year}</th>
      <td>$${formatCurrency(row.principal)}</td>
      <td>$${formatCurrency(row.interest)}</td>
      <td>$${formatCurrency(row.totalPayment)}</td>
      <td>$${formatCurrency(row.remainingBalance)}</td>
    </tr>
  `).join('');
}

/**
 * Format number as currency
 * @param {number} value - Number to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}