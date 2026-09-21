import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  X, 
  AlertCircle,
  Briefcase,
  GraduationCap,
  FileText,
  User,
  Sparkles
} from 'lucide-react';
import { StudentTask } from '../types';
import { startAlarmLoop, stopAlarmLoop, ALARM_SOUND_OPTIONS } from '../utils/taskAlarmAudio';

interface TaskAlarmModalProps {
  task: StudentTask | null;
  onDismiss: (task: StudentTask) => void;
  onSnooze: (task: StudentTask, minutes: number) => void;
  onComplete: (task: StudentTask) => void;
}

export const TaskAlarmModal: React.FC<TaskAlarmModalProps> = ({
  task,
  onDismiss,
  onSnooze,
  onComplete,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (task) {
      setIsMuted(false);
      startAlarmLoop(task.alarmSound || 'chime');
    } else {
      stopAlarmLoop();
    }

    return () => {
      stopAlarmLoop();
    };
  }, [task]);

  if (!task) return null;

  const handleToggleMute = () => {
    if (isMuted) {
      startAlarmLoop(task.alarmSound || 'chime');
      setIsMuted(false);
    } else {
      stopAlarmLoop();
      setIsMuted(true);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'school':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'visa':
        return <FileText className="w-4 h-4 text-rose-600" />;
      default:
        return <User className="w-4 h-4 text-purple-600" />;
    }
  };

  const soundName = ALARM_SOUND_OPTIONS.find(s => s.id === task.alarmSound)?.name || 'Crystal Chime';

  return (
    <AnimatePresence>
      <div 
        id="task-alarm-active-modal"
        role="alertdialog"
        aria-labelledby="alarm-task-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-400 overflow-hidden relative"
        >
          {/* Top pulse banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

          {/* Sound & Mute Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-rose-600 flex items-center gap-1.5">
                <BellRing className="w-4 h-4 animate-bounce" />
                Task Alarm Ringing! (アラーム)
              </span>
            </div>

            <button
              onClick={handleToggleMute}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
              title={isMuted ? 'Resume audio alarm' : 'Mute alarm sound'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Mute Sound</span>
                </>
              )}
            </button>
          </div>

          {/* Center Alarm Icon with Sound Waves */}
          <div className="py-4 text-center space-y-2">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-full bg-rose-100 border-4 border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-inner">
                <Bell className="w-10 h-10 animate-[wiggle_1s_ease-in-out_infinite]" />
              </div>
              {!isMuted && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.45s]"></span>
                  <span className="w-1 h-6 bg-rose-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                </div>
              )}
            </div>

            <h2 id="alarm-task-title" className="text-xl font-extrabold text-slate-900 leading-tight px-2">
              {task.title}
            </h2>

            <div className="flex items-center justify-center flex-wrap gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {getCategoryIcon(task.category)}
                <span className="capitalize">{task.category}</span>
              </span>

              {task.time && (
                <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.time}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.date}</span>
              </span>

              {task.priority === 'high' && (
                <span className="px-2 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg">
                  Urgent Priority
                </span>
              )}
            </div>

            {task.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left mt-3">
                <div className="font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Details & Notes:</span>
                </div>
                <p className="leading-relaxed">{task.notes}</p>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Tone: <span className="font-semibold text-slate-600">{soundName}</span> • Japan Student Task Alarm
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onComplete(task)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Task Completed & Stop</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSnooze(task, 5)}
                className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Snooze (5 min)</span>
              </button>

              <button
                onClick={() => onSnooze(task, 15)}
                className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Snooze (15 min)</span>
              </button>
            </div>

            <button
              onClick={() => onDismiss(task)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Dismiss Alarm (Done for now)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
