import React from 'react';
import { 
  Building2, 
  MapPin, 
  Coins, 
  Train, 
  Clock, 
  Phone, 
  User, 
  Edit2, 
  Trash2, 
  Sparkles,
  Info
} from 'lucide-react';
import { PartTimeJob } from '../types';
import { useLanguage } from '../utils/LanguageContext';

interface JobCardProps {
  job: PartTimeJob;
  onEdit: (job: PartTimeJob) => void;
  onDelete: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const plannedHours = job.weeklyHoursPlanned || 0;
  const monthlyEst = Math.round(plannedHours * job.hourlyWage * 4.33);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden relative group">
      {/* Top Accent Stripe */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: job.color || '#2563eb' }}
      />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Job name + Action buttons */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: job.color || '#2563eb' }}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 leading-tight">
                  {job.name}
                </h3>
                <span className="inline-block mt-0.5 text-xs font-medium px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {job.roleCategory}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
              <button
                onClick={() => onEdit(job)}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                title={t('edit')}
                aria-label={t('edit')}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(job.id)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title={t('delete')}
                aria-label={t('delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 my-4">
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                {t('hourlyWage')}
              </span>
              <div className="text-lg font-extrabold text-slate-900">
                ¥{job.hourlyWage.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / hr</span>
              </div>
              <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                {t('nightBonus')}: ¥{Math.round(job.hourlyWage * 1.25).toLocaleString()}/hr
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                {t('transitAllowance')}
              </span>
              {job.transportAllowanceCustom ? (
                <div className="text-sm sm:text-base font-bold text-slate-900 break-words py-0.5">
                  {job.transportAllowanceCustom}
                </div>
              ) : job.transportAllowance > 0 ? (
                <div className="text-lg font-bold text-slate-900">
                  ¥{job.transportAllowance.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> / day</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-500 py-1">
                  {t('noAllowanceBadge')}
                </div>
              )}
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-2 text-sm text-slate-600 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="font-medium text-slate-800">{job.location}</span>
            </div>

            {(job.managerName || job.contactPhone) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                {job.managerName && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.managerName}</span>
                  </div>
                )}
                {job.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.contactPhone}</span>
                  </div>
                )}
              </div>
            )}

            {job.notes && (
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900 mt-2 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{job.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Weekly Hours & Estimated Monthly Earnings */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{plannedHours} {t('hours')}/wk</span>
          </div>
          <div className="font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md">
            ~¥{monthlyEst.toLocaleString()}/mo
          </div>
        </div>
      </div>
    </div>
  );
};
