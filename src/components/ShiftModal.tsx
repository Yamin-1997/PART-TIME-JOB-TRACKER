import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Coins, 
  Train, 
  X, 
  Sparkles, 
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Moon,
  Plus,
  Check,
  Coffee
} from 'lucide-react';
import { Shift, PartTimeJob } from '../types';
import { calculateShiftMetrics } from '../utils/nightShift';
import { useLanguage } from '../utils/LanguageContext';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shiftData: Omit<Shift, 'id' | 'createdAt'>) => void;
  initialDate?: string;
  initialShift?: Shift | null;
  jobs: PartTimeJob[];
  existingShifts?: Shift[];
  weeklyLimit?: number;
  onWeeklyLimitChange?: (limit: number) => void;
}

const PRESET_BREAKS = [0, 15, 30, 45, 60, 90];

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialShift,
  jobs,
  existingShifts = [],
  weeklyLimit = 28,
  onWeeklyLimitChange,
}) => {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('22:00');
  const [breakMinutes, setBreakMinutes] = useState<number>(0);
  const [transportAllowance, setTransportAllowance] = useState<number>(400);
  const [hasAllowance, setHasAllowance] = useState<boolean>(true);
  const [isNightBonusApplied, setIsNightBonusApplied] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [selectedLimit, setSelectedLimit] = useState<number>(weeklyLimit);
  const { t } = useLanguage();

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  useEffect(() => {
    if (weeklyLimit) {
      setSelectedLimit(weeklyLimit);
    }
  }, [weeklyLimit]);

  useEffect(() => {
    if (initialShift) {
      setSelectedJobId(initialShift.jobId);
      setDate(initialShift.date);
      setStartTime(initialShift.startTime);
      setEndTime(initialShift.endTime);
      setBreakMinutes(initialShift.breakMinutes || 0);
      setTransportAllowance(initialShift.transportAllowance || 0);
      setHasAllowance((initialShift.transportAllowance || 0) > 0);
      setIsNightBonusApplied(initialShift.isNightBonusApplied ?? true);
      setNotes(initialShift.notes || '');
    } else {
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id);
      }
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime('17:00');
      setEndTime('22:00');
      setBreakMinutes(0);
      const defaultAllowance = selectedJob ? selectedJob.transportAllowance : 0;
      setTransportAllowance(defaultAllowance);
      setHasAllowance(defaultAllowance > 0);
      setIsNightBonusApplied(true);
      setNotes('');
    }
    setError('');
  }, [initialShift, initialDate, isOpen, jobs]);

  // Update default allowance when job changes if not editing an existing shift
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const newJob = jobs.find((j) => j.id === jobId);
    if (newJob && !initialShift) {
      setTransportAllowance(newJob.transportAllowance);
      setHasAllowance(newJob.transportAllowance > 0);
    }
  };

  if (!isOpen) return null;

  const wage = selectedJob ? selectedJob.hourlyWage : 1200;
  const effectiveAllowance = hasAllowance ? Number(transportAllowance) || 0 : 0;

  // Calculate work metrics with late-night 25% (22:00 to 05:00)
  const metrics = calculateShiftMetrics(
    startTime, 
    endTime, 
    breakMinutes, 
    wage, 
    isNightBonusApplied
  );

  const { hoursWorked, nightHoursWorked, daytimeHoursWorked, basePay, nightBonusPay, grossPay } = metrics;

  // Calculate gross shift duration before break
  const getGrossDurationHours = () => {
    if (!startTime || !endTime) return 0;
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    let startMins = sH * 60 + sM;
    let endMins = eH * 60 + eM;
    if (endMins < startMins) endMins += 24 * 60;
    return (endMins - startMins) / 60;
  };
  const grossHours = getGrossDurationHours();

  // Statutory break guidelines check (労働基準法第34条)
  const isBreakRecommended = grossHours > 6 && breakMinutes < 45;
  const isBreakLegallyLongRecommended = grossHours > 8 && breakMinutes < 60;

  // Calculate weekly boundaries for the chosen date (Monday to Sunday)
  const calculateWeekStats = () => {
    if (!date) return { weekStart: '', weekEnd: '', existingWeekHours: 0, weekLabel: '' };
    const [y, m, d] = date.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];

    const weekShifts = existingShifts.filter((s) => {
      // Exclude current shift if editing
      if (initialShift && s.id === initialShift.id) return false;
      return s.date >= monStr && s.date <= sunStr;
    });

    const existingWeekHours = weekShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
    const label = `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`;

    return {
      weekStart: monStr,
      weekEnd: sunStr,
      existingWeekHours,
      weekLabel: label,
    };
  };

  const { existingWeekHours, weekLabel } = calculateWeekStats();
  const projectedTotalHours = Math.round((existingWeekHours + hoursWorked) * 100) / 100;
  const willExceedLimit = projectedTotalHours > selectedLimit;
  const excessHours = Math.max(0, projectedTotalHours - selectedLimit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) {
      setError('Please select or create a part-time job first');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }
    if (hoursWorked <= 0) {
      setError('Calculated work hours must be greater than 0');
      return;
    }

    // Directly save shift! Hours are not limited by rules; only an informational warning is shown.
    proceedSaveShift(willExceedLimit, selectedLimit === 40);
  };

  const proceedSaveShift = (isOverLimitApproved: boolean, isSchoolVacation: boolean) => {
    onSave({
      jobId: selectedJob.id,
      jobName: selectedJob.name,
      date,
      startTime,
      endTime,
      breakMinutes: Number(breakMinutes) || 0,
      hourlyWage: selectedJob.hourlyWage,
      transportAllowance: effectiveAllowance,
      hasAllowance: effectiveAllowance > 0,
      hoursWorked,
      nightHoursWorked,
      nightBonusPay,
      isNightBonusApplied,
      grossPay,
      color: selectedJob.color,
      notes: notes.trim() || undefined,
      isOverLimitApproved,
      isSchoolVacation,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs"
                style={{ backgroundColor: selectedJob?.color || '#2563eb' }}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {initialShift ? 'Edit Shift Record' : 'Log / Schedule Shift'}
                </h3>
                <p className="text-xs text-slate-500">Record work hours, unpaid break, transit allowance, and late night pay</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Weekly Target Limit Selector (28h Term vs 40h Holiday Permit) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">Weekly Target Limit:</span>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px]">
                    {selectedLimit} hrs/week
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {selectedLimit === 40
                    ? 'Holiday permit active (長期休暇: up to 40h permitted during school breaks)'
                    : 'Standard term active (通常学期: 28h guideline). You can still log more hours.'}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLimit(28);
                    onWeeklyLimitChange?.(28);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    selectedLimit === 28
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  28h (Term)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLimit(40);
                    onWeeklyLimitChange?.(40);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    selectedLimit === 40
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  40h (Holiday)
                </button>
              </div>
            </div>

            {/* Over limit non-blocking warning notice */}
            {willExceedLimit && hoursWorked > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1 animate-in fade-in">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Weekly Limit Notice: Exceeds {selectedLimit} Hours</span>
                </div>
                <p className="text-amber-800">
                  Adding this shift will bring your week of <strong>{weekLabel}</strong> to{' '}
                  <span className="font-black font-mono underline">{projectedTotalHours.toFixed(1)} hrs</span>{' '}
                  (+{excessHours.toFixed(1)}h over the {selectedLimit}h {selectedLimit === 40 ? 'holiday permit' : 'standard term'} target).
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  ⚠️ This is an informational warning only. You can freely save this shift; all hours and earnings will be accurately recorded.
                </p>
              </div>
            )}

            {/* Workplace selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Select Workplace <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm font-semibold bg-white"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name} (¥{job.hourlyWage.toLocaleString()}/hr • {job.transportAllowance > 0 ? `+¥${job.transportAllowance} transit` : 'No transit'})
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            {/* Unpaid Break (Minutes) - FULLY CONTROLLABLE */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-slate-500" />
                  Unpaid Break (Minutes)
                </label>
                <span className="text-xs font-bold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {breakMinutes} mins ({breakMinutes > 0 ? (breakMinutes / 60).toFixed(2) + 'h' : '0h'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="360"
                  step="5"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-semibold text-sm bg-white"
                />
                
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 items-center flex-1">
                  {PRESET_BREAKS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setBreakMinutes(mins)}
                      className={`px-2 py-1 text-xs rounded-md font-semibold transition ${
                        breakMinutes === mins
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mins === 0 ? '0m' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statutory Break Tip */}
              {isBreakRecommended && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  Shift is {grossHours.toFixed(1)}h. Under Japan Labor Law Art. 34, shifts &gt;6h typically require at least 45 mins break.
                </p>
              )}
              {isBreakLegallyLongRecommended && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  Shift is {grossHours.toFixed(1)}h. Shifts &gt;8h legally require at least 60 mins break.
                </p>
              )}
            </div>

            {/* Commute Allowance - WITH FREE INPUT & PRESETS */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('transitAllowance')}</span>
                </label>
                {effectiveAllowance > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setHasAllowance(false);
                      setTransportAllowance(0);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Remove allowance for this shift"
                  >
                    <X className="w-3 h-3" />
                    {t('removeAllowance')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const restoreAmount = selectedJob?.transportAllowance || 180;
                      setHasAllowance(true);
                      setTransportAllowance(restoreAmount);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {t('restoreAllowance')}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    ¥
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={effectiveAllowance === 0 && !hasAllowance ? '' : effectiveAllowance}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setTransportAllowance(0);
                        setHasAllowance(false);
                      } else {
                        const val = Math.max(0, parseInt(raw, 10) || 0);
                        setTransportAllowance(val);
                        setHasAllowance(val > 0);
                      }
                    }}
                    placeholder="0"
                    className={`w-full pl-7 pr-3 py-1.5 rounded-lg border ${
                      effectiveAllowance === 0 
                        ? 'border-slate-200 bg-slate-100 text-slate-500' 
                        : 'border-slate-300 bg-white text-slate-900 font-semibold'
                    } outline-none text-sm`}
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setTransportAllowance(180);
                      setHasAllowance(true);
                    }}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      effectiveAllowance === 180
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Subway or one-zone bus fare (¥180)"
                  >
                    ¥180
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTransportAllowance(480);
                      setHasAllowance(true);
                    }}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      effectiveAllowance === 480
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Round trip commute fare (¥480)"
                  >
                    ¥480
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasAllowance(false);
                      setTransportAllowance(0);
                    }}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      effectiveAllowance === 0
                        ? 'bg-slate-300 text-slate-900 font-bold'
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title="No allowance (bicycle/walk) (¥0)"
                  >
                    ¥0
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {t('freeTransitHint')}
              </p>
            </div>

            {/* 深夜 25% (Late-Night 22:00 - 05:00) NOTICE & CONTROLLER */}
            {nightHoursWorked > 0 && (
              <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>深夜割増 (Late Night 25% Premium): {nightHoursWorked} hrs</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-indigo-900">
                    <input
                      type="checkbox"
                      checked={isNightBonusApplied}
                      onChange={(e) => setIsNightBonusApplied(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Apply +25%</span>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs text-indigo-800">
                  <span>
                    Shift overlaps with late-night window (22:00〜05:00). Labor law rate:
                  </span>
                  <span className="font-bold text-indigo-950 font-mono">
                    ¥{Math.round(wage * 1.25).toLocaleString()}/hr
                  </span>
                </div>

                {isNightBonusApplied && (
                  <div className="pt-1 border-t border-indigo-200/60 flex items-center justify-between text-xs">
                    <span className="text-indigo-700">Late-night wage bonus (+25%):</span>
                    <span className="font-bold text-indigo-900 font-mono text-sm">
                      +¥{nightBonusPay.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Shift Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Shift Notes / Responsibilities
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Closing cash register & food prep"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
              />
            </div>

            {/* Real-time Calculation Summary Card */}
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block">
                    Calculated Work Hours
                  </span>
                  <div className="text-xl font-black text-emerald-900 flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    {hoursWorked} hrs
                  </div>
                  <span className="text-[11px] text-emerald-700 block">
                    {daytimeHoursWorked}h regular {nightHoursWorked > 0 && `• ${nightHoursWorked}h 深夜 (25%UP)`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block">
                    Estimated Day's Gross Pay
                  </span>
                  <div className="text-xl font-black text-emerald-900 font-mono">
                    ¥{(grossPay + effectiveAllowance).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-700 block">
                    ¥{basePay.toLocaleString()} base
                    {nightBonusPay > 0 && ` + ¥${nightBonusPay.toLocaleString()} 深夜25%`}
                    {effectiveAllowance > 0 && ` + ¥${effectiveAllowance} transit`}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>Week total with this shift:</span>
                <span className={`font-bold font-mono ${willExceedLimit ? 'text-amber-800 font-black' : 'text-emerald-900'}`}>
                  {projectedTotalHours.toFixed(1)} / {selectedLimit}.0 hrs {willExceedLimit && `⚠️ (+${excessHours.toFixed(1)}h)`}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>
                  {initialShift ? 'Update Shift' : 'Save Shift Record'}
                  {willExceedLimit ? ` (Over ${selectedLimit}h)` : ''}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
