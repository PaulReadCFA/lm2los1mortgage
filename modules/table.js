/**
 * Reusable semantic table (from CFA toolkit).
 * Pass data + config to render.
 */
import { formatCurrency, createElement } from './utils.js';


export function renderTable(data, config) {
  const tableElement = document.getElementById(config.tableId);
  if (!tableElement) {
    console.error('Table element not found');
    return;
  }

  tableElement.innerHTML = '';

  // Caption for screen readers
  const caption = createElement('caption', { className: 'sr-only' }, config.caption);
  tableElement.appendChild(caption);

  // Header
  const thead = createElement('thead');
  const headerRow = createElement('tr');

  config.columns.forEach(col => {
    const th = createElement('th', {
      scope: 'col',
      className: col.align === 'right' ? 'text-right' : 'text-left'
    }, col.header);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  tableElement.appendChild(thead);

  // Body
  const tbody = createElement('tbody');

  data.forEach(row => {
    const tr = createElement('tr');

    config.columns.forEach((col, idx) => {
      const cellElement = idx === 0 ?
        createElement('th', { scope: 'row', className: 'text-left' }) :
        createElement('td', { className: col.align === 'right' ? 'text-right' : 'text-left' });

      const value = row[col.key];

      if (value === 0 || value === null || value === undefined) {
        const span = createElement('span', { 'aria-label': 'No value' }, '—');
        cellElement.appendChild(span);
      } else {
        cellElement.textContent = col.format ? col.format(value) : value;
      }

      tr.appendChild(cellElement);
    });

    tbody.appendChild(tr);
  });

  tableElement.appendChild(tbody);

  // Footer totals
  if (config.totals) {
    const tfoot = createElement('tfoot');
    const footerRow = createElement('tr');

    config.columns.forEach((col, idx) => {
      const cellElement = idx === 0 ?
        createElement('th', { scope: 'row', className: 'text-left' }, 'Total') :
        createElement('td', { className: 'text-right' });

      if (idx > 0 && config.totals[col.key] !== undefined) {
        cellElement.textContent = col.format ?
          col.format(config.totals[col.key]) :
          config.totals[col.key];
      }

      footerRow.appendChild(cellElement);
    });

    tfoot.appendChild(footerRow);
    tableElement.appendChild(tfoot);
  }
}