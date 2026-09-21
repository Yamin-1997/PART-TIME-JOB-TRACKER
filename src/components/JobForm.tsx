import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Coins, 
  MapPin, 
  Train, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Sparkles, 
  X,
  AlertCircle,
  Plus,
  Settings2,
  Moon,
  Check
} from 'lucide-react';
import { PartTimeJob, JobFormData } from '../types';
import { WorkTypeItem, DEFAULT_WORK_TYPES, loadWorkTypes } from '../utils/workTypes';
import { useLanguage } from '../utils/LanguageContext';

interface JobFormProps {
  initialData?: PartTimeJob | null;
  onSubmit: (jobData: JobFormData) => void;
  onCancel?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  isOpenAsModal?: boolean;
  workTypes?: WorkTypeItem[];
  onOpenManageTypes?: () => void;
}

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald Green
  '#d97706', // Amber/Orange
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#db2777'  // Pink
];

export const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onClose,
  isOpen = true,
  isOpenAsModal = true,
  workTypes: propWorkTypes,
  onOpenManageTypes,
}) => {
  const handleDismiss = onClose || onCancel;

  if (isOpen === false) return null;
  const { t } = useLanguage();
  const [availableWorkTypes, setAvailableWorkTypes] = useState<WorkTypeItem[]>(() => 
    propWorkTypes && propWorkTypes.length > 0 ? propWorkTypes : loadWorkTypes()
  );

  const [isAddingInlineType, setIsAddingInlineType] = useState(false);
  const [inlineTypeName, setInlineTypeName] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    name: '',
    roleCategory: availableWorkTypes[0]?.name || 'Convenience Store (コンビニ)',
    hourlyWage: 1200,
    location: '',
    transportAllowance: 400,
    transportAllowanceCustom: '400',
    hasAllowance: true,
    color: PRESET_COLORS[0],
    managerName: '',
    contactPhone: '',
    notes: '',
    weeklyHoursPlanned: 12,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (propWorkTypes && propWorkTypes.length > 0) {
      setAvailableWorkTypes(propWorkTypes);
    }
  }, [propWorkTypes]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        roleCategory: initialData.roleCategory,
        hourlyWage: initialData.hourlyWage,
        location: initialData.location,
        transportAllowance: initialData.transportAllowance,
        transportAllowanceCustom: initialData.transportAllowanceCustom ?? (initialData.transportAllowance > 0 ? String(initialData.transportAllowance) : ''),
        hasAllowance: initialData.hasAllowance ?? (initialData.transportAllowance > 0),
        color: initialData.color,
        managerName: initialData.managerName || '',
        contactPhone: initialData.contactPhone || '',
        notes: initialData.notes || '',
        weeklyHoursPlanned: initialData.weeklyHoursPlanned || 12,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Job name is required (e.g., 7-Eleven Shinjuku)';
    }
    if (!formData.hourlyWage || formData.hourlyWage < 800) {
      newErrors.hourlyWage = 'Hourly wage must be at least ¥800/hr';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location or nearest station is required';
    }
    if (formData.transportAllowance < 0) {
      newErrors.transportAllowance = 'Allowance cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleAddInlineType = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    const trimmed = inlineTypeName.trim();
    if (!trimmed) return;

    if (!availableWorkTypes.some((wt) => wt.name.toLowerCase() === trimmed.toLowerCase())) {
      const newTypeItem: WorkTypeItem = {
        id: 'wt-' + Date.now(),
        name: trimmed,
        isCustom: true,
      };
      const updated = [...availableWorkTypes, newTypeItem];
      setAvailableWorkTypes(updated);
      setFormData({ ...formData, roleCategory: trimmed });
    } else {
      setFormData({ ...formData, roleCategory: trimmed });
    }

    setInlineTypeName('');
    setIsAddingInlineType(false);
  };

  // Remove allowance handler
  const handleRemoveAllowance = () => {
    setFormData({
      ...formData,
      transportAllowance: 0,
      transportAllowanceCustom: '0',
      hasAllowance: false,
    });
  };

  const handleRestoreAllowance = (amount: number = 400) => {
    setFormData({
      ...formData,
      transportAllowance: amount,
      transportAllowanceCustom: String(amount),
      hasAllowance: true,
    });
  };

  // Live estimate calculations
  const plannedHours = Number(formData.weeklyHoursPlanned) || 0;
  const wage = Number(formData.hourlyWage) || 0;
  const lateNightWage = Math.round(wage * 1.25);
  const monthlyEst = Math.round(plannedHours * wage * 4.33);

  const content = (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl ${isOpenAsModal ? 'max-w-2xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto my-auto' : 'p-6 sm:p-8'}`}>
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: formData.color }}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? 'Edit Part-Time Job Details' : 'Add New Part-Time Job'}
            </h2>
            <p className="text-sm text-slate-500">
              Record employer name, hourly rate, location, and commute allowance
            </p>
          </div>
        </div>

        {handleDismiss && (
          <button 
            type="button"
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core details: Job Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="job-name">
              Job Name / Workplace <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="job-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 7-Eleven Shinjuku South"
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500'} focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900 font-medium`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="job-category">
                Work Type / Industry Category
              </label>
              {onOpenManageTypes && (
                <button
                  type="button"
                  onClick={onOpenManageTypes}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition"
                >
                  <Settings2 className="w-3 h-3" />
                  Manage Types
                </button>
              )}
            </div>

            {isAddingInlineType ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inlineTypeName}
                  onChange={(e) => setInlineTypeName(e.target.value)}
                  placeholder="Enter new work type name..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm font-medium bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddInlineType}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingInlineType(false)}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <select
                    id="job-category"
                    value={formData.roleCategory}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingInlineType(true);
                      } else {
                        setFormData({ ...formData, roleCategory: e.target.value });
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900 bg-white font-medium"
                  >
                    {availableWorkTypes.map((wt) => (
                      <option key={wt.id} value={wt.name}>
                        {wt.name}
                      </option>
                    ))}
                    <option value="__add_new__" className="text-blue-600 font-bold">
                      ➕ Add Custom Work Type...
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsAddingInlineType(true)}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 border border-slate-200"
                    title="Add new custom work type"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Type</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wage, Location & Commute */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="hourly-wage">
              Hourly Wage (¥ / hr) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                ¥
              </div>
              <input
                id="hourly-wage"
                type="number"
                min="800"
                step="10"
                value={formData.hourlyWage || ''}
                onChange={(e) => setFormData({ ...formData, hourlyWage: parseInt(e.target.value) || 0 })}
                placeholder="1200"
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${errors.hourlyWage ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500'} focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900 font-semibold`}
              />
            </div>
            {errors.hourlyWage ? (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.hourlyWage}
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {/* Late-Night +25% indicator */}
                <div className="p-2 bg-indigo-50/80 border border-indigo-200/80 rounded-lg text-xs text-indigo-900 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    深夜 25% (22:00〜05:00):
                  </span>
                  <span className="font-bold text-indigo-700 font-mono">
                    ¥{lateNightWage.toLocaleString()}/hr
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hourlyWage: 1163 })}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition font-medium"
                  >
                    ¥1,163 (Tokyo Min)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hourlyWage: 1250 })}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition font-medium"
                  >
                    ¥1,250
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hourlyWage: 1400 })}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition font-medium"
                  >
                    ¥1,400
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="job-location">
              Location / Nearest Station <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="job-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Shinjuku Station (JR Line)"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500'} focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900`}
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.location}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5" htmlFor="transport-allowance">
                <Train className="w-4 h-4 text-slate-500" />
                <span>{t('transitAllowance')}</span>
              </label>
              {formData.transportAllowance > 0 ? (
                <button
                  type="button"
                  onClick={handleRemoveAllowance}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Remove transit allowance (set to ¥0)"
                >
                  <X className="w-3 h-3" />
                  {t('removeAllowance')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRestoreAllowance(180)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  {t('restoreAllowance')}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                ¥
              </div>
              <input
                id="transport-allowance"
                type="text"
                value={formData.transportAllowanceCustom !== undefined ? formData.transportAllowanceCustom : (formData.transportAllowance > 0 ? String(formData.transportAllowance) : '')}
                onChange={(e) => {
                  const raw = e.target.value;
                  const matchNum = raw.match(/\d+/);
                  const val = matchNum ? Math.max(0, parseInt(matchNum[0], 10) || 0) : 0;
                  setFormData({
                    ...formData,
                    transportAllowanceCustom: raw,
                    transportAllowance: val,
                    hasAllowance: raw.trim() !== '' && raw.trim() !== '0',
                  });
                }}
                placeholder={t('freeTransitHint')}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${formData.transportAllowance === 0 && !formData.hasAllowance ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-300 text-slate-900'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium`}
              />
            </div>

            {/* Free custom presets: e.g. 180, 480, 0, or custom */}
            <div className="mt-2 space-y-1.5">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 font-medium">{t('quickTransitPresets')}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportAllowance: 180, transportAllowanceCustom: '180', hasAllowance: true })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
                    formData.transportAllowanceCustom === '180'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Subway or one-zone bus fare (¥180)"
                >
                  ¥180 {t('subwayBus')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportAllowance: 480, transportAllowanceCustom: '480', hasAllowance: true })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
                    formData.transportAllowanceCustom === '480'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Round trip commute fare (¥480)"
                >
                  ¥480 {t('roundTrip')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportAllowance: 180, transportAllowanceCustom: '180 of 480', hasAllowance: true })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
                    formData.transportAllowanceCustom === '180 of 480'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Custom example: 180 of 480"
                >
                  180 of 480
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAllowance}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
                    formData.transportAllowance === 0 && !formData.hasAllowance
                      ? 'bg-slate-300 text-slate-900 font-bold'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="No allowance (walk or bike) (¥0)"
                >
                  {t('noCommute')}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {t('freeTransitHint')}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Target Hours & Accent Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="weekly-hours">
              Planned Weekly Hours
            </label>
            <div className="flex items-center gap-3">
              <input
                id="weekly-hours"
                type="range"
                min="2"
                max="28"
                step="1"
                value={formData.weeklyHoursPlanned || 12}
                onChange={(e) => setFormData({ ...formData, weeklyHoursPlanned: parseInt(e.target.value) || 0 })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-14 text-center font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 text-sm">
                {formData.weeklyHoursPlanned || 0}h
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Immigration maximum: 28 hrs/week combined across all jobs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Badge / Calendar Color Tag
            </label>
            <div className="flex items-center gap-2 pt-1">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: col })}
                  className={`w-7 h-7 rounded-full transition-transform ${formData.color === col ? 'scale-125 ring-2 ring-offset-2 ring-slate-400 shadow-sm' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: col }}
                  aria-label={`Color ${col}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Color coding used for shifts and dashboard cards.
            </p>
          </div>
        </div>

        {/* Manager Details & Notes (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="manager-name">
              Store Manager (店長) or Contact Person
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="manager-name"
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="e.g., Tanaka-san (Manager)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="contact-phone">
              Store Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="contact-phone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="e.g., 03-1234-5678"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="job-notes">
            Workplace Notes / Perks (e.g. Uniform provided, Free staff meal まかない)
          </label>
          <div className="relative">
            <textarea
              id="job-notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Shift requested on 15th of each month. Free staff bento. Bring black non-slip shoes."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900 text-sm"
            />
          </div>
        </div>

        {/* Live Estimated Monthly Earnings Callout */}
        <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-blue-950">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-sm">
              Estimated Gross Monthly Income ({plannedHours} hrs/wk @ ¥{wage.toLocaleString()}/hr):
            </span>
          </div>
          <span className="text-lg font-bold text-blue-700 font-mono">
            ¥{monthlyEst.toLocaleString()}<span className="text-xs font-normal text-slate-500"> / month</span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow transition flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            {initialData ? 'Update Job Details' : 'Save Part-Time Job'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return content;
};
