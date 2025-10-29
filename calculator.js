// ==================== STATE & CORE ====================
import { state, setState, subscribe } from './modules/state.js';

// ==================== VALIDATION ====================
// These names match the CFA toolkit exactly (REUSABLE_MODULES.md)
import {
  validateAllInputs as validateAll,   // optional alias for clarity
  validateField,
  updateFieldError,
  updateValidationSummary,
  hasErrors
} from './modules/validation.js';

// ==================== UTILITIES ====================
// All safe helpers (focus management, announcer, etc.)
import {
  $,
  $$,
  listen,
  focusElement,
  announceToScreenReader,
  debounce,
  formatCurrency
} from './modules/utils.js';

// ==================== DOMAIN LOGIC ====================
import { computeMortgage } from './modules/calculations.js';

// ==================== VISUALS ====================
import { renderChart, shouldShowLabels, destroyChart } from './modules/chart.js';
import { renderTable } from './modules/table.js';
import { renderResults } from './modules/results.js';



function init(){
  // console.log('Mortgage Calculator initializing...');
  
  setupInputs();
  setupViewToggle();
  setupSkipLinks();
  setupResize();

  // Subscribe to state changes BEFORE initial calculation
  subscribe(handleStateChange);
  
  // Initial compute & render
  recalc();
  
  // Run self-tests (comment out for production)
  // runSelfTests();
  
  // console.log('Mortgage Calculator ready');
}

function setupInputs(){
  const ids = ['loanAmount','annualRate','years'];
  ids.forEach(id=>{
    const el = $(`#${id}`);
    const update = debounce(()=>{
      const val = parseFloat(el.value);
      
      // Get all current values for validation
      const currentValues = {
        loanAmount: id === 'loanAmount' ? val : state.loanAmount,
        annualRate: id === 'annualRate' ? val : state.annualRate,
        years: id === 'years' ? val : state.years
      };

      const errors = validateAll(currentValues);

      updateFieldError(id, errors[id] || null);
      updateValidationSummary(errors);

      // Single setState call to prevent multiple re-renders
      if (Object.keys(errors).length === 0) {
        // Recalculate and update everything at once
        try {
          const { payment, schedule, totals } = computeMortgage(currentValues);
          setState({ 
            [id]: val, 
            errors, 
            payment, 
            schedule, 
            totals 
          });
        } catch(e) {
          console.error('Calculation error', e);
          setState({ 
            [id]: val, 
            errors, 
            schedule: null, 
            payment: null, 
            totals: null 
          });
        }
      } else {
        setState({ 
          [id]: val, 
          errors, 
          schedule: null, 
          payment: null, 
          totals: null 
        });
      }
    }, 150);  // Reduced from 250ms for faster response

    listen(el, 'input', update);
    listen(el, 'change', update);
  });
}

function recalc(){
  try{
    const inputs = { loanAmount: state.loanAmount, annualRate: state.annualRate, years: state.years };
    const errors = validateAll(inputs);
    if (Object.keys(errors).length){ setState({ errors, schedule:null, payment:null, totals:null }); updateValidationSummary(errors); return; }

    const { payment, schedule, totals } = computeMortgage(inputs);
    setState({ payment, schedule, totals });
  }catch(e){
    console.error('Calculation error', e);
    setState({ schedule: null, payment: null, totals: null });
  }
}

function handleStateChange(s) {
  if (!s.schedule || !s.payment || !s.totals) return;

  // === RESULTS CARD ===
  renderResults({ payment: s.payment, totals: s.totals }, { years: s.years });

  // === CHART (only if visible) ===
  if (s.viewMode === 'chart') {
    renderChart(s.schedule, shouldShowLabels());
  }

  // === TABLE (only if visible) ===
  if (s.viewMode === 'table') {
    renderScheduleTable(s.schedule, s.totals);
  }
}


function renderScheduleTable(schedule, totals){
  renderTable(
    schedule.map(row => ({
      year: row.year,
      payment: row.payment,
      interest: row.interest,
      principal: row.principal,
      endingBalance: row.endingBalance
    })),
    {
      tableId: 'data-table-element',
      caption: 'Mortgage amortization schedule: annual payment split into interest and principal with ending balance.',
      columns: [
        { key: 'year', header: 'Year', align: 'left' },
        { key: 'payment', header: 'Payment', align: 'right', format: v => formatCurrency(v) },
        { key: 'interest', header: 'Interest', align: 'right', format: v => formatCurrency(v) },
        { key: 'principal', header: 'Amortization', align: 'right', format: v => formatCurrency(v) },
        { key: 'endingBalance', header: 'Ending Balance', align: 'right', format: v => formatCurrency(v) }
      ],
      totals: {
        payment: totals.payment,
        interest: totals.interest,
        principal: totals.principal,
        endingBalance: 0
      }
    }
  );
}

