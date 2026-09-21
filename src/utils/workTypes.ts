export interface WorkTypeItem {
  id: string;
  name: string;
  isCustom?: boolean;
}

export const DEFAULT_WORK_TYPES: WorkTypeItem[] = [
  { id: 'wt-1', name: 'Convenience Store (コンビニ)' },
  { id: 'wt-2', name: 'Cafe / Restaurant (カフェ・飲食店)' },
  { id: 'wt-3', name: 'Supermarket / Retail (スーパー・販売)' },
  { id: 'wt-4', name: 'English / Language Tutor (語学講師)' },
  { id: 'wt-5', name: 'Hotel / Tourism (ホテル・観光)' },
  { id: 'wt-6', name: 'Kitchen / Prep (調理補助)' },
  { id: 'wt-7', name: 'Logistics / Warehouse (倉庫・軽作業)' },
  { id: 'wt-8', name: 'Delivery / Courier (デリバリー・配達)' },
  { id: 'wt-9', name: 'Office Assistant / IT (事務・IT補助)' },
  { id: 'wt-10', name: 'Event / Facility Staff (イベント・施設)' },
  { id: 'wt-11', name: 'Other Part-time Job (その他)' },
];

export const WORK_TYPES_STORAGE_KEY = 'baitomate_work_types';

export function loadWorkTypes(): WorkTypeItem[] {
  const saved = localStorage.getItem(WORK_TYPES_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse work types', e);
    }
  }
  return DEFAULT_WORK_TYPES;
}

export function saveWorkTypes(types: WorkTypeItem[]): void {
  localStorage.setItem(WORK_TYPES_STORAGE_KEY, JSON.stringify(types));
}
