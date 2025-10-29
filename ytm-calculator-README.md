# Bond Yield to Maturity (YTM) Calculator

A fully accessible, vanilla JavaScript calculator for computing bond yield to maturity. Built for CFA Institute to WCAG 2.1 AA standards.

## Features

- **YTM Calculation**: Solves for yield to maturity using numerical iteration
- **Real-time Updates**: Calculations update automatically as inputs change
- **Dual Visualization**: Toggle between interactive chart and accessible data table
- **Input Validation**: Helpful error messages with field-level and summary validation
- **Full Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility with skip links
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## What This Calculator Does

This calculator computes the **yield to maturity (YTM)** for a coupon bond given:
- Current market price
- Annual coupon rate
- Years to maturity
- Face value (fixed at $100)

YTM represents the annualized internal rate of return if the bond is held to maturity, assuming all coupon payments are reinvested at the YTM rate.

## Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (Python's built-in server, Node's http-server, or similar)

### Running Locally

1. **Navigate to the calculator directory:**
```bash
cd ytm-calculator
```

2. **Start a local web server:**

**Option A: Python 3**
```bash
python3 -m http.server 8000
```

**Option B: Python 2**
```bash
python -m SimpleHTTPServer 8000
```

**Option C: Node.js (http-server)**
```bash
npx http-server -p 8000
```

3. **Open in browser:**
```
http://localhost:8000
```

## File Structure

```
ytm-calculator/
├── index.html              # Main HTML structure
├── styles.css              # All styling
├── calculator.js           # Main orchestration
└── modules/
    ├── state.js           # State management
    ├── calculations.js    # YTM calculation logic
    ├── validation.js      # Input validation
    ├── utils.js           # Utility functions
    ├── chart.js           # Chart.js visualization
    ├── table.js           # Accessible data table
    └── results.js         # Results display
```

## How It Works

### Calculation Method

The calculator uses **binary search** (numerical iteration) to solve for the yield that equates the present value of all cash flows to the current bond price:

1. Generate cash flow schedule (semiannual coupon payments + final principal)
2. Define a present value function that discounts all cash flows at a given yield
3. Use binary search to find the yield where PV = bond price
4. Annualize the periodic yield to get YTM (Bond Equivalent Yield)

### Input Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| **Bond Price** | $50 - $150 | Current market price of the bond |
| **Coupon Rate** | 0% - 20% | Annual coupon rate as a percentage |
| **Years to Maturity** | 0.5 - 10 | Number of years until bond matures |

**Fixed Parameters:**
- Face Value: $100
- Payment Frequency: Semiannual (2 payments per year)

### Output

- **Yield to Maturity (YTM)**: Annualized return if held to maturity
- **Bond Details**: Coupon payments, periods, calculation method
- **Price vs Par**: Whether bond trades at premium, discount, or par
- **Cash Flow Visualization**: Chart showing all payments over time with YTM line
- **Data Table**: Complete cash flow schedule in accessible format

## Accessibility Features

### WCAG 2.1 AA Compliance

✅ **Keyboard Navigation**
- Tab through all interactive elements
- Skip links to main calculator and data table
- Focus management when switching between chart/table views

✅ **Screen Reader Support**
- Semantic HTML (`<main>`, `<section>`, `<table>`, etc.)
- ARIA labels and descriptions
- Live regions for dynamic content announcements
- Complete table with caption and proper headers

✅ **Visual Design**
- Color contrast ratios ≥ 4.5:1
- Focus indicators on all interactive elements
- Information conveyed beyond color alone (borders, text)
- Responsive at 200% zoom

✅ **Input Validation**
- Real-time validation with helpful error messages
- Field-level errors with `aria-invalid`
- Validation summary with `role="alert"`
- Required fields clearly marked

### Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Skip to calculator | Tab (from top) → Enter |
| Skip to data table | Tab twice → Enter |
| Navigate inputs | Tab / Shift+Tab |
| Toggle chart/table | Tab to buttons → Enter |
| Info tooltips | Tab to ? button → (auto-shows) |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Details

### Dependencies

- **Chart.js 4.4.0** - For visualization (loaded from CDN)
- No other external dependencies

### State Management

Uses a simple observable pattern:
```javascript
import { state, setState, subscribe } from './modules/state.js';

// Update state
setState({ price: 100 });

// Subscribe to changes
subscribe((newState) => {
  console.log('State updated:', newState);
});
```

### Calculation Performance

- **Convergence**: Typically < 200 iterations (< 1ms)
- **Accuracy**: Within 0.01% of true YTM
- **Update frequency**: Debounced to 300ms after last input change

## Customization

### Changing Validation Rules

Edit `modules/validation.js`:
```javascript
const validationRules = {
  price: {
    min: 50,    // Change min
    max: 150,   // Change max
    label: 'Bond Price',
    errorMessage: 'Price must be between $50 and $150'
  },
  // ...
};
```

### Changing Colors

Edit CSS variables in `styles.css`:
```css
:root {
  --color-blue: #3b82f6;
  --color-orange-bar: #fb923c;
  --color-green: #16a34a;
  /* ... */
}
```

### Modifying Chart

Edit `modules/chart.js` to customize:
- Chart type
- Axis labels
- Tooltip formatting
- Visual styling

## Testing

### Automated Testing

Run accessibility scanner:
```bash
# Using axe DevTools browser extension
# Or WAVE Web Accessibility Evaluation Tool
```

### Manual Testing Checklist

- [ ] Keyboard navigation works throughout
- [ ] Skip links appear on focus and work correctly
- [ ] Screen reader announces all dynamic content
- [ ] Chart and table both display correctly
- [ ] Focus moves to revealed content on toggle
- [ ] Input validation shows appropriate errors
- [ ] All interactive elements have visible focus indicators
- [ ] Works at 200% zoom without horizontal scroll
- [ ] Info tooltips appear on hover/focus

### Self-Tests

The calculator runs self-tests on initialization:
```
Running self-tests...
✓ Test case from original component passed: YTM = 11.54%
Self-tests complete
```

Check browser console for results.

## Known Limitations

1. **Fixed Face Value**: Currently assumes $100 face value
2. **Semiannual Only**: Only supports semiannual coupon payments
3. **No Callable Bonds**: Does not handle bonds with call provisions
4. **Simplified Model**: Assumes flat yield curve and no default risk

## Future Enhancements

- [ ] Support for annual, quarterly payment frequencies
- [ ] Customizable face value
- [ ] Multiple bond comparison
- [ ] Export data as CSV
- [ ] Save/load bond portfolios
- [ ] Callable bond calculations

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify using a local web server (not `file://`)
3. Ensure JavaScript is enabled
4. Try in different browser

## License

Copyright © 2025 CFA Institute. All rights reserved.

## Version

**1.0.0** - Initial vanilla JavaScript implementation (March 2025)

---

**Built with accessibility in mind for all users.** ♿
