import { StudentTask, TaskAlarmSound } from '../types';

let audioCtx: AudioContext | null = null;
let activeAlarmInterval: ReturnType<typeof setInterval> | null = null;
let isCurrentlyRinging = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes a single note with attack and exponential decay
 */
function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainLevel = 0.3
) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (err) {
    console.warn('Error playing audio note', err);
  }
}

/**
 * Plays one pattern sequence of the selected alarm sound
 */
export function playAlarmSoundPattern(sound: TaskAlarmSound = 'chime') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (sound) {
      case 'digital': {
        // Double-beep pattern (Classic digital clock / Casio watch style)
        playNote(ctx, 2048, now + 0.00, 0.08, 'square', 0.15);
        playNote(ctx, 2048, now + 0.12, 0.08, 'square', 0.15);
        playNote(ctx, 2048, now + 0.30, 0.08, 'square', 0.15);
        playNote(ctx, 2048, now + 0.42, 0.08, 'square', 0.15);
        break;
      }

      case 'bell': {
        // Resonant brass bell strike with harmonics (Japanese school / station bell)
        playNote(ctx, 523.25, now + 0.00, 1.4, 'sine', 0.4); // C5 fundamental
        playNote(ctx, 1046.5, now + 0.02, 1.1, 'sine', 0.2); // C6 overtone
        playNote(ctx, 1567.98, now + 0.04, 0.8, 'triangle', 0.1); // G6 harmonic
        // Second echoing chime
        playNote(ctx, 659.25, now + 0.50, 1.2, 'sine', 0.35); // E5
        playNote(ctx, 1318.5, now + 0.52, 0.9, 'sine', 0.18); // E6
        break;
      }

      case 'marimba': {
        // Upbeat Japanese train-departure / cheerful melodic arpeggio
        playNote(ctx, 523.25, now + 0.00, 0.25, 'triangle', 0.35); // C5
        playNote(ctx, 659.25, now + 0.12, 0.25, 'triangle', 0.35); // E5
        playNote(ctx, 783.99, now + 0.24, 0.25, 'triangle', 0.35); // G5
        playNote(ctx, 1046.5, now + 0.36, 0.55, 'triangle', 0.40); // C6
        playNote(ctx, 880.00, now + 0.60, 0.45, 'triangle', 0.30); // A5
        playNote(ctx, 1046.5, now + 0.80, 0.70, 'sine', 0.45);     // C6 long
        break;
      }

      case 'chime':
      default: {
        // Soothing modern crystal chime (E5 -> G#5 -> B5)
        playNote(ctx, 659.25, now + 0.00, 0.65, 'sine', 0.35);
        playNote(ctx, 830.61, now + 0.15, 0.65, 'sine', 0.35);
        playNote(ctx, 987.77, now + 0.30, 0.95, 'sine', 0.40);
        playNote(ctx, 1318.5, now + 0.50, 1.10, 'sine', 0.30);
        break;
      }
    }
  } catch (err) {
    console.warn('Unable to play alarm pattern', err);
  }
}

/**
 * Starts looping alarm sound until stopped
 */
export function startAlarmLoop(sound: TaskAlarmSound = 'chime') {
  stopAlarmLoop();
  isCurrentlyRinging = true;

  // Play immediately
  playAlarmSoundPattern(sound);
  triggerHapticVibrate();

  // Loop every 2 seconds
  activeAlarmInterval = setInterval(() => {
    if (isCurrentlyRinging) {
      playAlarmSoundPattern(sound);
      triggerHapticVibrate();
    }
  }, 2200);
}

/**
 * Stops any actively ringing alarm
 */
export function stopAlarmLoop() {
  isCurrentlyRinging = false;
  if (activeAlarmInterval) {
    clearInterval(activeAlarmInterval);
    activeAlarmInterval = null;
  }
}

/**
 * Check if the alarm is currently ringing
 */
export function getIsAlarmRinging(): boolean {
  return isCurrentlyRinging;
}

/**
 * Preview sound once without looping
 */
export function previewAlarmSound(sound: TaskAlarmSound = 'chime') {
  playAlarmSoundPattern(sound);
  triggerHapticVibrate();
}

