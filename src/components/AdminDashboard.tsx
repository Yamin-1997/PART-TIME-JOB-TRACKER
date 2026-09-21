import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Search, 
  Calendar, 
  School, 
  Eye, 
  LogIn, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Filter, 
  X,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Download,
  Trash2,
  KeyRound,
  UserX,
  AlertCircle
} from 'lucide-react';
import { UserAccount, Shift, PartTimeJob, StudentTask } from '../types';

interface AdminDashboardProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  allShifts: Shift[];
  allJobs: PartTimeJob[];
  allTasks: StudentTask[];
  onSwitchUser: (user: UserAccount) => void;
  onOpenAddShiftForUser?: (user: UserAccount) => void;
  onDeleteUser?: (user: UserAccount) => void;
  onResetPassword?: (user: UserAccount, newPassword?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allUsers,
  allShifts,
  allJobs,
  allTasks,
  onSwitchUser,
  onDeleteUser,
  onResetPassword,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'safe' | 'overlimit'>('all');
  const [selectedUserForInspection, setSelectedUserForInspection] = useState<UserAccount | null>(null);

  // Deletion & Password Reset state
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [userToReset, setUserToReset] = useState<UserAccount | null>(null);
  const [resetPassValue, setResetPassValue] = useState('password123');

  // Platform Analytics: How many users use this app
  const totalUsersCount = allUsers.length;
  const studentUsersCount = allUsers.filter((u) => u.role === 'student').length;
  const adminUsersCount = allUsers.filter((u) => u.role === 'admin').length;
  const totalShiftsLogged = allShifts.length;
  const totalHoursLogged = allShifts.reduce((sum, s) => sum + s.hoursWorked, 0);

  // Helper to calculate a user's recent week hours (current week of Sep 14-20, 2026)
  const getUserWeekHours = (userId: string) => {
    // Week Sep 14 - Sep 20
    const userShifts = allShifts.filter((s) => (s.userId ? s.userId === userId : userId === 'user-1'));
    const weekShifts = userShifts.filter((s) => s.date >= '2026-09-14' && s.date <= '2026-09-20');
    return weekShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
  };

  const getUserTotalShifts = (userId: string) => {
    return allShifts.filter((s) => (s.userId ? s.userId === userId : userId === 'user-1')).length;
  };

  const getUserTotalHours = (userId: string) => {
    return allShifts
      .filter((s) => (s.userId ? s.userId === userId : userId === 'user-1'))
      .reduce((sum, s) => sum + s.hoursWorked, 0);
  };

  // Filter users
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.schoolOrUniversity && user.schoolOrUniversity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const weekHours = getUserWeekHours(user.id);
    const matchesCompliance = 
      complianceFilter === 'all' ||
      (complianceFilter === 'safe' && weekHours <= 28.0) ||
      (complianceFilter === 'overlimit' && weekHours > 28.0);

    return matchesSearch && matchesRole && matchesCompliance;
  });

  const studentsOverLimitCount = allUsers.filter(
    (u) => u.role === 'student' && getUserWeekHours(u.id) > 28.0
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-black uppercase tracking-wider border border-purple-500/30">
              Admin & School Portal
            </span>
            <span className="text-xs text-slate-400">Institutional Oversight</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            User Directory & 28-Hour Immigration Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.email}). Monitoring active international students and visa compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Total App Users
            </div>
            <div className="text-xl font-black text-white font-mono">
              {totalUsersCount} Registered
            </div>
          </div>
        </div>
      </div>

      {/* High-Level Metric Cards: How many users use this app */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total App Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              How Many Users Use This App
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalUsersCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">active users</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{studentUsersCount} Students</span>
            <span>{adminUsersCount} Admins</span>
          </div>
        </div>

        {/* Total Shifts Logged Across Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Shifts Recorded
            </span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalShiftsLogged}
            <span className="text-xs font-normal text-slate-500 ml-1.5">shifts</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Across {allJobs.length} student workplaces
          </div>
        </div>

        {/* Total Hours Worked Platform-wide */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Hours Logged
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalHoursLogged.toFixed(1)}
            <span className="text-xs font-normal text-slate-500 ml-1.5">hrs</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Average {(totalHoursLogged / (totalUsersCount || 1)).toFixed(1)}h per user
          </div>
        </div>

        {/* 28-Hour Overtime Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Over 28h Violations
            </span>
            <AlertTriangle className={`w-4 h-4 ${studentsOverLimitCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
          </div>
          <div className={`text-3xl font-black font-mono ${studentsOverLimitCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {studentsOverLimitCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">students</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {studentsOverLimitCount > 0 
              ? '⚠️ Requires immigration warning check'
              : 'All active students are compliant'}
          </div>
        </div>
      </div>

      {/* User Directory Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-5 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>All Registered Users Directory ({filteredUsers.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect how many times each user entered the app, their school, total hours, and compliance status.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, or school..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Filter by Role */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="admin">Admins Only</option>
            </select>

            {/* Filter by Compliance */}
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Compliance Statuses</option>
              <option value="safe">Safe (≤ 28h/week)</option>
              <option value="overlimit">⚠️ Over 28h Exceeded</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">School / Institution</th>
                <th className="py-3 px-4">App Usage (Logins)</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Total Shifts</th>
                <th className="py-3 px-4">Current Week (Sep 14-20)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const weekHours = getUserWeekHours(user.id);
                const isOver = weekHours > 28.0;
                const shiftsCount = getUserTotalShifts(user.id);
                const totalHours = getUserTotalHours(user.id);

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.id === currentUser.id && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-mono px-1.5 py-0.2 rounded">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {user.schoolOrUniversity || <span className="text-slate-400 italic">Not specified</span>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">
                        {user.totalLogins} times
                      </div>
                      <div className="text-[10px] text-slate-400">Entered app</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">
                        {shiftsCount} shifts
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {totalHours.toFixed(1)}h total
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {user.role === 'student' ? (
                        <div>
                          <div className="flex items-center gap-1.5 font-bold font-mono">
                            <span className={isOver ? 'text-rose-600' : 'text-slate-900'}>
                              {weekHours.toFixed(1)}h
                            </span>
                            <span className="text-slate-400 text-[10px]">/ 28h</span>
                          </div>
                          {isOver ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Over by {(weekHours - 28).toFixed(1)}h
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Safe Limit
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserForInspection(user)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition flex items-center gap-1"
                          title="Inspect user details and shifts"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Inspect</span>
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => {
                            setUserToReset(user);
                            setResetPassValue('password123');
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium text-xs transition flex items-center gap-1"
                          title="Reset user password if forgotten or entered incorrectly"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Reset Pass</span>
                        </button>

                        {/* Delete Email / Account Button ("User can do one more") */}
                        {user.email.toLowerCase() !== 'yaminei67611@gmail.com' ? (
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium text-xs transition flex items-center gap-1"
                            title="Delete email so user can register fresh ('do one more')"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span className="hidden xl:inline">Delete Email</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono px-1">Owner</span>
                        )}

                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => onSwitchUser(user)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-xs transition flex items-center gap-1"
                            title="Simulate / Switch into this user's view"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">View As</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Inspector Modal */}
      {selectedUserForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  {selectedUserForInspection.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedUserForInspection.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUserForInspection.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForInspection(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Profile Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Role</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedUserForInspection.role}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Logins Count</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedUserForInspection.totalLogins} times</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Visa Expiry</span>
                  <span className="font-bold text-slate-900">{selectedUserForInspection.visaExpiryDate || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Institution</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {selectedUserForInspection.schoolOrUniversity || 'General'}
                  </span>
                </div>
              </div>

              {/* Password & Account Recovery Admin Actions */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Forgotten Password / Wrong Pass Recovery</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Current Password: <span className="font-mono font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">{selectedUserForInspection.password || 'password123'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setUserToReset(selectedUserForInspection);
                      setResetPassValue('password123');
                    }}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-xs transition flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Password</span>
                  </button>
                  {selectedUserForInspection.email.toLowerCase() !== 'yaminei67611@gmail.com' && (
                    <button
                      onClick={() => {
                        setUserToDelete(selectedUserForInspection);
                      }}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-bold text-xs transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Email (Do One More)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Shift records for this user */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Shift Records ({allShifts.filter((s) => (s.userId ? s.userId === selectedUserForInspection.id : selectedUserForInspection.id === 'user-1')).length})</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Total Hours: {getUserTotalHours(selectedUserForInspection.id).toFixed(1)} hrs
                  </span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {allShifts
                    .filter((s) => (s.userId ? s.userId === selectedUserForInspection.id : selectedUserForInspection.id === 'user-1'))
                    .map((shift) => (
                      <div key={shift.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">{shift.jobName}</div>
                          <div className="text-[11px] text-slate-500">
                            {shift.date} • {shift.startTime} - {shift.endTime} (Break: {shift.breakMinutes}m)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-slate-900">{shift.hoursWorked}h</div>
                          <div className="text-[11px] text-emerald-600 font-mono">¥{shift.grossPay.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">User ID: {selectedUserForInspection.id}</span>
              <button
                onClick={() => {
                  onSwitchUser(selectedUserForInspection);
                  setSelectedUserForInspection(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Switch View to {selectedUserForInspection.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Email / Account ("User can do one more") */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete User Email Account?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  When a user forgets their password or enters the wrong password, deleting their email allows them to register again fresh.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-rose-900 flex items-center justify-between">
                <span>Target User:</span>
                <span className="font-mono text-slate-800">{userToDelete.name}</span>
              </div>
              <div className="font-bold text-rose-900 flex items-center justify-between">
                <span>Email Address:</span>
                <span className="font-mono text-slate-800">{userToDelete.email}</span>
              </div>
              <p className="text-[11px] text-rose-700 pt-1 border-t border-rose-200">
                ✅ Once deleted, the email <strong>{userToDelete.email}</strong> is completely released from the database so the user can register again ("do one more").
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteUser) {
                    onDeleteUser(userToDelete);
                  }
                  if (selectedUserForInspection?.id === userToDelete.id) {
                    setSelectedUserForInspection(null);
                  }
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Email (Allow Re-register)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset User Password */}
      {userToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Password for User
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reset the password for <strong>{userToReset.name}</strong> ({userToReset.email}) so they can log back into BaitoMate.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={resetPassValue}
                  onChange={(e) => setResetPassValue(e.target.value)}
                  placeholder="Enter new password (e.g. password123)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassValue('password123')}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >
                  Set to "password123"
                </button>
                <button
                  type="button"
                  onClick={() => setResetPassValue('student2026')}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >
                  Set to "student2026"
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToReset(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetPassword && resetPassValue.trim()) {
                    onResetPassword(userToReset, resetPassValue.trim());
                  }
                  setUserToReset(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>Save New Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
