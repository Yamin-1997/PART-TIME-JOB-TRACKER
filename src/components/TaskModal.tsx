import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  Flag, 
  Building2, 
  FileText,
  AlertCircle,
  Bell,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { StudentTask, PartTimeJob, TaskAlarmSound } from '../types';
import { 
  ALARM_SOUND_OPTIONS, 
  ALARM_OFFSET_OPTIONS, 
  previewAlarmSound, 
  requestNotificationPermission 
} from '../utils/taskAlarmAudio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<StudentTask, 'id' | 'createdAt'>) => void;
  initialDate?: string;
  initialTask?: StudentTask | null;
  jobs: PartTimeJob[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTask,
  jobs,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<'work' | 'school' | 'visa' | 'personal'>('work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [jobId, setJobId] = useState('');
  const [notes, setNotes] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmOffsetMinutes, setAlarmOffsetMinutes] = useState<number>(0);
  const [alarmSound, setAlarmSound] = useState<TaskAlarmSound>('chime');
  const [error, setError] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDate(initialTask.date);
      setTime(initialTask.time || '');
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setJobId(initialTask.jobId || '');
      setNotes(initialTask.notes || '');
      setAlarmEnabled(initialTask.alarmEnabled !== false);
      setAlarmOffsetMinutes(initialTask.alarmOffsetMinutes ?? 0);
      setAlarmSound(initialTask.alarmSound || 'chime');
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTime('');
      setCategory('work');
      setPriority('medium');
      setJobId(jobs[0]?.id || '');
      setNotes('');
      setAlarmEnabled(true);
      setAlarmOffsetMinutes(0);
      setAlarmSound('chime');
    }
    setError('');
  }, [initialTask, initialDate, isOpen, jobs]);

  if (!isOpen) return null;

  const handleTestSound = (soundToTest: TaskAlarmSound) => {
    setIsPlayingPreview(true);
    previewAlarmSound(soundToTest);
    // Request notification permission if not yet decided
    requestNotificationPermission();
    setTimeout(() => setIsPlayingPreview(false), 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    onSave({
      title: title.trim(),
      date,
      time: time || undefined,
      category,
      priority,
      jobId: jobId || undefined,
      notes: notes.trim() || undefined,
      completed: initialTask ? initialTask.completed : false,
      alarmEnabled: alarmEnabled && !!time,
      alarmOffsetMinutes,
      alarmSound,
      alarmDismissedAt: initialTask?.alarmDismissedAt,
      alarmSnoozedUntil: initialTask?.alarmSnoozedUntil,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialTask ? 'Edit Task / Reminder' : 'Add Task / Reminder'}
              </h3>
              <p className="text-xs text-slate-500">Track study deadlines, shift submissions & visa events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Submit next month shift availability to Tencho"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Time (Optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm bg-white"
              >
                <option value="work">💼 Part-Time Work (Baito)</option>
                <option value="school">📚 Language School / Uni</option>
                <option value="visa">🛂 Visa / Immigration</option>
                <option value="personal">🏠 Living / Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm bg-white"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority (Urgent)</option>
              </select>
            </div>
          </div>

          {category === 'work' && jobs.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Related Workplace (Optional)
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm bg-white"
              >
                <option value="">General Work Task</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Alarm & Audio Reminder Settings */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">Task Alarm & Audio Chime</span>
                  <p className="text-[11px] text-slate-500">Play sound & alert when this task is due</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alarmEnabled}
                  onChange={(e) => setAlarmEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {alarmEnabled ? (
              <div className="space-y-2.5 pt-1 border-t border-slate-200/80">
                {!time && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Please specify a <strong>Time</strong> above so the alarm knows when to ring.</span>
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Alarm Ring Time
                    </label>
                    <select
                      value={alarmOffsetMinutes}
                      onChange={(e) => setAlarmOffsetMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-rose-500"
                    >
                      {ALARM_OFFSET_OPTIONS.map((opt) => (
                        <option key={opt.minutes} value={opt.minutes}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Alarm Tone & Sound
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={alarmSound}
                        onChange={(e) => setAlarmSound(e.target.value as TaskAlarmSound)}
                        className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-rose-500"
                      >
                        {ALARM_SOUND_OPTIONS.map((snd) => (
                          <option key={snd.id} value={snd.id}>
                            {snd.name} ({snd.desc})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleTestSound(alarmSound)}
                        className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0 active:scale-95"
                        title="Preview this alarm tone"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlayingPreview ? 'animate-pulse text-rose-600' : ''}`} />
                        <span>{isPlayingPreview ? 'Playing...' : 'Test'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Synthesized Web Audio (Zero lag, works offline)</span>
                  <button
                    type="button"
                    onClick={() => requestNotificationPermission()}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Allow Browser Notifications
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Alarm is muted for this task. Turn on toggle to receive audio & notification alarms.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Notes & Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring residence card and ¥4000 certificate stamp"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              {initialTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
