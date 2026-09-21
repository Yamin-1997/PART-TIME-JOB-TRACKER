import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  AlertCircle,
  Flag,
  Briefcase,
  GraduationCap,
  FileText,
  User,
  Bell,
  BellOff,
  BellRing,
  Volume2,
  Edit2
} from 'lucide-react';
import { StudentTask } from '../types';
import { ALARM_OFFSET_OPTIONS, ALARM_SOUND_OPTIONS } from '../utils/taskAlarmAudio';
import { useLanguage } from '../utils/LanguageContext';

interface TasksListViewProps {
  tasks: StudentTask[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onEditTask?: (task: StudentTask) => void;
  onToggleAlarm?: (taskId: string) => void;
  onTriggerAlarmTest?: (task: StudentTask) => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onOpenAddTask,
  onEditTask,
  onToggleAlarm,
  onTriggerAlarmTest,
}) => {
  const { t } = useLanguage();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !task.completed) ||
      (filterStatus === 'completed' && task.completed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'work':
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      case 'school':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'visa':
        return <FileText className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <User className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'work':
        return t('categoryWork');
      case 'school':
        return t('categorySchool');
      case 'visa':
        return t('categoryVisa');
      default:
        return t('categoryPersonal');
    }
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const activeAlarmsCount = tasks.filter((t) => !t.completed && t.alarmEnabled !== false && !!t.time).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900">
              {t('tasksAndReminders')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full">
              {t('pendingBadge').replace('{count}', pendingCount.toString())}
            </span>
            <span className="text-xs px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full flex items-center gap-1">
              <Bell className="w-3 h-3 text-rose-600" />
              <span>{t('alarmsActiveBadge').replace('{count}', activeAlarmsCount.toString())}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('tasksSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('addNewTaskBtn')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchTasks')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="all">{t('allCategories')}</option>
            <option value="work">💼 {t('categoryWork')}</option>
            <option value="school">📚 {t('categorySchool')}</option>
            <option value="visa">🛂 {t('categoryVisa')}</option>
            <option value="personal">🏠 {t('categoryPersonal')}</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="all">{t('allStatus')}</option>
            <option value="pending">{t('pendingOnly')}</option>
            <option value="completed">{t('completedOnly')}</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const hasAlarm = task.alarmEnabled !== false && !!task.time;
            const offsetLabel = ALARM_OFFSET_OPTIONS.find(o => o.minutes === (task.alarmOffsetMinutes || 0))?.label.split('(')[0].trim() || 'At time';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                  task.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-sm hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0 cursor-pointer"
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 
                        onClick={() => onEditTask?.(task)}
                        className={`text-sm font-bold leading-tight cursor-pointer hover:text-blue-600 transition ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {onEditTask && (
                        <button
                          onClick={() => onEditTask(task)}
                          className="text-slate-400 hover:text-blue-600 transition text-xs p-0.5 cursor-pointer"
                          title={t('clickToEdit')}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {getCategoryIcon(task.category)}
                        <span>{getCategoryLabel(task.category)}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {task.date}
                      </span>

                      {task.time && (
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.time}
                        </span>
                      )}

                      {/* Alarm Indicator & Controls */}
                      {task.time && (
                        <div className="flex items-center gap-1.5">
                          {hasAlarm ? (
                            <button
                              onClick={() => onToggleAlarm?.(task.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[10px] font-bold transition cursor-pointer"
                              title={`${t('alarmActive')} (${offsetLabel})`}
                            >
                              <Bell className="w-3 h-3 text-rose-600 animate-pulse" />
                              <span>{t('alarm')}: {task.time} ({offsetLabel})</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleAlarm?.(task.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 text-[10px] font-medium transition cursor-pointer"
                              title={t('alarmOff')}
                            >
                              <BellOff className="w-3 h-3 text-slate-400" />
                              <span>{t('alarmOff')}</span>
                            </button>
                          )}

                          {onTriggerAlarmTest && !task.completed && (
                            <button
                              onClick={() => onTriggerAlarmTest(task)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition active:scale-95 cursor-pointer"
                              title={t('testAlarm')}
                            >
                              <Volume2 className="w-3 h-3 text-amber-600" />
                              <span>{t('testAlarm')}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {task.priority === 'high' && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded">
                          {t('priorityHigh')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">{t('noTasksFound')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('createFirstTask')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

