import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Coins, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Briefcase, 
  RotateCcw,
  Calendar as CalendarIcon,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Layers,
  ArrowRight,
  LogIn,
  LogOut,
  ShieldCheck,
  BookOpen,
  Users,
  User,
  School,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { PartTimeJob, JobFormData, Shift, StudentTask, UserAccount } from './types';
import { DEFAULT_JOBS, DEFAULT_SHIFTS, DEFAULT_TASKS, DEFAULT_USERS } from './utils/initialData';
import { JobForm } from './components/JobForm';
import { JobCard } from './components/JobCard';
import { MonthPicker, YEARS_50, getJapaneseEraName } from './components/MonthPicker';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { CalendarView } from './components/CalendarView';
import { TasksListView } from './components/TasksListView';
import { ShiftModal } from './components/ShiftModal';
import { TaskModal } from './components/TaskModal';
import { AuthModal } from './components/AuthModal';
import { AppInstructionsModal } from './components/AppInstructionsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkTypesModal } from './components/WorkTypesModal';
import { TaskAlarmModal } from './components/TaskAlarmModal';
import { LanguageSelector } from './components/LanguageSelector';
import { useLanguage } from './utils/LanguageContext';
import { WorkTypeItem, loadWorkTypes, saveWorkTypes } from './utils/workTypes';
import { isTaskAlarmDue, sendTaskAlarmNotification, stopAlarmLoop } from './utils/taskAlarmAudio';

type ActiveTab = 'dashboard' | 'calendar' | 'tasks' | 'jobs' | 'admin';