/**
 * Trigger mobile haptic vibration if supported
 */
export function triggerHapticVibrate() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([250, 100, 250]);
    }
  } catch {
    // Ignore vibration failures
  }
}

/**
 * Request native desktop browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'default';
  }
}

/**
 * Send native desktop browser notification for a task
 */
export function sendTaskAlarmNotification(task: StudentTask) {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const title = `⏰ Task Alarm: ${task.title}`;
      const timeStr = task.time ? `due at ${task.time}` : 'due today';
      const body = `Category: ${task.category.toUpperCase()} • ${timeStr}${task.notes ? `\n"${task.notes}"` : ''}`;
      
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `task-alarm-${task.id}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
  } catch (err) {
    console.warn('Could not display native notification', err);
  }
}

/**
 * Calculates the exact trigger timestamp (in ms) for a task's alarm
 */
export function getTaskAlarmTriggerTime(task: StudentTask): number | null {
  if (!task.date) return null;

  const [y, m, d] = task.date.split('-').map(Number);
  if (!y || !m || !d) return null;

  let hours = 9; // default 9:00 AM if no time specified
  let minutes = 0;

  if (task.time && task.time.includes(':')) {
    const [h, min] = task.time.split(':').map(Number);
    if (!isNaN(h)) hours = h;
    if (!isNaN(min)) minutes = min;
  }

  const taskDate = new Date(y, m - 1, d, hours, minutes, 0, 0);
  const offsetMinutes = task.alarmOffsetMinutes || 0;
  return taskDate.getTime() - offsetMinutes * 60 * 1000;
}

/**
 * Checks if a task's alarm should trigger right now
 */
export function isTaskAlarmDue(task: StudentTask, now: Date = new Date()): boolean {
  // If task is completed, don't ring
  if (task.completed) return false;

  // If alarm is explicitly disabled, don't ring
  // By default, if task has a time set and alarmEnabled is not false, we enable alarm
  const isEnabled = task.alarmEnabled !== false && !!task.time;
  if (!isEnabled) return false;

  const nowMs = now.getTime();

  // Check if alarm was snoozed
  if (task.alarmSnoozedUntil) {
    const snoozedUntilMs = new Date(task.alarmSnoozedUntil).getTime();
    if (nowMs >= snoozedUntilMs) {
      return true;
    }
    // Snooze time hasn't arrived yet
    return false;
  }

  const triggerTimeMs = getTaskAlarmTriggerTime(task);
  if (!triggerTimeMs) return false;

  // Check if alarm was already dismissed after the trigger time
  if (task.alarmDismissedAt) {
    const dismissedAtMs = new Date(task.alarmDismissedAt).getTime();
    if (dismissedAtMs >= triggerTimeMs) {
      return false;
    }
  }

  // Ring if current time is within or past the trigger time
  // But avoid ringing for tasks from days long ago (e.g. older than 24 hours)
  const isPastTrigger = nowMs >= triggerTimeMs;
  const isNotAncient = (nowMs - triggerTimeMs) < 24 * 60 * 60 * 1000;

  return isPastTrigger && isNotAncient;
}

export const ALARM_SOUND_OPTIONS: { id: TaskAlarmSound; name: string; desc: string }[] = [
  { id: 'chime', name: 'Crystal Chime', desc: 'Melodic, pleasant bell triad' },
  { id: 'digital', name: 'Digital Watch', desc: 'Classic Casio style double beep' },
  { id: 'bell', name: 'School Bell', desc: 'Resonant bronze bell chime' },
  { id: 'marimba', name: 'Station Jingle', desc: 'Upbeat Tokyo station melody' },
];

export const ALARM_OFFSET_OPTIONS = [
  { minutes: 0, label: 'At time of task (定刻)' },
  { minutes: 5, label: '5 minutes before (5分前)' },
  { minutes: 15, label: '15 minutes before (15分前)' },
  { minutes: 30, label: '30 minutes before (30分前)' },
  { minutes: 60, label: '1 hour before (1時間前)' },
];
