// Observable state (reusable)
export const state = {
  loanAmount: 300000,
  annualRate: 6.5, // %
  years: 30,

  // UI
  viewMode: 'chart',

  // Derived
  schedule: null,       // rows per year
  payment: null,        // annual
  totals: null,         // totals object

  // Validation
  errors: {},

  listeners: []
};

export function setState(updates){
  Object.assign(state, updates);
  state.listeners.forEach(cb => { try{ cb(state); } catch(e){ console.error(e); } });
}
export function subscribe(cb){
  state.listeners.push(cb);
  return () => { const i = state.listeners.indexOf(cb); if(i>-1) state.listeners.splice(i,1); };
}
export function getState(){ return {...state}; }
