export type UserRole = 'student' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  schoolOrUniversity?: string;
  visaExpiryDate?: string;
  totalLogins: number; // how many times user entered the app
  lastLoginAt: string;
  createdAt: string;
}

export interface PartTimeJob {
  id: string;
  userId?: string;
  name: string; // e.g. 7-Eleven Shinjuku
  roleCategory: string; // e.g. Convenience Store, Cafe, Teaching, Restaurant, or Custom Work Type
  hourlyWage: number; // in JPY, e.g. 1200
  location: string; // e.g. Shinjuku Station East Exit, Tokyo
  transportAllowance: number; // transit reimbursement per day in JPY
  transportAllowanceCustom?: string; // free custom text (e.g., "180 of 480" or whatever)
  hasAllowance?: boolean; // whether allowance is enabled (can be removed / set to 0)
  color: string; // badge/accent color
  managerName?: string; // e.g. Tanaka-san (Tencho)
  contactPhone?: string; // e.g. 03-1234-5678
  notes?: string; // e.g. Uniform provided, 15m walk from JR station
  weeklyHoursPlanned?: number; // target hours per week
  createdAt: string;
}

export type JobFormData = Omit<PartTimeJob, 'id' | 'createdAt'>;

export interface Shift {
  id: string;
  userId?: string;
  jobId: string;
  jobName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number; // Unpaid Break in minutes
  hourlyWage: number;
  transportAllowance: number;
  transportAllowanceCustom?: string; // free custom text (e.g. "180 of 480")
  hasAllowance?: boolean; // whether commute allowance was applied or removed
  hoursWorked: number; // net work hours
  nightHoursWorked?: number; // hours between 22:00 and 05:00 eligible for +25% 深夜手当
  nightBonusPay?: number; // +25% premium wage amount
  isNightBonusApplied?: boolean; // whether 深夜 25% was enabled/applied
  grossPay: number; // wage + night bonus (+ allowance)
  color?: string;
  notes?: string;
  isOverLimitApproved?: boolean; // user acknowledged exceeding 28h
  isSchoolVacation?: boolean; // school vacation exception (up to 40h)
  createdAt: string;
}

export type TaskAlarmSound = 'chime' | 'digital' | 'bell' | 'marimba';

export interface StudentTask {
  id: string;
  userId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. 14:00
  category: 'work' | 'school' | 'visa' | 'personal';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  jobId?: string;
  notes?: string;
  alarmEnabled?: boolean; // whether alarm sound & notification is enabled
  alarmOffsetMinutes?: number; // 0 = at time of task, 5 = 5m before, 15 = 15m before, etc.
  alarmSound?: TaskAlarmSound; // audio tone preset
  alarmDismissedAt?: string; // ISO timestamp when last dismissed
  alarmSnoozedUntil?: string; // ISO timestamp if snoozed
  createdAt: string;
}

export interface JapaneseHoliday {
  date: string; // YYYY-MM-DD
  nameEn: string;
  nameJa: string;
  type: 'national' | 'substitute' | 'bridge';
}
