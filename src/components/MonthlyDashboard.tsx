import React from 'react';
import { 
  Building2, 
  Coins, 
  Clock, 
  Train, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  Flag,
  FileCheck,
  Briefcase
} from 'lucide-react';
import { Shift, StudentTask, PartTimeJob, JapaneseHoliday } from '../types';
import { getJapaneseHoliday } from '../utils/japaneseHolidays';
import { useLanguage } from '../utils/LanguageContext';

interface MonthlyDashboardProps {
  currentDate: Date;
  shifts: Shift[];
  tasks: StudentTask[];
  jobs: PartTimeJob[];
  onOpenAddShift: () => void;
  onOpenAddTask: () => void;
  onSwitchToCalendar: () => void;
  onOpenInstructions?: () => void;
  weeklyLimit?: number;
  onWeeklyLimitChange?: (limit: number) => void;
}

export const MonthlyDashboard: React.FC<MonthlyDashboardProps> = ({
  currentDate,
  shifts,
  tasks,
  jobs,
  onOpenAddShift,
  onOpenAddTask,
  onSwitchToCalendar,
  onOpenInstructions,
  weeklyLimit = 28,
  onWeeklyLimitChange,
}) => {
  const { t } = useLanguage();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const monthNameJa = `${year}年 ${month + 1}月`;

  // Filter shifts and tasks for the current month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthShifts = shifts.filter((s) => s.date.startsWith(monthPrefix));
  const monthTasks = tasks.filter((t) => t.date.startsWith(monthPrefix));

  // Totals for the month
  const totalHoursWorked = monthShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
  const totalGrossWage = monthShifts.reduce((sum, s) => sum + s.grossPay, 0);
  const totalNightBonus = monthShifts.reduce((sum, s) => sum + (s.nightBonusPay || 0), 0);
  const totalNightHours = monthShifts.reduce((sum, s) => sum + (s.nightHoursWorked || 0), 0);
  const totalTransitAllowance = monthShifts.reduce((sum, s) => sum + s.transportAllowance, 0);
  const totalMonthIncome = totalGrossWage + totalTransitAllowance;

  // Red Days / Japanese Holidays in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidaysInMonth: { day: number; dateStr: string; holiday: JapaneseHoliday }[] = [];
  let redDaysTotal = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const holiday = getJapaneseHoliday(dateStr);
    if (holiday) {
      holidaysInMonth.push({ day: d, dateStr, holiday });
      redDaysTotal++;
    } else if (dDate.getDay() === 0) {
      redDaysTotal++;
    }
  }

  // Calculate weekly breakdown for 28-hour immigration law compliance
  // Immigration weeks run Monday through Sunday
  interface WeekStat {
    weekIndex: number;
    startDateStr: string;
    endDateStr: string;
    label: string;
    totalHours: number;
    shiftsCount: number;
    grossPay: number;
    isOverLimit: boolean;
    isNearLimit: boolean;
  }

  const weeks: WeekStat[] = [];
  // Build weeks across the month
  let currentDay = 1;
  let weekIdx = 1;

  while (currentDay <= daysInMonth) {
    const weekStartDate = new Date(year, month, currentDay);
    // Find next Sunday or end of month
    const dayOfWeek = weekStartDate.getDay(); // 0 = Sun, 1 = Mon ...
    // Days until Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const endDay = Math.min(daysInMonth, currentDay + daysUntilSunday);
    const weekEndDate = new Date(year, month, endDay);

    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    // Get shifts in this range
    const weekShifts = monthShifts.filter((s) => s.date >= startStr && s.date <= endStr);
    const weekHours = weekShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
    const weekPay = weekShifts.reduce((sum, s) => sum + s.grossPay + s.transportAllowance, 0);

    weeks.push({
      weekIndex: weekIdx,
      startDateStr: startStr,
      endDateStr: endStr,
      label: `Week ${weekIdx} (${month + 1}/${currentDay} - ${month + 1}/${endDay})`,
      totalHours: weekHours,
      shiftsCount: weekShifts.length,
      grossPay: weekPay,
      isOverLimit: weekHours > weeklyLimit,
      isNearLimit: weekHours >= (weeklyLimit - 4.0) && weekHours <= weeklyLimit,
    });

    currentDay = endDay + 1;
    weekIdx++;
  }

  const anyWeekViolated = weeks.some((w) => w.isOverLimit);
  const completedTasks = monthTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
      {/* Weekly Compliance Notice (Shown when a week exceeds the active limit target) */}
      {anyWeekViolated && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-600 text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-950">
                ⚠️ Weekly Notice: {weeklyLimit}-Hour Work Guideline Exceeded
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/90 mt-0.5">
                One or more weeks in this month exceeds your {weeklyLimit}.0 hours/week guideline. All hours and pay are recorded accurately without blocking your shifts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddShift}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Shift
            </button>
            <button
              onClick={onSwitchToCalendar}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Open Calendar
            </button>
          </div>
        </div>
      )}

      {/* Monthly Summary Cards (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Earnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('totalMonthlyPay')}
            </span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            ¥{totalMonthIncome.toLocaleString()}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Base: ¥{(totalGrossWage - totalNightBonus).toLocaleString()}</span>
            {totalNightBonus > 0 && (
              <span className="text-indigo-600 font-bold">
                +¥{totalNightBonus.toLocaleString()} 深夜25%
              </span>
            )}
            <span className="text-emerald-600 font-semibold">
              +¥{totalTransitAllowance.toLocaleString()} transit
            </span>
          </div>
        </div>

        {/* Total Hours Worked */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('totalMonthlyHours')}
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalHoursWorked.toFixed(1)}
            <span className="text-sm font-normal text-slate-500 ml-1">hrs</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{t('acrossShifts', { count: monthShifts.length })}</span>
            <span>{t('avgPerShift', { hours: (totalHoursWorked / (monthShifts.length || 1)).toFixed(1) })}</span>
          </div>
        </div>

        {/* Red Days in Japan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('redDays')}
            </span>
            <span className="text-base">🎌</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {redDaysTotal}
            <span className="text-sm font-normal text-slate-500 ml-1">days</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {holidaysInMonth.length > 0 ? (
              <span className="text-rose-700 font-medium">
                {holidaysInMonth.length} {t('officialHolidays')}
              </span>
            ) : (
              <span>{t('sundaysOnly')}</span>
            )}
          </div>
        </div>

        {/* Tasks & Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('studentTasks')}
            </span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {completedTasks} / {monthTasks.length}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{t('pendingTasksCount', { count: monthTasks.length - completedTasks })}</span>
            <button
              onClick={onOpenAddTask}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              {t('addTask')}
            </button>
          </div>
        </div>
      </section>

      {/* Over 28 Hours Urgent Warning Banner if any week exceeded */}
      {weeks.some((w) => w.isOverLimit) && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm animate-in fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 border border-rose-300">
                  {t('legalAlertArticle19')}
                </span>
                <span className="text-xs font-bold text-rose-700">{t('immigrationWarningNotice')}</span>
              </div>
              <h4 className="text-base font-extrabold text-rose-950 mt-1">
                {t('recordedOver28hNotice')}
              </h4>
              <p className="text-xs text-rose-800 mt-1 max-w-2xl leading-relaxed">
                {t('immigrationRuleExplanation')}
              </p>
            </div>
          </div>

          {onOpenInstructions && (
            <button
              onClick={onOpenInstructions}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{t('read28hRuleGuide')}</span>
            </button>
          )}
        </div>
      )}

      {/* Weekly Work Hours Limit Target & Breakdown Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Weekly Limit Selector */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-slate-900">
                <span>{t('weeklyComplianceBreakdown')}</span>
              </h3>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Target: {weeklyLimit}h/wk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {t('immigrationMonitorsSubtext')} Select 28h for regular semester or 40h for authorized holiday / long vacation permits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 28h vs 40h Switcher */}
            {onWeeklyLimitChange && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onWeeklyLimitChange(28)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    weeklyLimit === 28
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Standard University Semester (28h/week)"
                >
                  28h (School Term)
                </button>
                <button
                  type="button"
                  onClick={() => onWeeklyLimitChange(40)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    weeklyLimit === 40
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Official Vacation Permit (40h/week during spring/summer/winter holidays)"
                >
                  40h (Holiday Permit)
                </button>
              </div>
            )}

            <div className="text-xs font-semibold text-slate-600 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Near Cap
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span> Over Guideline
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">{t('thWeekPeriod')}</th>
                <th className="py-3.5 px-5">{t('thTotalHours')}</th>
                <th className="py-3.5 px-5">Target Progress ({weeklyLimit}h)</th>
                <th className="py-3.5 px-5">{t('thShiftsLogged')}</th>
                <th className="py-3.5 px-5">{t('thWeekPay')}</th>
                <th className="py-3.5 px-5 text-right">{t('thLegalStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeks.map((w) => {
                const percent = Math.min(100, Math.round((w.totalHours / weeklyLimit) * 100));
                return (
                  <tr key={w.weekIndex} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {w.label}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-extrabold text-base font-mono text-slate-900">
                        {w.totalHours.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400"> / {weeklyLimit}.0 hrs</span>
                    </td>

                    <td className="py-4 px-5 w-48">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            w.isOverLimit
                              ? 'bg-rose-600'
                              : w.isNearLimit
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                        {t('percentOfWeeklyMax', { percent })}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-700">
                      <span className="font-semibold">{w.shiftsCount}</span> {t('shifts')}
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-900 font-mono">
                      ¥{w.grossPay.toLocaleString()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {w.isOverLimit ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300" title={`Exceeds ${weeklyLimit}h guideline by ${(w.totalHours - weeklyLimit).toFixed(1)}h`}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Over {weeklyLimit}h (+{(w.totalHours - weeklyLimit).toFixed(1)}h)
                        </span>
                      ) : w.isNearLimit ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                          Near {weeklyLimit}h Limit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Safe (≤ {weeklyLimit}h)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two Column Section: Japanese Red Days & Recent Shifts in Month */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Japanese Official Holidays in this month */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎌</span>
                <h3 className="font-bold text-base text-slate-900">
                  {t('japaneseNationalHolidays')}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full">
                {t('officialHolidaysBadge', { count: holidaysInMonth.length })}
              </span>
            </div>

            {holidaysInMonth.length > 0 ? (
              <div className="space-y-3">
                {holidaysInMonth.map(({ day, dateStr, holiday }) => {
                  const holidayShifts = monthShifts.filter((s) => s.date === dateStr);
                  return (
                    <div
                      key={dateStr}
                      className="p-3.5 rounded-xl border border-rose-200/90 bg-rose-50/50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                            {month + 1}月 {day}日
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {holiday.nameJa}
                          </span>
                        </div>
                        <p className="text-xs text-rose-800 mt-1 font-medium">
                          {holiday.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t('officialSchoolRestDay')}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {holidayShifts.length > 0 ? (
                          <span className="text-[11px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200">
                            {t('shiftScheduled', { count: holidayShifts.length })}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {t('dayOff')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium">{t('noOfficialHolidaysInMonth')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('sundaysObservedAsRestDays')}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>{t('cabinetOfficeNotice')}</span>
            <button
              onClick={onSwitchToCalendar}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              {t('viewOnCalendar')}
            </button>
          </div>
        </div>

        {/* Shifts Logged in this Month */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {t('recordedShiftsInMonth')} {monthName} ({monthShifts.length})
                </h3>
              </div>
              <button
                onClick={onOpenAddShift}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> {t('logNewShift')}
              </button>
            </div>

            {monthShifts.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {monthShifts.slice(0, 5).map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: shift.color || '#2563eb' }}
                      />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{shift.jobName}</span>
                          {(shift.nightBonusPay || 0) > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                              🌙 +¥{shift.nightBonusPay}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {shift.date} • {shift.startTime} - {shift.endTime} ({shift.hoursWorked}h)
                          {shift.breakMinutes > 0 && ` • ${shift.breakMinutes}m break`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 font-mono">
                        ¥{(shift.grossPay + (shift.transportAllowance || 0)).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {shift.transportAllowance > 0 
                          ? `+¥${shift.transportAllowance} transit` 
                          : t('noAllowanceBadge')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">{t('noShiftsThisMonth')}</p>
                <button
                  onClick={onOpenAddShift}
                  className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                >
                  {t('logFirstShift')}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t('totalMonthlyPay')}: <strong>¥{totalMonthIncome.toLocaleString()}</strong></span>
            <span>{t('totalMonthlyHours')}: <strong>{totalHoursWorked.toFixed(1)}h</strong></span>
          </div>
        </div>
      </section>
    </div>
  );
};
