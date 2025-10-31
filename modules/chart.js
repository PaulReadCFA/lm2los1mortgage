/**
 * Chart Module - Mortgage Calculator
 * Chart rendering using Chart.js with full keyboard accessibility
 */

import { formatCurrency } from './utils.js';

// CFA Brand Colors (WCAG AA verified)
const COLORS = {
  principal: '#3369FF',   // 4.55:1 contrast - Amortization
  interest: '#ea792d',    // Interest payments
  darkText: '#06005a'     // Focus indicator
};

let chartInstance = null;
let currentFocusIndex = 0;
let isKeyboardMode = false;

/**
 * Create or update mortgage cash flow chart
 * @param {Array} rows - Array of mortgage schedule objects
 * @param {boolean} showLabels - Whether to show value labels
 */
export function renderChart(rows, showLabels = true) {
  const canvas = document.getElementById('mortgage-chart');
  
  if (!canvas) {
    console.error('Chart canvas not found');
    return;
  }
  
  // Make canvas focusable and add keyboard navigation
    // Make canvas focusable and add keyboard navigation
 canvas.setAttribute('tabindex', '0');
canvas.setAttribute('role', 'img');
canvas.setAttribute('aria-roledescription', 'interactive chart');
canvas.setAttribute(
  'aria-label',
  'Interactive chart. Press Enter to focus, then use arrow keys to explore data points.'
);
  // Allow Enter to activate keyboard navigation from wrapper
const container = canvas.parentElement;
if (container) {
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      canvas.focus();
    }
  });
}
  
  const ctx = canvas.getContext('2d');
  
  // Prepare data for Chart.js
  const labels = rows.map(r => r.year);  // Just the year number, not "Year X"
  const interest = rows.map(r => r.interest);
  const principal = rows.map(r => r.principal);
  const totalPayment = rows.map(r => r.payment);
  
  // Destroy existing chart instance
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Reset focus index
  currentFocusIndex = 0;
  
  // Create new chart with custom plugins
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Amortization (Principal)',
          data: principal,
          backgroundColor: COLORS.principal,
          borderColor: '#333',
          borderWidth: 1,
          stack: 'cash'
        },
        {
          label: 'Interest',
          data: interest,
          backgroundColor: COLORS.interest,
          borderColor: '#333',
          borderWidth: 1,
          stack: 'cash'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
onHover: (event, activeElements) => {
  // Skip if keyboard focus already active
  if (isKeyboardMode && document.activeElement === canvas) return;

  // Announce hovered data point
  if (activeElements.length > 0) {
    const index = activeElements[0].index;
    announceDataPoint(rows[index], totalPayment[index]);
  }
}

,
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false // Using custom legend in HTML
        },
        tooltip: {
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex;
              return `Year ${rows[index].year}`;
            },
            label: (context) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${formatCurrency(value)}`;
            },
            footer: (context) => {
              const index = context[0].dataIndex;
              const payment = totalPayment[index];
              return `Total Payment: ${formatCurrency(payment)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          },
          grid: {
            display: false
          },
          stacked: true
        },
        y: {
          title: {
            display: true,
            text: 'Annual Cash Flow ($)'
          },
          ticks: {
            callback: function(value) {
              // Format as number with commas, no $ since axis title has it
              return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          stacked: true
        }
      },
      layout: {
        padding: {
          left: 20, // Important per CFA standard
          right: 30,
          top: showLabels ? 40 : 20,
          bottom: 60
        }
      }
    },
    plugins: [
      {
        // Custom plugin to draw labels on top of stacked bars
        // Only enabled for small datasets to prevent overlap
        id: 'stackedBarLabels',
        afterDatasetsDraw: (chart) => {
          // Only show labels if showLabels is true AND we have 10 or fewer bars
          if (!showLabels || rows.length > 10) return;
          
          const ctx = chart.ctx;
          ctx.save();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = COLORS.darkText;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          const meta0 = chart.getDatasetMeta(0);
          const meta1 = chart.getDatasetMeta(1);
          
          chart.data.labels.forEach((label, index) => {
            const payment = totalPayment[index];
            if (Math.abs(payment) < 0.01) return;
            
            if (!meta0.data[index] || !meta1.data[index]) return;
            
            const bar0 = meta0.data[index];
            const bar1 = meta1.data[index];
            
            const x = bar1.x;
            const y = Math.min(bar0.y, bar1.y) - 5;
            
            // Draw the payment label
            ctx.fillText(formatCurrency(payment), x, y);
          });
          
          ctx.restore();
        }
      },
      {
        // Outer borders plugin
        id: 'outerBorders',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;

          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar) => {
              const x = bar.x - bar.width / 2;
              const y = Math.min(bar.y, bar.base);
              const width = bar.width;
              const height = Math.abs(bar.base - bar.y);

              ctx.strokeRect(x, y, width, height);
            });
          });

          ctx.restore();
        }
      },
      {
        // Keyboard focus highlight plugin
        id: 'keyboardFocus',
        afterDatasetsDraw: (chart) => {
          if (document.activeElement !== canvas) return;
          
          const ctx = chart.ctx;
          const meta0 = chart.getDatasetMeta(0);
          const meta1 = chart.getDatasetMeta(1);
          
          if (!meta0.data[currentFocusIndex] || !meta1.data[currentFocusIndex]) return;
          
          const bar0 = meta0.data[currentFocusIndex];
          const bar1 = meta1.data[currentFocusIndex];
          
          // Find the actual top and bottom of the stacked bars
          const allYValues = [bar0.y, bar0.base, bar1.y, bar1.base];
          const topY = Math.min(...allYValues);
          const bottomY = Math.max(...allYValues);
          
          // Draw focus indicator
          ctx.save();
          ctx.strokeStyle = COLORS.darkText;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          
          const x = bar1.x - bar1.width / 2 - 4;
          const y = topY - 4;
          const width = bar1.width + 8;
          const height = bottomY - topY + 8;
          
          ctx.strokeRect(x, y, width, height);
          ctx.restore();
        }
      }
    ]
  });
  
  // Add keyboard navigation
  setupKeyboardNavigation(canvas, rows, totalPayment);
}

