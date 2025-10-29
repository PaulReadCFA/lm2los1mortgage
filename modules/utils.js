export function $(sel){ return document.querySelector(sel); }
export function $$(sel){ return Array.from(document.querySelectorAll(sel)); }

export function listen(el, ev, fn){ if(!el) return ()=>{}; el.addEventListener(ev, fn); return ()=>el.removeEventListener(ev, fn); }

export function debounce(fn, wait=300){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}

export function formatCurrency(n, parens=false){
  if (isNaN(n)) return '$0.00';
  const f = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
  const s = f.format(Math.abs(n));
  if (n < 0) return parens ? `(${s})` : `-${s}`;
  return s;
}

export function createElement(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') element.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(element.style, value);
    else if (key.startsWith('aria') || key.startsWith('data')) element.setAttribute(key, value);
    else element[key] = value;
  });

  children.forEach(child => {
    if (child == null) return;
    if (typeof child === 'string' || typeof child === 'number')
      element.appendChild(document.createTextNode(String(child)));
    else if (child instanceof Element)
      element.appendChild(child);
  });

  return element;
}



export function focusElement(el, delay=0){
  const target = typeof el === 'string' ? $(el) : el;
  if (!target) return;
  if (delay>0) setTimeout(()=>target.focus(), delay); else target.focus();
}

export function announceToScreenReader(msg, region=null){
  const r = region || $('#view-announcement'); if(!r) return;
  r.textContent = msg; setTimeout(()=>{ r.textContent=''; }, 100);
}
