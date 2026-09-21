/**
 * Japanese Labor Standards Act (労働基準法第37条):
 * Work performed between 22:00 (10 PM) and 05:00 (5 AM) requires
 * an additional 25% late-night wage premium (深夜割増手当 25%).
 */

export interface ShiftMetrics {
  hoursWorked: number;
  nightHoursWorked: number;
  daytimeHoursWorked: number;
  basePay: number;
  nightBonusPay: number;
  effectiveHourlyWage: number;
  grossPay: number;
}

/**
 * Calculates work hours, late-night hours (22:00 - 05:00), and +25% premium pay.
 */
export function calculateShiftMetrics(
  startTime: string,
  endTime: string,
  breakMinutes: number,
  hourlyWage: number,
  applyNightBonus: boolean = true
): ShiftMetrics {
  if (!startTime || !endTime) {
    return {
      hoursWorked: 0,
      nightHoursWorked: 0,
      daytimeHoursWorked: 0,
      basePay: 0,
      nightBonusPay: 0,
      effectiveHourlyWage: hourlyWage,
      grossPay: 0,
    };
  }

  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);

  let startMins = sH * 60 + sM;
  let endMins = eH * 60 + eM;

  // Crosses midnight (e.g. 21:00 to 02:00, or 23:00 to 07:00)
  if (endMins < startMins) {
    endMins += 24 * 60;
  }

  const grossMins = Math.max(0, endMins - startMins);
  const cleanBreakMins = Math.min(grossMins, Math.max(0, Number(breakMinutes) || 0));
  const netMins = Math.max(0, grossMins - cleanBreakMins);
  const hoursWorked = Math.round((netMins / 60) * 100) / 100;

  if (grossMins <= 0 || hoursWorked <= 0) {
    return {
      hoursWorked: 0,
      nightHoursWorked: 0,
      daytimeHoursWorked: 0,
      basePay: 0,
      nightBonusPay: 0,
      effectiveHourlyWage: hourlyWage,
      grossPay: 0,
    };
  }

  // Calculate overlap with late-night windows (22:00 to 05:00)
  // Intervals in minutes from day 1 00:00:
  // [0, 300] -> Day 1 00:00 to 05:00
  // [1320, 1740] -> Day 1 22:00 to Day 2 05:00
  // [2760, 3180] -> Day 2 22:00 to Day 3 05:00 (for long multi-day shifts)
  const nightIntervals = [
    [0, 300],
    [1320, 1740],
    [2760, 3180],
  ];

  let totalGrossNightMins = 0;
  for (const [nStart, nEnd] of nightIntervals) {
    const overlapStart = Math.max(startMins, nStart);
    const overlapEnd = Math.min(endMins, nEnd);
    if (overlapEnd > overlapStart) {
      totalGrossNightMins += overlapEnd - overlapStart;
    }
  }

  // Apportion break minutes proportionally between daytime and nighttime
  const nightRatio = grossMins > 0 ? totalGrossNightMins / grossMins : 0;
  const netNightMins = Math.max(0, totalGrossNightMins - (cleanBreakMins * nightRatio));
  const nightHoursWorked = Math.round((netNightMins / 60) * 100) / 100;
  const daytimeHoursWorked = Math.round(Math.max(0, hoursWorked - nightHoursWorked) * 100) / 100;

  // Base pay for all worked hours
  const basePay = Math.round(hoursWorked * hourlyWage);

  // Late night bonus (25% of hourly wage for every night hour worked)
  const nightBonusPay = applyNightBonus
    ? Math.round(nightHoursWorked * hourlyWage * 0.25)
    : 0;

  const grossPay = basePay + nightBonusPay;
  const effectiveHourlyWage = hoursWorked > 0 ? Math.round(grossPay / hoursWorked) : hourlyWage;

  return {
    hoursWorked,
    nightHoursWorked,
    daytimeHoursWorked,
    basePay,
    nightBonusPay,
    effectiveHourlyWage,
    grossPay,
  };
}
