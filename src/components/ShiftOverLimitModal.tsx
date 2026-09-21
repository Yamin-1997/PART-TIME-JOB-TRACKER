import React from 'react';
import { AlertTriangle, ShieldAlert, Clock, CheckCircle2, X, School, Info } from 'lucide-react';

interface ShiftOverLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isVacation: boolean) => void;
  weekLabel: string;
  currentWeekHours: number;
  newShiftHours: number;
  projectedTotalHours: number;
  jobName: string;
  dateStr: string;
}

export const ShiftOverLimitModal: React.FC<ShiftOverLimitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  weekLabel,
  currentWeekHours,
  newShiftHours,
  projectedTotalHours,
  jobName,
  dateStr,
}) => {
  const [isVacation, setIsVacation] = React.useState(false);
  const [acknowledgedRisk, setAcknowledgedRisk] = React.useState(false);

  if (!isOpen) return null;

  const excessHours = Math.max(0, projectedTotalHours - 28.0);

  const handleConfirm = () => {
    onConfirm(isVacation);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Urgent Header */}
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-rose-200 text-rose-800 rounded">
                  Legal Alert: Article 19
                </span>
                <span className="text-xs font-semibold text-rose-700">Immigration Warning</span>
              </div>
              <h3 className="text-lg font-black text-rose-950 mt-1">
                Exceeding 28 Hours Weekly Limit!
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-rose-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Hour calculation breakdown banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Weekly Calculation ({weekLabel})
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Current Week</div>
                <div className="text-lg font-black text-slate-800 font-mono">
                  {currentWeekHours.toFixed(1)}h
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs text-blue-600 font-medium">+ This Shift</div>
                <div className="text-lg font-black text-blue-600 font-mono">
                  +{newShiftHours.toFixed(1)}h
                </div>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <div className="text-xs text-rose-600 font-bold">New Total</div>
                <div className="text-lg font-black text-rose-600 font-mono">
                  {projectedTotalHours.toFixed(1)}h
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-rose-700 font-semibold flex items-center justify-center gap-1.5 bg-rose-100/70 py-1.5 px-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Exceeds Japan's 28.0h student visa cap by{' '}
                <strong className="font-extrabold">{excessHours.toFixed(1)} hours</strong>!
              </span>
            </div>
          </div>

          {/* Legal Notice Message */}
          <div className="text-xs text-slate-600 space-y-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Japan Immigration Bureau (出入国在留管理庁) Regulations:</span>
            </div>
            <p className="leading-relaxed">
              International students in Japan on a <strong>Student Visa (留学)</strong> with permission to engage in other activities (資格外活動許可) are legally limited to <strong>28 hours per week</strong> across all combined employers.
            </p>
            <p className="leading-relaxed text-amber-800">
              Working beyond 28 hours during a regular school term is a strict immigration violation that may lead to <strong>visa extension rejection</strong> or deportation.
            </p>
          </div>

          {/* Exception checkbox & Acknowledgment */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={isVacation}
                onChange={(e) => setIsVacation(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  Official Long Vacation Exception (長期休業期間)
                </span>
                <p className="text-slate-500 mt-0.5">
                  Check this if your university/language school is currently on official summer/spring/winter break. Under Article 19, up to <strong>8 hours/day and 40 hours/week</strong> is permitted with school certificate.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={acknowledgedRisk}
                onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-rose-900">
                  I understand this shift exceeds 28 hours and wish to log it
                </span>
                <p className="text-rose-700 mt-0.5">
                  The shift will be recorded with an Over-Limit flag in your dashboard.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            Adjust Shift Times
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!acknowledgedRisk && !isVacation}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 ${
              acknowledgedRisk || isVacation
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Log Over-Limit Shift</span>
          </button>
        </div>
      </div>
    </div>
  );
};