export default function App() {
  const { t } = useLanguage();
  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Month navigation state: defaults to current month (September 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 8, 16)); // Sep 16, 2026

  // Persistent state: Registered Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('baitomate_users');
    let userList: UserAccount[] = DEFAULT_USERS;
    if (saved) {
      try {
        userList = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }
    // Remove any legacy 'admin@baitomate.jp' / Admin Supervisor
    userList = userList.filter((u) => u.email.toLowerCase() !== 'admin@baitomate.jp');
    
    // Ensure Demo Student exists with example email
    const demoIdx = userList.findIndex((u) => u.email.toLowerCase() === 'student.demo@example.com');
    if (demoIdx < 0) {
      userList.unshift(DEFAULT_USERS[0]);
    }

    // Ensure YAMIN is correctly recognized with name 'YAMIN' and role 'admin'
    const yaminIdx = userList.findIndex((u) => u.email.toLowerCase() === 'yaminei67611@gmail.com');
    if (yaminIdx >= 0) {
      userList[yaminIdx] = {
        ...userList[yaminIdx],
        name: 'YAMIN',
        role: 'admin',
      };
    } else {
      const yaminAdmin = DEFAULT_USERS.find((u) => u.email.toLowerCase() === 'yaminei67611@gmail.com') || DEFAULT_USERS[1];
      userList.push(yaminAdmin);
    }
    return userList;
  });

  // Persistent state: Logged In User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // 1. Check if user was previously active/logged in on this device
    const saved = localStorage.getItem('baitomate_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.email?.toLowerCase() === 'yaminei67611@gmail.com') {
          return { ...u, name: 'YAMIN', role: 'admin' };
        }
        if (u.email?.toLowerCase() === 'admin@baitomate.jp') {
          return DEFAULT_USERS[0];
        }
        return u;
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }

    // 2. Check if user entered one time and has remembered credentials, so user can enter easily
    const savedCreds = localStorage.getItem('baitomate_remembered_credentials');
    if (savedCreds) {
      try {
        const creds = JSON.parse(savedCreds);
        if (creds.email) {
          if (creds.email.toLowerCase() === 'yaminei67611@gmail.com') {
            const adminUser = DEFAULT_USERS.find((u) => u.email.toLowerCase() === 'yaminei67611@gmail.com');
            if (adminUser) return adminUser;
          }
          const matched = DEFAULT_USERS.find((u) => u.email.toLowerCase() === creds.email.toLowerCase());
          if (matched) return matched;
        }
      } catch (e) {
        console.error('Failed to parse remembered credentials', e);
      }
    }

    // 3. New visitor: Default to Demo Student (example email: student.demo@example.com)
    // so users can see the demo before they use/register their own account!
    return DEFAULT_USERS[0];
  });

  // Persistent state: Jobs
  const [jobs, setJobs] = useState<PartTimeJob[]>(() => {
    const saved = localStorage.getItem('baitomate_jobs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse jobs', e);
      }
    }
    return DEFAULT_JOBS;
  });

  // Persistent state: Shifts
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('baitomate_shifts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse shifts', e);
      }
    }
    return DEFAULT_SHIFTS;
  });

  // Persistent state: Tasks
  const [tasks, setTasks] = useState<StudentTask[]>(() => {
    const saved = localStorage.getItem('baitomate_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    return DEFAULT_TASKS;
  });

  // User configurable weekly limit (28 hours standard term vs 40 hours holiday permit)
  const [weeklyLimit, setWeeklyLimit] = useState<number>(() => {
    const saved = localStorage.getItem('baitomate_weekly_limit');
    if (saved) {
      const parsed = Number(saved);
      if (parsed === 28 || parsed === 40) return parsed;
    }
    return 28;
  });

  const handleWeeklyLimitChange = (newLimit: number) => {
    setWeeklyLimit(newLimit);
    localStorage.setItem('baitomate_weekly_limit', String(newLimit));
  };

  // Modals & form state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<PartTimeJob | null>(null);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [targetDateForShift, setTargetDateForShift] = useState<string | undefined>(undefined);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null);
  const [targetDateForTask, setTargetDateForTask] = useState<string | undefined>(undefined);

  // Active Task Alarm state (rings when a task is due)
  const [activeAlarmTask, setActiveAlarmTask] = useState<StudentTask | null>(null);

  // Search & filter for Jobs tab
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobSelectedCategory, setJobSelectedCategory] = useState('all');

  // Custom Work Types state
  const [workTypes, setWorkTypes] = useState<WorkTypeItem[]>(() => loadWorkTypes());
  const [isWorkTypesModalOpen, setIsWorkTypesModalOpen] = useState(false);

  // Admin Portal Access Control:
  // "user can not see admin portal that only see me"
  // Only "me" (yaminei67611@gmail.com, or account with admin role) can see and access the Admin Portal.
  const isMeOrAdmin = currentUser?.email?.toLowerCase() === 'yaminei67611@gmail.com' || currentUser?.role === 'admin';

  // Protect Admin route: If unauthorized student is on admin tab, redirect to dashboard
  useEffect(() => {
    if (activeTab === 'admin' && !isMeOrAdmin) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isMeOrAdmin]);

  useEffect(() => {
    saveWorkTypes(workTypes);
  }, [workTypes]);

  // Flash notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const notify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('baitomate_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('baitomate_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('baitomate_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('baitomate_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('baitomate_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('baitomate_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Auth Actions
  const handleLogin = (userToLogin: UserAccount, rememberMe: boolean) => {
    const updatedUsers = users.map((u) =>
      u.id === userToLogin.id
        ? { ...u, totalLogins: (u.totalLogins || 0) + 1, lastLoginAt: new Date().toISOString() }
        : u
    );
    setUsers(updatedUsers);
    const freshUser = updatedUsers.find((u) => u.id === userToLogin.id) || userToLogin;
    setCurrentUser(freshUser);

    if (rememberMe) {
      localStorage.setItem(
        'baitomate_remembered_credentials',
        JSON.stringify({
          email: freshUser.email,
          rememberMe: true,
        })
      );
    }

    notify(`Welcome back, ${freshUser.name}! (Entered ${freshUser.totalLogins} times)`);
  };

  const handleRegister = (
    newUserData: Omit<UserAccount, 'id' | 'totalLogins' | 'lastLoginAt' | 'createdAt'>,
    rememberMe: boolean
  ) => {
    const newUser: UserAccount = {
      ...newUserData,
      id: 'user-' + Date.now(),
      totalLogins: 1,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setCurrentUser(newUser);

    if (rememberMe) {
      localStorage.setItem(
        'baitomate_remembered_credentials',
        JSON.stringify({
          email: newUser.email,
          rememberMe: true,
        })
      );
    }

    notify(`Account registered! Welcome to BaitoMate, ${newUser.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    notify('Logged out successfully. You can sign in anytime.', 'info');
    setIsAuthModalOpen(true);
  };

  const handleSwitchUser = (targetUser: UserAccount) => {
    setCurrentUser(targetUser);
    notify(`Switched active view to ${targetUser.name} (${targetUser.role}).`);
    if (targetUser.role === 'student' && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  };

  // Admin User Management: Delete user email so user can do one more (re-register), or reset password
  const handleDeleteUser = (userToDelete: UserAccount) => {
    if (userToDelete.email.toLowerCase() === 'yaminei67611@gmail.com') {
      notify('Cannot delete primary administrator account (yaminei67611@gmail.com)!', 'info');
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
    setUsers(updatedUsers);
    localStorage.setItem('baitomate_users', JSON.stringify(updatedUsers));

    // Clear remembered credentials if they belonged to this deleted user
    try {
      const saved = localStorage.getItem('baitomate_remembered_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email?.toLowerCase() === userToDelete.email.toLowerCase()) {
          localStorage.removeItem('baitomate_remembered_credentials');
        }
      }
    } catch (e) {
      console.error('Failed to clear credentials for deleted user', e);
    }

    // If currently viewing as this user, switch back to the admin or first available user
    if (currentUser?.id === userToDelete.id) {
      const admin = updatedUsers.find((u) => u.email.toLowerCase() === 'yaminei67611@gmail.com') ||
                    updatedUsers.find((u) => u.role === 'admin') ||
                    updatedUsers[0];
      setCurrentUser(admin);
    }

    notify(`User "${userToDelete.email}" deleted! User can now register fresh ("do one more").`, 'success');
  };

  const handleResetUserPassword = (userToReset: UserAccount, newPass = 'password123') => {
    const updatedUsers = users.map((u) =>
      u.id === userToReset.id ? { ...u, password: newPass } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('baitomate_users', JSON.stringify(updatedUsers));

    // If currentUser is this user, update currentUser state too
    if (currentUser?.id === userToReset.id) {
      setCurrentUser({ ...currentUser, password: newPass });
    }

    notify(`Password for "${userToReset.email}" reset to "${newPass}"!`, 'success');
  };

  // Filter shifts, jobs, and tasks for currently active student view
  // If user is student, isolate to their records
  const currentUserId = currentUser?.id || 'user-1';
  const currentUserShifts = currentUser?.role === 'admin'
    ? shifts
    : shifts.filter((s) => (s.userId ? s.userId === currentUserId : currentUserId === 'user-1'));

  const currentUserJobs = currentUser?.role === 'admin'
    ? jobs
    : jobs.filter((j) => (j.userId ? j.userId === currentUserId : currentUserId === 'user-1'));

  const currentUserTasks = currentUser?.role === 'admin'
    ? tasks
    : tasks.filter((t) => (t.userId ? t.userId === currentUserId : currentUserId === 'user-1'));

  // Job Actions
  const handleCreateJob = (data: JobFormData) => {
    const newJob: PartTimeJob = {
      ...data,
      id: 'job-' + Date.now(),
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    };
    setJobs([newJob, ...jobs]);
    setIsJobFormOpen(false);
    notify(`Added "${newJob.name}" to your workplaces!`);
  };

  const handleUpdateJob = (data: JobFormData) => {
    if (!editingJob) return;
    const updated = jobs.map((j) => (j.id === editingJob.id ? { ...j, ...data } : j));
    setJobs(updated);
    setEditingJob(null);
    setIsJobFormOpen(false);
    notify(`Updated "${data.name}".`);
  };

  const handleDeleteJob = (jobId: string) => {
    const target = jobs.find((j) => j.id === jobId);
    if (target && window.confirm(`Are you sure you want to delete "${target.name}"?`)) {
      setJobs(jobs.filter((j) => j.id !== jobId));
      notify(`Removed "${target.name}".`, 'info');
    }
  };

  // Shift Actions
  const handleSaveShift = (shiftData: Omit<Shift, 'id' | 'createdAt'>) => {
    if (editingShift) {
      setShifts(shifts.map((s) => (s.id === editingShift.id ? { ...s, ...shiftData, userId: currentUserId } : s)));
      notify(`Updated shift on ${shiftData.date}.`);
    } else {
      const newShift: Shift = {
        ...shiftData,
        id: 'shift-' + Date.now(),
        userId: currentUserId,
        createdAt: new Date().toISOString(),
      };
      setShifts([newShift, ...shifts]);
      notify(
        shiftData.isOverLimitApproved 
          ? `⚠️ Logged ${newShift.hoursWorked}h shift at ${newShift.jobName} (Over ${weeklyLimit}h target)!` 
          : `Logged ${newShift.hoursWorked}h shift at ${newShift.jobName}!`
      );
    }
    setEditingShift(null);
    setIsShiftModalOpen(false);
  };

  const openAddShift = (dateStr?: string) => {
    setEditingShift(null);
    setTargetDateForShift(dateStr || currentDate.toISOString().split('T')[0]);
    setIsShiftModalOpen(true);
  };

  const openEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setTargetDateForShift(shift.date);
    setIsShiftModalOpen(true);
  };

  // Task Actions
  const handleSaveTask = (taskData: Omit<StudentTask, 'id' | 'createdAt'>) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...taskData, userId: currentUserId } : t)));
      notify(`Updated task "${taskData.title}".`);
    } else {
      const newTask: StudentTask = {
        ...taskData,
        id: 'task-' + Date.now(),
        userId: currentUserId,
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
      notify(`Added task "${newTask.title}".`);
    }
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          notify(next ? 'Task marked complete! 🎉' : 'Task marked as pending.', 'info');
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    notify('Task deleted.', 'info');
  };

  const openAddTask = (dateStr?: string) => {
    setEditingTask(null);
    setTargetDateForTask(dateStr || currentDate.toISOString().split('T')[0]);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: StudentTask) => {
    setEditingTask(task);
    setTargetDateForTask(task.date);
    setIsTaskModalOpen(true);
  };

  // ⏰ Task Alarm background scheduler: checks every 5 seconds for due tasks
  useEffect(() => {
    const checkTaskAlarms = () => {
      // If an alarm is already actively ringing on screen, do not interrupt
      if (activeAlarmTask) return;

      const now = new Date();
      for (const task of tasks) {
        if (isTaskAlarmDue(task, now)) {
          setActiveAlarmTask(task);
          sendTaskAlarmNotification(task);
          break;
        }
      }
    };

    checkTaskAlarms();
    const interval = setInterval(checkTaskAlarms, 5000);
    return () => clearInterval(interval);
  }, [tasks, activeAlarmTask]);

  // Alarm action handlers
  const handleDismissAlarm = (task: StudentTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, alarmDismissedAt: new Date().toISOString(), alarmSnoozedUntil: undefined }
          : t
      )
    );
    setActiveAlarmTask(null);
    stopAlarmLoop();
    notify(`Alarm for "${task.title}" dismissed.`, 'info');
  };

  const handleSnoozeAlarm = (task: StudentTask, minutes: number) => {
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, alarmSnoozedUntil: snoozedUntil }
          : t
      )
    );
    setActiveAlarmTask(null);
    stopAlarmLoop();
    notify(`Alarm snoozed for ${minutes} minutes.`, 'info');
  };

  const handleCompleteTaskFromAlarm = (task: StudentTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: true, alarmDismissedAt: new Date().toISOString() }
          : t
      )
    );
    setActiveAlarmTask(null);
    stopAlarmLoop();
    notify('Task marked complete! 🎉', 'success');
  };

  const handleToggleAlarm = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !(t.alarmEnabled !== false);
          notify(next ? 'Alarm enabled for task 🔔' : 'Alarm muted for task', 'info');
          return { ...t, alarmEnabled: next };
        }
        return t;
      })
    );
  };

  const handleTriggerAlarmTest = (task: StudentTask) => {
    setActiveAlarmTask(task);
    sendTaskAlarmNotification(task);
  };

  // Reset to default demo data
  const handleResetDefaults = () => {
    if (window.confirm('Reset all jobs, shifts, tasks, and users back to realistic Japanese student demo data?')) {
      setUsers(DEFAULT_USERS);
      setCurrentUser(DEFAULT_USERS[0]);
      setJobs(DEFAULT_JOBS);
      setShifts(DEFAULT_SHIFTS);
      setTasks(DEFAULT_TASKS);
      setCurrentDate(new Date(2026, 8, 16));
      notify('Demo data restored successfully!');
    }
  };

  // Month stats for header badge
  const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthShiftsCount = currentUserShifts.filter((s) => s.date.startsWith(currentMonthPrefix)).length;
  const monthPendingTasksCount = currentUserTasks.filter((t) => t.date.startsWith(currentMonthPrefix) && !t.completed).length;

  // Filtered jobs list
  const filteredJobs = currentUserJobs.filter((job) => {
    const matchesSearch = 
      job.name.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.roleCategory.toLowerCase().includes(jobSearchQuery.toLowerCase());
    const matchesCat = jobSelectedCategory === 'all' || job.roleCategory === jobSelectedCategory;
    return matchesSearch && matchesCat;
  });

  const uniqueCategories = Array.from(new Set(currentUserJobs.map((j) => j.roleCategory)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Top Application Header */}
      {/* Sticky Header with Navigation and Profile */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-sm shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight truncate">BaitoMate</span>
              </div>
              <p className="text-xs text-slate-400 hidden lg:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Center/Right controls: Language Selector, Instructions, User info & Auth */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Instructions Guide Button */}
            <button
              onClick={() => setIsInstructionsOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              title="View App Instructions & Legal Guidelines"
            >
              <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="hidden md:inline">{t('instructions')}</span>
              <span className="hidden lg:inline text-[10px] text-blue-300 font-normal">{t('instructionsSub')}</span>
            </button>

            {/* User Profile & Auth Button */}
            {currentUser ? (
              currentUser.email.toLowerCase() === 'student.demo@example.com' ? (
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <div 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] sm:text-xs font-bold shadow-2xs cursor-pointer hover:bg-amber-500/30 transition shrink-0"
                    title="Using Demo Student account. Tap to switch account."
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">{t('demoAccount')}</span>
                    <span className="sm:hidden font-bold">Demo</span>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                    title="Sign In or Switch Account"
                  >
                    <LogIn className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{t('signIn')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl p-1 sm:pl-2.5 sm:pr-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 text-left">
                    <div className={`w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 ${
                      currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span className="max-w-[120px] truncate">{currentUser.name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-500/30 text-purple-300'
                            : 'bg-emerald-500/30 text-emerald-300'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Entered {currentUser.totalLogins || 1} times
                      </div>
                    </div>
                  </div>

                  {/* Switch User / Use other user */}
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="p-1 sm:px-2.5 sm:py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-700"
                    title="Switch user or log in with another account"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="hidden sm:inline">Use other user</span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    className="p-1 sm:px-2.5 sm:py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0"
                    title="Sign Out of your account"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t('signOut')}</span>
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="whitespace-nowrap">{t('signIn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Student Notice Banner */}
        {currentUser?.email.toLowerCase() === 'student.demo@example.com' && (
          <div className="bg-gradient-to-r from-blue-950/95 via-slate-900 to-indigo-950/95 border-t border-b border-blue-800/40 px-3 sm:px-6 py-1.5 text-xs text-slate-200 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Demo</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-300 truncate">
                {t('demoStudentNotice')}
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 sm:px-3 py-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              title="Sign in to your own account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{t('signIn')}</span>
              <ArrowRight className="w-3 h-3 hidden sm:inline" />
            </button>
          </div>
        )}

        {/* Header Tab Navigation Menu (Visible for desktop and phone users directly in header) */}
        <nav aria-label="Main Navigation" className="bg-slate-950/90 border-t border-slate-800/80 px-2 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{t('calendar')}</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{t('tasks')}</span>
              {monthPendingTasksCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full font-bold">
                  {monthPendingTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('jobs')} ({currentUserJobs.length})</span>
            </button>

            {/* Admin Portal Tab - ONLY VISIBLE TO ME / ADMIN */}
            {isMeOrAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-800/40'
                }`}
                title="Admin Portal (Only visible to you)"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>{t('adminPortal')}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/30 text-purple-200 rounded font-mono hidden sm:inline">
                  Owner
                </span>
              </button>
            )}

            {/* Inside Navi Border: 2026 (令和8年) Year Selector & Log Shift Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto pl-1 sm:pl-2">
              {/* Year Selector Button: 2026 (令和8年) */}
              <div className="relative shrink-0 flex items-center">
                <select
                  id="nav-year-select"
                  value={currentDate.getFullYear()}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value, 10);
                    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
                  }}
                  className="bg-slate-800/90 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 rounded-xl pl-2.5 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition shadow-2xs appearance-none"
                  title="Select Year (和暦)"
                  aria-label="Select Year"
                >
                  {YEARS_50.map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-white font-medium">
                      {y} ({getJapaneseEraName(y)})
                    </option>
                  ))}
                </select>
                <CalendarIcon className="w-3.5 h-3.5 text-amber-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Quick Action: Log Shift */}
              <button
                id="nav-log-shift-btn"
                onClick={() => openAddShift()}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95 cursor-pointer"
                title="Log Work Shift"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="whitespace-nowrap">{t('logShift')}</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-8 pb-8 sm:pb-10 flex-1 w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
        {/* Month Selector is rendered for both Monthly Dashboard and Calendar views */}
        {(activeTab === 'dashboard' || activeTab === 'calendar') && (
          <MonthPicker
            currentDate={currentDate}
            onChangeMonth={(newDate) => setCurrentDate(newDate)}
            onResetToday={() => setCurrentDate(new Date(2026, 8, 16))}
          />
        )}

        {/* Tab 1: Monthly Dashboard */}
        {activeTab === 'dashboard' && (
          <MonthlyDashboard
            currentDate={currentDate}
            shifts={currentUserShifts}
            tasks={currentUserTasks}
            jobs={currentUserJobs}
            onOpenAddShift={() => openAddShift()}
            onOpenAddTask={() => openAddTask()}
            onSwitchToCalendar={() => setActiveTab('calendar')}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
            weeklyLimit={weeklyLimit}
            onWeeklyLimitChange={handleWeeklyLimitChange}
          />
        )}

        {/* Tab 2: Calendar & Red Days View */}
        {activeTab === 'calendar' && (
          <CalendarView
            currentDate={currentDate}
            shifts={currentUserShifts}
            tasks={currentUserTasks}
            jobs={currentUserJobs}
            onOpenAddShiftForDate={(d) => openAddShift(d)}
            onOpenAddTaskForDate={(d) => openAddTask(d)}
            onEditShift={(shift) => openEditShift(shift)}
            onEditTask={(task) => openEditTask(task)}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        )}

        {/* Tab 3: Tasks & Deadlines */}
        {activeTab === 'tasks' && (
          <TasksListView
            tasks={currentUserTasks}
            onOpenAddTask={() => openAddTask()}
            onEditTask={(task) => openEditTask(task)}
            onToggleComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
            onToggleAlarm={handleToggleAlarm}
            onTriggerAlarmTest={handleTriggerAlarmTest}
          />
        )}

        {/* Tab 4: Workplaces (Jobs) */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Registered Part-Time Workplaces ({currentUserJobs.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage hourly wages, transit allowances, shift colors, and manager contacts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWorkTypesModalOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold border border-slate-300/80 transition flex items-center gap-1.5"
                  title="Edit and add custom work types / categories"
                >
                  <Settings2 className="w-4 h-4 text-blue-600" />
                  <span>Work Types (職種設定)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingJob(null);
                    setIsJobFormOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Workplace</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  placeholder="Search workplaces by name, station, category..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {uniqueCategories.length > 0 && (
                <select
                  value={jobSelectedCategory}
                  onChange={(e) => setJobSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Workplace Categories</option>
                  {uniqueCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Workplace Cards Grid */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={(j) => {
                      setEditingJob(j);
                      setIsJobFormOpen(true);
                    }}
                    onDelete={handleDeleteJob}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No workplaces match your search</p>
                <button
                  onClick={() => {
                    setJobSearchQuery('');
                    setJobSelectedCategory('all');
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Admin Portal (Restricted to 'me' / owner only) */}
        {activeTab === 'admin' && isMeOrAdmin && (
          <AdminDashboard
            currentUser={currentUser || users[0]}
            allUsers={users}
            allShifts={shifts}
            allJobs={jobs}
            allTasks={tasks}
            onSwitchUser={handleSwitchUser}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetUserPassword}
          />
        )}
      </main>

      {/* Workplace Modal Form */}
      {isJobFormOpen && (
        <JobForm
          isOpen={isJobFormOpen}
          onClose={() => {
            setIsJobFormOpen(false);
            setEditingJob(null);
          }}
          onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
          initialData={editingJob || undefined}
          workTypes={workTypes}
          onOpenManageTypes={() => setIsWorkTypesModalOpen(true)}
        />
      )}

      {/* Work Types Management Modal */}
      <WorkTypesModal
        isOpen={isWorkTypesModalOpen}
        onClose={() => setIsWorkTypesModalOpen(false)}
        onUpdateWorkTypes={(updated) => setWorkTypes(updated)}
      />

      {/* Shift Modal (supports 28h standard term vs 40h holiday permit with non-blocking warning) */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => {
          setIsShiftModalOpen(false);
          setEditingShift(null);
        }}
        onSave={handleSaveShift}
        initialDate={targetDateForShift}
        initialShift={editingShift}
        jobs={currentUserJobs}
        existingShifts={currentUserShifts}
        weeklyLimit={weeklyLimit}
        onWeeklyLimitChange={handleWeeklyLimitChange}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialDate={targetDateForTask}
        initialTask={editingTask}
        jobs={currentUserJobs}
      />

      {/* Ringing Task Alarm Overlay Modal */}
      <TaskAlarmModal
        task={activeAlarmTask}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onComplete={handleCompleteTaskFromAlarm}
      />

      {/* Auth / Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onResetPassword={handleResetUserPassword}
        users={users}
      />

      {/* App Instructions & Guide Modal */}
      <AppInstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap justify-center text-center sm:text-left">
            <span className="font-bold text-slate-800">BaitoMate (バイトメイト)</span>
            <span>•</span>
            <span>Japan Student Visa & 28h Tracker</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-slate-500 flex-wrap justify-center">
            <a
              href="https://yamin-1997.github.io/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition flex items-center gap-1 font-semibold text-slate-700 hover:underline"
              title="Creator Portfolio"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Portfolio</span>
            </a>
            <span>•</span>
            <button
              onClick={() => setIsInstructionsOpen(true)}
              className="hover:text-blue-600 transition flex items-center gap-1 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              App Instructions
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-blue-600 transition flex items-center gap-1 font-semibold"
            >
              <User className="w-3.5 h-3.5" />
              {currentUser ? `Account (${currentUser.name})` : 'Log In'}
            </button>
            <span>•</span>
            <button
              onClick={handleResetDefaults}
              className="hover:text-blue-600 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
