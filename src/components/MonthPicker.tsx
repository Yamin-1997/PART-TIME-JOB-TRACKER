import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';

interface MonthPickerProps {
  currentDate: Date;
  onChangeMonth: (newDate: Date) => void;
  onResetToday: () => void;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_JA = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

const MONTH_NAMES_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const MONTH_NAMES_NE = [
  'जनवरी (१ महिना)', 'फेब्रुअरी (२ महिना)', 'मार्च (३ महिना)', 'अप्रिल (४ महिना)',
  'मे (५ महिना)', 'जुन (६ महिना)', 'जुलाई (७ महिना)', 'अगस्ट (८ महिना)',
  'सेप्टेम्बर (९ महिना)', 'अक्टोबर (१० महिना)', 'नोभेम्बर (११ महिना)', 'डिसेम्बर (१२ महिना)'
];

// 50+ Year range: 2005 through 2055 (51 years)
export const YEARS_50: number[] = Array.from({ length: 51 }, (_, i) => 2005 + i);

// Japanese Era Helper (和暦)
export function getJapaneseEraName(y: number): string {
  if (y >= 2019) {
    const reiwaYear = y - 2018;
    return reiwaYear === 1 ? '令和元年' : `令和${reiwaYear}年`;
  }
  if (y >= 1989) {
    const heiseiYear = y - 1988;
    return heiseiYear === 1 ? '平成元年' : `平成${heiseiYear}年`;
  }
  return '';
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  currentDate,
  onChangeMonth,
  onResetToday,
}) => {
  const { language, t } = useLanguage();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getMonthLabel = (idx: number) => {
    switch (language) {
      case 'ja':
        return MONTH_NAMES_JA[idx];
      case 'vi':
        return `${MONTH_NAMES_VI[idx]} (${MONTH_NAMES_JA[idx]})`;
      case 'ne':
        return `${MONTH_NAMES_NE[idx]}`;
      default:
        return `${MONTH_NAMES_EN[idx]} (${MONTH_NAMES_JA[idx]})`;
    }
  };

  const handleSelectYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    onChangeMonth(new Date(newYear, month, 1));
  };

  const handleSelectMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    onChangeMonth(new Date(year, newMonth, 1));
  };

  const isCurrentRealMonth = () => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month;
  };

  return (
    <div className="flex items-center justify-between gap-2 bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        {/* Month Select */}
        <div className="flex-1 min-w-0 sm:flex-initial sm:min-w-[140px]">
          <select
            value={month}
            onChange={handleSelectMonth}
            aria-label="Select month"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-3 py-1.5 font-bold text-slate-900 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition truncate"
          >
            {MONTH_NAMES_EN.map((_, idx) => (
              <option key={idx} value={idx}>
                {getMonthLabel(idx)}
              </option>
            ))}
          </select>
        </div>

        {/* 50-Year Selection Dropdown */}
        <div className="flex-1 min-w-0 sm:flex-initial sm:min-w-[150px]">
          <select
            value={year}
            onChange={handleSelectYear}
            aria-label="Select year"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-3 py-1.5 font-extrabold text-slate-900 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition truncate"
            title="Select year"
          >
            {YEARS_50.map((y) => (
              <option key={y} value={y}>
                {y} ({getJapaneseEraName(y)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isCurrentRealMonth() && (
        <button
          onClick={onResetToday}
          className="shrink-0 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition flex items-center gap-1 sm:gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">{t('returnToToday')}</span>
          <span className="sm:hidden">{t('today')}</span>
        </button>
      )}
    </div>
  );
};