/**
 * Setup keyboard navigation for the chart
 * @param {HTMLCanvasElement} canvas - The chart canvas
 * @param {Array} rows - Array of mortgage schedule objects
 * @param {Array} totalPayment - Array of total payment values
 */
function setupKeyboardNavigation(canvas, rows, totalPayment) {
  // Remove existing listeners to avoid duplicates
  const oldListener = canvas._keydownListener;
  if (oldListener) {
    canvas.removeEventListener('keydown', oldListener);
  }
  
  // Create new listener
  const keydownListener = (e) => {
    const maxIndex = rows.length - 1;
    let newIndex = currentFocusIndex;
    
    // Enable keyboard mode on any arrow key press
    isKeyboardMode = true;
    
    switch(e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(currentFocusIndex + 1, maxIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(currentFocusIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = maxIndex;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentFocusIndex) {
      currentFocusIndex = newIndex;
      chartInstance.update('none'); // Update without animation
      announceDataPoint(rows[currentFocusIndex], totalPayment[currentFocusIndex]);
      
      // Show tooltip at focused bar
      showTooltipAtIndex(currentFocusIndex);
    }
  };
  
  // Store listener reference for cleanup
  canvas._keydownListener = keydownListener;
  canvas.addEventListener('keydown', keydownListener);
  
  // Focus handler to redraw focus indicator and show initial tooltip
  const focusListener = () => {
    isKeyboardMode = true;
    showTooltipAtIndex(currentFocusIndex);
    announceDataPoint(rows[currentFocusIndex], totalPayment[currentFocusIndex]);
  };
  
  const blurListener = () => {
    chartInstance.tooltip.setActiveElements([], {x: 0, y: 0});
    chartInstance.update('none');
  };
  
  canvas._focusListener = focusListener;
  canvas._blurListener = blurListener;
  canvas.addEventListener('focus', focusListener);
  canvas.addEventListener('blur', blurListener);
  
  // Disable keyboard mode when mouse moves over chart
  const mouseMoveListener = () => {
    isKeyboardMode = false;
  };
  
  canvas._mouseMoveListener = mouseMoveListener;
  canvas.addEventListener('mousemove', mouseMoveListener);
}

/**
 * Show tooltip at a specific data index
 * @param {number} index - Data point index
 */
function showTooltipAtIndex(index) {
  if (!chartInstance) return;
  
  const meta0 = chartInstance.getDatasetMeta(0);
  const meta1 = chartInstance.getDatasetMeta(1);
  
  if (!meta0.data[index] || !meta1.data[index]) return;
  
  // Set active elements for both datasets at this index
  chartInstance.tooltip.setActiveElements([
    {datasetIndex: 0, index: index},
    {datasetIndex: 1, index: index}
  ], {
    x: meta1.data[index].x,
    y: meta1.data[index].y
  });
  
  chartInstance.update('none');
}

/**
 * Announce data point for screen readers
 * @param {Object} row - Mortgage schedule row object
 * @param {number} payment - Total payment amount
 */
function announceDataPoint(row, payment) {
  // Create or update live region for screen reader announcements
  let liveRegion = document.getElementById('chart-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'chart-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  const announcement = `Year ${row.year}. ` +
    `Interest payment: ${formatCurrency(row.interest)}. ` +
    `Principal payment: ${formatCurrency(row.principal)}. ` +
    `Total payment: ${formatCurrency(payment)}. ` +
    `Remaining balance: ${formatCurrency(row.endingBalance)}.`;
  
  liveRegion.textContent = announcement;
}

/**
 * Update chart visibility based on window width
 * @returns {boolean} True if labels should be shown
 */
export function shouldShowLabels() {
  return window.innerWidth > 860;
}

/**
 * Cleanup chart resources
 */
export function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}