function setupViewToggle(){
  const chartBtn = $('#chart-view-btn');
  const tableBtn = $('#table-view-btn');
  const chartContainer = $('#chart-container');
  const tableContainer = $('#table-container');
  const legend = $('#chart-legend');

  listen(chartBtn,'click', ()=>{
    setState({ viewMode: 'chart' });
    chartBtn.classList.add('active'); chartBtn.setAttribute('aria-pressed','true');
    tableBtn.classList.remove('active'); tableBtn.setAttribute('aria-pressed','false');
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'none';
    legend.style.display = 'flex';
    announceToScreenReader('Chart view active');
    setTimeout(()=> chartContainer.focus(), 100);
    if (state.schedule) renderChart(state.schedule, shouldShowLabels());
  });

  listen(tableBtn,'click', ()=>{
    setState({ viewMode: 'table' });
    tableBtn.classList.add('active'); tableBtn.setAttribute('aria-pressed','true');
    chartBtn.classList.remove('active'); chartBtn.setAttribute('aria-pressed','false');
    tableContainer.style.display = 'block';
    chartContainer.style.display = 'none';
    legend.style.display = 'none';
    announceToScreenReader('Table view active');
    setTimeout(()=> $('#data-table-element').focus(), 100);
    destroyChart();
    // Render table when switching to table view
    if (state.schedule && state.totals) {
      renderScheduleTable(state.schedule, state.totals);
    }
  });
}

function setupResize(){
  let t;
  listen(window,'resize', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{
      if (state.viewMode==='chart' && state.schedule){
        renderChart(state.schedule, shouldShowLabels());
      }
    }, 250);
  });
}

/**
 * Set up skip link handlers for accessibility
 */
function setupSkipLinks() {
  const skipToTable = document.querySelector('a[href="#data-table"]');
  
  if (skipToTable) {
    listen(skipToTable, 'click', (e) => {
      // Prevent default to handle it ourselves
      e.preventDefault();
      
      // Switch to table view if not already there
      if (state.viewMode !== 'table') {
        const tableBtn = $('#table-view-btn');
        if (tableBtn) tableBtn.click();
      } else {
        // If already in table view, just focus the table
        focusElement($('#data-table-element'), 100);
      }
      
      // Scroll the section into view
      const section = $('#data-table');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

/**
 * Run self-tests to verify calculations
 */
function runSelfTests() {
  // console.log('Running self-tests...');
  
  const tests = [
    {
      name: 'Zero interest mortgage',
      inputs: { loanAmount: 120000, annualRate: 0, years: 10 },
      expected: { payment: 12000 }
    },
    {
      name: 'Standard 30-year mortgage',
      inputs: { loanAmount: 300000, annualRate: 6.5, years: 30 },
      expected: { paymentMin: 22000, paymentMax: 24000 }
    },
    {
      name: 'Short-term high rate',
      inputs: { loanAmount: 100000, annualRate: 10, years: 5 },
      expected: { paymentMin: 25000, paymentMax: 27000 }
    }
  ];
  
  tests.forEach(test => {
    try {
      const result = computeMortgage(test.inputs);
      
      if (test.expected.payment !== undefined) {
        const diff = Math.abs(result.payment - test.expected.payment);
        if (diff < 1) { // Within $1
          // console.log(`✓ ${test.name} passed`);
        } else {
          console.warn(`✗ ${test.name} failed: expected ${test.expected.payment}, got ${result.payment.toFixed(2)}`);
        }
      } else if (test.expected.paymentMin !== undefined) {
        if (result.payment >= test.expected.paymentMin && result.payment <= test.expected.paymentMax) {
          // console.log(`✓ ${test.name} passed`);
        } else {
          console.warn(`✗ ${test.name} failed: payment ${result.payment.toFixed(2)} not in range [${test.expected.paymentMin}, ${test.expected.paymentMax}]`);
        }
      }
    } catch (error) {
      console.error(`✗ ${test.name} threw error:`, error);
    }
  });
  
  // console.log('Self-tests complete');
}

/**
 * Cleanup function (called on page unload)
 */
function cleanup() {
  destroyChart();
  // console.log('Calculator cleanup complete');
}

// Register cleanup
window.addEventListener('beforeunload', cleanup);

// Register cleanup
window.addEventListener('beforeunload', cleanup);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential external use
export { state, setState, recalc as updateCalculations };