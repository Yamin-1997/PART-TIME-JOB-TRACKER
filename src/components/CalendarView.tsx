import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Flag, 
  Building2, 
  ChevronRight, 
  Sparkles, 
  Info, 
  CalendarDays,
  X,
  Edit2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Shift, StudentTask, PartTimeJob, JapaneseHoliday } from '../types';
import { 
  isJapaneseRedDay, 
  getJapaneseHoliday, 
  generateGoogleCalendarUrl, 
  GOOGLE_CALENDAR_JAPAN_HOLIDAY_CALENDAR_ID,
  GOOGLE_CALENDAR_JAPAN_HOLIDAY_ICAL_URL 
} from '../utils/japaneseHolidays';
import { useLanguage } from '../utils/LanguageContext';

export interface CalendarViewProps {
  currentDate: Date;
  shifts: Shift[];
  tasks: StudentTask[];
  jobs: PartTimeJob[];
  onOpenAddShift?: (dateStr?: string) => void;
  onOpenAddTask?: (dateStr?: string) => void;
  onOpenAddShiftForDate?: (dateStr?: string) => void;
  onOpenAddTaskForDate?: (dateStr?: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSelectShift?: (shift: Shift) => void;
  onEditShift?: (shift: Shift) => void;
  onSelectTask?: (task: StudentTask) => void;
  onEditTask?: (task: StudentTask) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  shifts,
  tasks,
  jobs,
  onOpenAddShift,
  onOpenAddTask,
  onOpenAddShiftForDate,
  onOpenAddTaskForDate,
  onToggleTaskComplete,
  onSelectShift,
  onEditShift,
  onSelectTask,
  onEditTask,
}) => {
  const { language, t } = useLanguage();
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState<boolean>(false);
  const [showGoogleApiModal, setShowGoogleApiModal] = useState<boolean>(false);

  const weekdays = [
    { ja: '日', en: 'Sun', vi: 'CN', ne: 'आइत', color: 'text-rose-600' },
    { ja: '月', en: 'Mon', vi: 'T2', ne: 'सोम', color: 'text-slate-700' },
    { ja: '火', en: 'Tue', vi: 'T3', ne: 'मङ्गल', color: 'text-slate-700' },
    { ja: '水', en: 'Wed', vi: 'T4', ne: 'बुध', color: 'text-slate-700' },
    { ja: '木', en: 'Thu', vi: 'T5', ne: 'बिही', color: 'text-slate-700' },
    { ja: '金', en: 'Fri', vi: 'T6', ne: 'शुक्र', color: 'text-slate-700' },
    { ja: '土', en: 'Sat', vi: 'T7', ne: 'शनि', color: 'text-blue-600' },
  ];

  // Normalized event handlers
  const handleOpenAddShift = (dateStr?: string) => {
    if (onOpenAddShiftForDate) onOpenAddShiftForDate(dateStr);
    else if (onOpenAddShift) onOpenAddShift(dateStr);
  };

  const handleOpenAddTask = (dateStr?: string) => {
    if (onOpenAddTaskForDate) onOpenAddTaskForDate(dateStr);
    else if (onOpenAddTask) onOpenAddTask(dateStr);
  };

  const handleSelectShift = (shift: Shift) => {
    if (onEditShift) onEditShift(shift);
    else if (onSelectShift) onSelectShift(shift);
  };

  const handleSelectTask = (task: StudentTask) => {
    if (onEditTask) onEditTask(task);
    else if (onSelectTask) onSelectTask(task);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create grid cells
  const calendarCells = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = prevDate.toISOString().split('T')[0];
    calendarCells.push({
      date: prevDate,
      dayNum,
      isCurrentMonth: false,
      dateStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      date: dayDate,
      dayNum: d,
      isCurrentMonth: true,
      dateStr,
    });
  }

  // Next month padding to complete 35 or 42 grid cells
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = nextDate.toISOString().split('T')[0];
    calendarCells.push({
      date: nextDate,
      dayNum: d,
      isCurrentMonth: false,
      dateStr,
    });
  }

  // Today comparison
  const todayStr = new Date().toISOString().split('T')[0];

  // Count red days in current month
  let redDaysCount = 0;
  const nationalHolidaysInMonth: { dateStr: string; holiday: JapaneseHoliday }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const checkDate = new Date(year, month, d);
    const checkStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const holiday = getJapaneseHoliday(checkStr);
    if (holiday) {
      nationalHolidaysInMonth.push({ dateStr: checkStr, holiday });
      redDaysCount++;
    } else if (checkDate.getDay() === 0) {
      redDaysCount++;
    }
  }

  // Selected Day data
  const activeDateStr = selectedDayDate || todayStr;
  const dayShifts = shifts.filter((s) => s.date === activeDateStr);
  const dayTasks = tasks.filter((t) => t.date === activeDateStr);
  const dayHoliday = getJapaneseHoliday(activeDateStr);
  const isSelectedSunday = new Date(activeDateStr + 'T00:00:00').getDay() === 0;

  // Day total metrics
  const dayTotalHours = dayShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
  const dayBasePay = dayShifts.reduce((sum, s) => sum + (s.grossPay - (s.nightBonusPay || 0)), 0);
  const dayNightBonus = dayShifts.reduce((sum, s) => sum + (s.nightBonusPay || 0), 0);
  const dayTransit = dayShifts.reduce((sum, s) => sum + (s.transportAllowance || 0), 0);
  const dayTotalEarnings = dayShifts.reduce((sum, s) => sum + s.grossPay + (s.transportAllowance || 0), 0);
  const dayCompletedTasksCount = dayTasks.filter((t) => t.completed).length;

  // Format date helper
  const formatDateDetails = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeekJaFull = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][d.getDay()];
    const dayOfWeekJa = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    const dayOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      jaDate: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${dayOfWeekJaFull})`,
      shortJaDate: `${d.getMonth() + 1}月${d.getDate()}日 (${dayOfWeekJa})`,
      enDate: `${dayOfWeekEn}, ${monthNamesEn[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      isSunday: d.getDay() === 0,
      isSaturday: d.getDay() === 6,
    };
  };

  const activeDateInfo = formatDateDetails(activeDateStr);

  // Handle cell click on phone vs desktop
  const handleCellClick = (dateStr: string) => {
    setSelectedDayDate(dateStr);
    // On phone/mobile, immediately open the Selected Day Details popup/sheet
    setIsMobileDetailsOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Calendar Header & National Red Day Info Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-xs space-y-3 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t('japanCalendar')}
                </h2>
                <button
                  onClick={() => setShowGoogleApiModal(true)}
                  className="text-[11px] sm:text-xs px-2.5 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-full flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Official Japanese National Holidays"
                >
                  <span>🇯🇵</span>
                  <span>{redDaysCount} {t('redDays')}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setShowGoogleApiModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              title="View Google Calendar Integration Details"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('googleCalendar')}</span>
            </button>
            <button
              onClick={() => handleOpenAddShift(selectedDayDate || undefined)}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('logShift')}</span>
            </button>
            <button
              onClick={() => handleOpenAddTask(selectedDayDate || undefined)}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newTask')}</span>
            </button>
          </div>
        </div>

        {/* National Holidays in this month banner */}
        {nationalHolidaysInMonth.length > 0 && (
          <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="font-bold text-rose-900 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {t('nationalHolidaysThisMonth')}:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {nationalHolidaysInMonth.map(({ dateStr, holiday }) => (
                <button 
                  key={dateStr}
                  onClick={() => handleCellClick(dateStr)}
                  className="shrink-0 px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg font-medium hover:bg-rose-100 transition shadow-2xs text-[11px] active:scale-95 cursor-pointer"
                >
                  {dateStr.split('-')[2]}日 ({holiday.nameJa})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Calendar Grid & Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid (3 columns on lg, full width on mobile) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Day of week headers: Japanese calendar style (Sun in Red, Sat in Blue) */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 sm:py-2.5">
            {weekdays.map((wd, i) => (
              <div key={i} className={`text-[11px] sm:text-xs font-bold ${wd.color}`}>
                <span>{language === 'ja' ? wd.ja : language === 'vi' ? wd.vi : language === 'ne' ? wd.ne : wd.ja}</span>
                <span className="hidden sm:inline ml-1 text-[10px] opacity-75">
                  ({language === 'ja' ? wd.en : language === 'vi' ? wd.vi : language === 'ne' ? wd.ne : wd.en})
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Month Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100/50">
            {calendarCells.map((cell, idx) => {
              const { isRedDay, holiday } = isJapaneseRedDay(cell.date);
              const isSaturday = cell.date.getDay() === 6;
              const isSunday = cell.date.getDay() === 0;
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === activeDateStr;

              // Day's shifts and tasks
              const cellShifts = shifts.filter((s) => s.date === cell.dateStr);
              const cellTasks = tasks.filter((t) => t.date === cell.dateStr);
              const dayTotalHoursInCell = cellShifts.reduce((sum, s) => sum + s.hoursWorked, 0);

              return (
                <div
                  key={cell.dateStr + '-' + idx}
                  onClick={() => handleCellClick(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[115px] md:min-h-[125px] p-1 sm:p-2 transition flex flex-col justify-between cursor-pointer relative ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 opacity-45'
                  } ${
                    isSelected 
                      ? 'ring-2 ring-inset ring-blue-600 bg-blue-50/30' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Cell Top: Day number & Holiday Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                      <span
                        className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full transition ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                            : isSelected
                            ? 'bg-blue-100 text-blue-800 font-extrabold ring-1 ring-blue-400'
                            : isRedDay || holiday || isSunday
                            ? 'text-rose-600 font-extrabold'
                            : isSaturday
                            ? 'text-blue-600 font-bold'
                            : 'text-slate-800'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Red Day badge (Official Japanese National Holiday) */}
                      {holiday && (
                        <span 
                          title={`${holiday.nameJa} (${holiday.nameEn}) - Official Rest Day in Japan`}
                          className="text-[9px] sm:text-[10px] font-bold px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 truncate max-w-[45px] sm:max-w-[100px]"
                        >
                          <span className="sm:hidden">🎌</span>
                          <span className="hidden sm:inline">🎌 {holiday.nameJa}</span>
                        </span>
                      )}
                    </div>

                    {/* MOBILE SHIFTS & TASKS VIEW (< sm) - Clean, compact touch pills */}
                    <div className="sm:hidden space-y-0.5 mt-0.5">
                      {cellShifts.slice(0, 2).map((shift) => (
                        <div
                          key={shift.id}
                          className="text-[9px] font-semibold py-0.5 px-1 rounded text-white truncate flex items-center justify-between shadow-2xs"
                          style={{ backgroundColor: shift.color || '#2563eb' }}
                        >
                          <span className="truncate flex items-center gap-0.5">
                            {(shift.nightBonusPay || 0) > 0 && <span className="text-[8px]">🌙</span>}
                            <span>{shift.hoursWorked}h</span>
                          </span>
                        </div>
                      ))}

                      {cellShifts.length > 2 && (
                        <div className="text-[8px] font-bold text-slate-500 pl-0.5">
                          +{cellShifts.length - 2}
                        </div>
                      )}

                      {/* Mobile Task Dots */}
                      {cellTasks.length > 0 && (
                        <div className="flex items-center gap-0.5 pt-0.5 pl-0.5">
                          {cellTasks.slice(0, 3).map((task) => (
                            <span 
                              key={task.id} 
                              className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-slate-300' : 'bg-amber-500'}`}
                            />
                          ))}
                          {cellTasks.length > 3 && (
                            <span className="text-[8px] text-amber-700 font-bold leading-none">+</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* TABLET / DESKTOP SHIFTS & TASKS VIEW (>= sm) */}
                    <div className="hidden sm:block space-y-1 mt-1">
                      {cellShifts.slice(0, 2).map((shift) => (
                        <div
                          key={shift.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectShift(shift);
                          }}
                          className="text-[10px] sm:text-[11px] p-1 rounded-md text-white font-medium flex items-center justify-between shadow-2xs truncate hover:opacity-90 transition"
                          style={{ backgroundColor: shift.color || '#2563eb' }}
                          title={`${shift.jobName}: ${shift.startTime}-${shift.endTime} (${shift.hoursWorked}h)${(shift.nightBonusPay || 0) > 0 ? ' [深夜+25%]' : ''}`}
                        >
                          <span className="truncate flex items-center gap-0.5">
                            {(shift.nightBonusPay || 0) > 0 && <span className="text-[9px]">🌙</span>}
                            {shift.jobName.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono shrink-0 ml-1">{shift.hoursWorked}h</span>
                        </div>
                      ))}

                      {cellShifts.length > 2 && (
                        <div className="text-[10px] text-slate-500 font-semibold pl-1">
                          +{cellShifts.length - 2} more shifts
                        </div>
                      )}

                      {/* Desktop Tasks */}
                      {cellTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTask(task);
                          }}
                          className={`text-[10px] px-1 py-0.5 rounded flex items-center gap-1 truncate ${
                            task.completed
                              ? 'bg-slate-100 text-slate-400 line-through'
                              : 'bg-amber-50 text-amber-900 border border-amber-200 font-medium'
                          }`}
                          title={task.title}
                        >
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTaskComplete(task.id);
                            }}
                            className="cursor-pointer hover:scale-125 transition"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                          </span>
                          <span className="truncate">{task.title}</span>
                          {task.alarmEnabled !== false && task.time && !task.completed && (
                            <Bell className="w-2.5 h-2.5 text-rose-500 shrink-0 ml-auto" />
                          )}
                        </div>
                      ))}

                      {cellTasks.length > 2 && (
                        <div className="text-[9px] text-amber-700 font-semibold pl-1">
                          +{cellTasks.length - 2} more tasks
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cell Bottom summary indicator */}
                  {dayTotalHoursInCell > 0 && (
                    <div className="pt-0.5 sm:pt-1 text-[9px] sm:text-[10px] font-bold text-slate-400 flex items-center justify-between border-t border-slate-100/80">
                      <span className="hidden sm:inline">{t('total')}</span>
                      <span className="text-slate-700 font-mono ml-auto sm:ml-0">{dayTotalHoursInCell}h</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="font-semibold text-rose-700 text-[11px] sm:text-xs">{t('redDays')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                <span className="text-[11px] sm:text-xs">{t('legendShift')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border border-amber-300"></span>
                <span className="text-[11px] sm:text-xs">{t('legendTask')}</span>
              </div>
            </div>

            <span className="text-slate-500 italic text-[11px] sm:text-xs">
              {t('studentCapLegend')}
            </span>
          </div>
        </div>

        {/* DESKTOP-ONLY Selected Date Inspector (1 column on lg) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              {t('selectedDayDetails')}
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {activeDateInfo.shortJaDate}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeDateInfo.enDate}
                </p>
              </div>
              {activeDateStr === todayStr && (
                <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                  {t('today')}
                </span>
              )}
            </div>

            {/* Red Day status indicator */}
            {dayHoliday ? (
              <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="text-sm">🎌</span>
                  <span>{dayHoliday.nameJa} ({dayHoliday.nameEn})</span>
                </div>
                <p className="mt-0.5 text-[11px] text-rose-700 leading-relaxed">
                  {t('officialSchoolRestDay')}
                </p>
              </div>
            ) : isSelectedSunday ? (
              <div className="mt-2.5 p-2 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800 font-medium">
                🔴 {t('sundayStatutoryRestDay')}
              </div>
            ) : null}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('hours')}</span>
              <span className="text-sm font-extrabold text-slate-800 font-mono">{dayTotalHours}h</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('pay')}</span>
              <span className="text-sm font-extrabold text-blue-600 font-mono">¥{dayTotalEarnings.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('studentTasks')}</span>
              <span className="text-sm font-extrabold text-amber-600 font-mono">{dayTasks.length}</span>
            </div>
          </div>

          {/* Shifts Section for selected day */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('shifts')} ({dayShifts.length})</span>
              </h4>
              <button
                onClick={() => handleOpenAddShift(activeDateStr)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> {t('logShift')}
              </button>
            </div>

            {dayShifts.length > 0 ? (
              <div className="space-y-2.5">
                {dayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    onClick={() => handleSelectShift(shift)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: shift.color || '#2563eb' }}
                        />
                        <span className="font-bold text-sm text-slate-900 leading-tight">
                          {shift.jobName}
                        </span>
                        {(shift.nightBonusPay || 0) > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                            🌙 +¥{shift.nightBonusPay}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ¥{(shift.grossPay + (shift.transportAllowance || 0)).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pl-4.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {shift.startTime} - {shift.endTime} ({shift.hoursWorked}h)
                        {shift.breakMinutes > 0 && ` • ${shift.breakMinutes}m break`}
                      </span>
                      <span>
                        {shift.transportAllowance > 0 
                          ? `+¥${shift.transportAllowance} transit` 
                          : t('noAllowanceBadge')}
                      </span>
                    </div>
                    {shift.notes && (
                      <p className="mt-1 text-[11px] text-slate-600 italic pl-4.5">
                        "{shift.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">{t('clickToEdit')}</span>
                      <a
                        href={generateGoogleCalendarUrl({
                          title: `Shift: ${shift.jobName}`,
                          date: shift.date,
                          startTime: shift.startTime,
                          endTime: shift.endTime,
                          details: `Pay: ¥${(shift.grossPay + (shift.transportAllowance || 0)).toLocaleString()}\nHours: ${shift.hoursWorked}h\nBreak: ${shift.breakMinutes}m\nNotes: ${shift.notes || 'None'}`,
                          location: jobs.find(j => j.id === shift.jobId)?.location || shift.jobName,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        title="Export shift to Google Calendar"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>+ {t('googleCalendar')}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 italic">
                {t('noShiftsToday')}
              </p>
            )}
          </div>

          {/* Tasks Section for selected day */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('studentTasks')} ({dayTasks.length})</span>
              </h4>
              <button
                onClick={() => handleOpenAddTask(activeDateStr)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> {t('newTask')}
              </button>
            </div>

            {dayTasks.length > 0 ? (
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      task.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white border-amber-200/90 text-slate-800 shadow-2xs hover:border-amber-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskComplete(task.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-amber-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded font-medium">
                          {task.category}
                        </span>
                        {task.time && (
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            {task.time}
                            {task.alarmEnabled !== false && !task.completed && (
                              <Bell className="w-2.5 h-2.5 text-rose-500" title="Alarm enabled" />
                            )}
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-rose-600 font-bold">{t('urgentPriority')}</span>
                        )}
                        <a
                          href={generateGoogleCalendarUrl({
                            title: `Task: ${task.title}`,
                            date: task.date,
                            startTime: task.time,
                            details: `Category: ${task.category}\nPriority: ${task.priority}\nNotes: ${task.notes || 'None'}`,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          title="Export task to Google Calendar"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>+ Cal</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 italic">
                {t('noTasksToday')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE QUICK ACTION DOCK (Visible on phone screens below calendar grid) */}
      <div className="lg:hidden bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex items-center justify-between gap-3">
        <div 
          onClick={() => setIsMobileDetailsOpen(true)}
          className="flex-1 cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-900 truncate">
              {activeDateInfo.shortJaDate}
            </span>
            {activeDateStr === todayStr && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">
                {t('today')}
              </span>
            )}
            {dayHoliday && (
              <span className="text-[10px] font-bold text-rose-600 truncate">
                🎌 {dayHoliday.nameJa}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {dayShifts.length > 0 ? `${dayShifts.length} ${t('legendShift')} (${dayTotalHours}h)` : t('noShiftsToday')} • {dayTasks.length > 0 ? `${dayTasks.length} ${t('legendTask')}` : t('noTasksToday')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDetailsOpen(true)}
          className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 active:scale-95 transition cursor-pointer"
        >
          <span>{t('viewDetails')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MOBILE SELECTED DAY DETAILS SLIDE-UP SHEET (Directly on calendar for phone users) */}
      <AnimatePresence>
        {isMobileDetailsOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileDetailsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slide-Up Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-h-[88vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-slate-200"
            >
              {/* Sheet Drag Pill & Header */}
              <div className="pt-3 pb-2 px-5 border-b border-slate-100 flex flex-col">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 shrink-0" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {t('selectedDayDetails')}
                      </span>
                      {activeDateStr === todayStr && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">
                          {t('today')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {activeDateInfo.jaDate}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeDateInfo.enDate}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsMobileDetailsOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition active:scale-90 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Holiday Badge if Red Day */}
                {dayHoliday ? (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="text-sm">🎌</span>
                      <span>{dayHoliday.nameJa} ({dayHoliday.nameEn})</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded font-bold ml-auto">
                        国民の祝日
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-rose-700 leading-relaxed">
                      {t('officialSchoolRestDay')}
                    </p>
                  </div>
                ) : isSelectedSunday ? (
                  <div className="mt-2 p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-1.5">
                    <span>🔴</span>
                    <span>{t('sundayStatutoryRestDay')}</span>
                  </div>
                ) : null}

                {/* Daily Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('hours')}</span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">{dayTotalHours}h</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('pay')}</span>
                    <span className="text-sm font-extrabold text-blue-600 font-mono">¥{dayTotalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('studentTasks')}</span>
                    <span className="text-sm font-extrabold text-amber-600 font-mono">
                      {dayCompletedTasksCount}/{dayTasks.length}
                    </span>
                  </div>
                </div>

                {/* Quick Add Buttons Row */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      handleOpenAddShift(activeDateStr);
                      setIsMobileDetailsOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>+ {t('logShift')}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleOpenAddTask(activeDateStr);
                      setIsMobileDetailsOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ {t('newTask')}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {/* Shifts Section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>{t('shifts')} ({dayShifts.length})</span>
                    </h4>
                  </div>

                  {dayShifts.length > 0 ? (
                    <div className="space-y-2.5">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          onClick={() => {
                            handleSelectShift(shift);
                            setIsMobileDetailsOpen(false);
                          }}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/80 active:bg-blue-50/50 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: shift.color || '#2563eb' }}
                              />
                              <span className="font-bold text-sm text-slate-900">
                                {shift.jobName}
                              </span>
                            </div>
                            <span className="text-sm font-black text-slate-900 font-mono">
                              ¥{(shift.grossPay + (shift.transportAllowance || 0)).toLocaleString()}
                            </span>
                          </div>

                          {/* Shift details row */}
                          <div className="space-y-1 text-xs text-slate-600 pl-5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {shift.startTime} - {shift.endTime} ({shift.hoursWorked}h)
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {shift.breakMinutes > 0 ? `${shift.breakMinutes}m break` : 'No break'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                              <span>
                                {shift.transportAllowance > 0 
                                  ? `+¥${shift.transportAllowance} transit` 
                                  : t('noAllowanceBadge')}
                              </span>
                              {(shift.nightBonusPay || 0) > 0 ? (
                                <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  🌙 +¥{shift.nightBonusPay}
                                </span>
                              ) : (
                                <span className="text-slate-400">Regular hours</span>
                              )}
                            </div>

                            {shift.notes && (
                              <p className="mt-1.5 text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-lg border border-slate-100">
                                "{shift.notes}"
                              </p>
                            )}
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <a
                              href={generateGoogleCalendarUrl({
                                title: `Shift: ${shift.jobName}`,
                                date: shift.date,
                                startTime: shift.startTime,
                                endTime: shift.endTime,
                                details: `Pay: ¥${(shift.grossPay + (shift.transportAllowance || 0)).toLocaleString()}\nHours: ${shift.hoursWorked}h\nBreak: ${shift.breakMinutes}m\nNotes: ${shift.notes || 'None'}`,
                                location: jobs.find(j => j.id === shift.jobId)?.location || shift.jobName,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-2xs cursor-pointer"
                              title="Export shift to Google Calendar"
                            >
                              <ExternalLink className="w-3 h-3 text-blue-600" />
                              <span>+ {t('googleCalendar')}</span>
                            </a>

                            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                              <Edit2 className="w-3 h-3" /> {t('clickToEdit')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xs text-slate-500 italic mb-2">
                        {t('noShiftsToday')}
                      </p>
                      <button
                        onClick={() => {
                          handleOpenAddShift(activeDateStr);
                          setIsMobileDetailsOpen(false);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        + {t('logShift')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Tasks Section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>{t('studentTasks')} ({dayTasks.length})</span>
                    </h4>
                  </div>

                  {dayTasks.length > 0 ? (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-2xl border transition flex items-start gap-3 ${
                            task.completed
                              ? 'bg-slate-50 border-slate-200 text-slate-400'
                              : 'bg-white border-amber-200/90 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onToggleTaskComplete(task.id)}
                            className="mt-0.5 p-1 text-slate-400 hover:text-emerald-600 transition shrink-0 active:scale-125 cursor-pointer"
                            aria-label="Toggle task"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-amber-500" />
                            )}
                          </button>

                          <div 
                            onClick={() => {
                              handleSelectTask(task);
                              setIsMobileDetailsOpen(false);
                            }}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <div className={`text-xs sm:text-sm font-bold leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                              <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded font-medium">
                                {task.category}
                              </span>
                              {task.time && (
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <span>🕒 {task.time}</span>
                                  {task.alarmEnabled !== false && !task.completed && (
                                    <Bell className="w-2.5 h-2.5 text-rose-500" title="Alarm enabled" />
                                  )}
                                </span>
                              )}
                              {task.priority === 'high' && (
                                <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">{t('urgentPriority')}</span>
                              )}
                              <a
                                href={generateGoogleCalendarUrl({
                                  title: `Task: ${task.title}`,
                                  date: task.date,
                                  startTime: task.time,
                                  details: `Category: ${task.category}\nPriority: ${task.priority}\nNotes: ${task.notes || 'None'}`,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-1.5 py-0.5 rounded text-[10px] cursor-pointer"
                                title="Export task to Google Calendar"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                                <span>+ Cal</span>
                              </a>
                              <span className="text-blue-600 font-semibold ml-auto flex items-center gap-0.5">
                                <Edit2 className="w-2.5 h-2.5" /> {t('clickToEdit')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xs text-slate-500 italic mb-2">
                        {t('noTasksToday')}
                      </p>
                      <button
                        onClick={() => {
                          handleOpenAddTask(activeDateStr);
                          setIsMobileDetailsOpen(false);
                        }}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                      >
                        + {t('newTask')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom dismissal safe-area bar */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {t('tapOutsideToClose')}
                </span>
                <button
                  onClick={() => setIsMobileDetailsOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
                >
                  {t('done')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GOOGLE CALENDAR HOLIDAYS & RED DAYS MODAL */}
      <AnimatePresence>
        {showGoogleApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden relative space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {t('googleCalendar')} {t('officialHolidays')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('japanCalendar')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGoogleApiModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3.5 pr-1 text-xs text-slate-600 flex-1">
                {/* Google Calendar ID Card */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      {t('googleCalendarFeedTitle')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-200/70 text-blue-800 rounded font-mono font-bold">
                      Official Feed
                    </span>
                  </div>
                  <code className="block bg-white p-2 rounded-xl text-[11px] font-mono text-slate-800 border border-blue-200 select-all break-all">
                    {GOOGLE_CALENDAR_JAPAN_HOLIDAY_CALENDAR_ID}
                  </code>
                  <p className="text-[11px] text-blue-700/90 leading-relaxed">
                    {t('googleCalendarFeedDesc')}
                  </p>
                </div>

                {/* Statutory Features List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {t('engineCapabilitiesTitle')}
                  </h4>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{t('span50Years')}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t('span50YearsDesc')}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{t('equinoxFormulas')}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t('equinoxFormulasDesc')}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{t('substituteHolidays')}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t('substituteHolidaysDesc')}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        4
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{t('oneClickGoogleCal')}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t('oneClickGoogleCalDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Red Day Importance for Students */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{t('redDaysImportanceTitle')}</span>
                  </div>
                  <p className="leading-relaxed">
                    {t('redDaysImportanceDesc')}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('openGoogleCalendar')}</span>
                </a>

                <button
                  onClick={() => setShowGoogleApiModal(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
                >
                  {t('gotIt')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
