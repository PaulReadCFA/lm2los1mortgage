/**
 * Annual-payment mortgage schedule.
 * PMT = P * [ r (1+r)^n / ((1+r)^n - 1) ]
 * Returns:
 *  - payment (annual)
 *  - schedule: [{ year, payment, interest, principal, endingBalance }]
 *  - totals: { interest, principal, payment }
 */
export function computeMortgage({ loanAmount, annualRate, years }) {
  const P = Number(loanAmount);
  const r = Number(annualRate) / 100; // annual rate
  const n = Math.round(Number(years));

  if (r === 0) {
    const payment = P / n;
    const schedule = [];
    let bal = P;
    for (let y = 1; y <= n; y++) {
      const principal = y === n ? bal : payment;
      const interest = 0;
      bal = Math.max(0, bal - principal);
      schedule.push({ year: y, payment, interest, principal, endingBalance: bal });
    }
    const totals = {
      payment: payment * n,
      interest: 0,
      principal: P
    };
    return { payment, schedule, totals };
  }

  const payment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const schedule = [];
  let bal = P;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let y = 1; y <= n; y++) {
    const interest = bal * r;
    let principal = payment - interest;

    // clamp final year to clear balance
    if (y === n) principal = bal;

    bal = Math.max(0, bal - principal);
    totalInterest += interest;
    totalPrincipal += principal;

    schedule.push({
      year: y,
      payment,
      interest,
      principal,
      endingBalance: bal
    });
  }

  return {
    payment,
    schedule,
    totals: {
      payment: payment * n,
      interest: totalInterest,
      principal: totalPrincipal
    }
  };
}
