import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Scale, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  School, 
  UserCheck, 
  Coins,
  FileText,
  Cloud,
  Globe,
  Terminal
} from 'lucide-react';

interface AppInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInstructionsModal: React.FC<AppInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'law28' | 'reddays' | 'overlimit' | 'admin' | 'cloudflare'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">BaitoMate User Guide & Instructions</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded border border-blue-400/30">
                  Official Manual
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete guide to shift tracking, Japan's 28-hour student visa rule, and Red Days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs within Instructions */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 overflow-x-auto flex gap-2">
          <button
            onClick={() => setActiveSection('quickstart')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              activeSection === 'quickstart'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. How to Use BaitoMate</span>
          </button>

          <button
            onClick={() => setActiveSection('law28')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              activeSection === 'law28'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>2. The 28-Hour Rule (Article 19)</span>
          </button>

          <button
            onClick={() => setActiveSection('overlimit')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              activeSection === 'overlimit'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Logging Over 28 Hours</span>
          </button>

          <button
            onClick={() => setActiveSection('reddays')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              activeSection === 'reddays'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>4. Japanese Red Days (祝日)</span>
          </button>

          <button
            onClick={() => setActiveSection('admin')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              activeSection === 'admin'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>5. Login, Accounts & Admin</span>
          </button>

          <button
            onClick={() => setActiveSection('cloudflare')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              activeSection === 'cloudflare'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-orange-500" />
            <span>6. Cloudflare Deployment (.cloudflare.com)</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700">
          {/* Section 1: Quickstart */}
          {activeSection === 'quickstart' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>How to Use BaitoMate for Daily Shift Tracking</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step-by-step instructions to keep your part-time jobs organized and legally safe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Register Your Workplaces (Baito)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Navigate to <strong>Workplaces</strong> and click <em>+ Add Workplace</em>. Enter your hourly wage (e.g. ¥1,200/hr), daily transit reimbursement (e.g. ¥440), manager name, and a workplace theme color.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                    Log or Schedule Shifts
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click <strong>Log Shift</strong> anytime or click on any date in the <strong>Calendar</strong>. Select the start and end times, plus unpaid break minutes. The app automatically computes net work hours and gross wages.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Mandatory Japanese Break Deductions
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under Japanese Labor Standards Act (Article 34): If you work over 6 hours, employers must give at least 45 minutes of break. Over 8 hours requires at least 60 minutes. Enter your break in minutes so only net working hours count towards your 28-hour limit.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
                    Track Tasks & Visa Deadlines
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Use <strong>Tasks & Deadlines</strong> to set reminders for shift submissions (usually required by the 15th-20th of each month), tuition deadlines, and immigration visa renewals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Law 28 */}
          {activeSection === 'law28' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span>The 28-Hour Immigration Rule (Article 19 資格外活動許可)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Critical legal information every international student in Japan must know.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 text-blue-950 text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  What is the 28-Hour Rule?
                </div>
                <p className="leading-relaxed">
                  Foreign nationals holding a <strong>Student Visa (留学ビザ)</strong> are permitted to enter Japan primarily to study. Under Article 19 of the Immigration Control and Refugee Recognition Act, students who obtain <em>Permission to Engage in Activity other than that Permitted</em> (資格外活動許可) may work part-time up to a strict maximum of <strong>28 hours per week</strong>.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900">1. All Employers are Combined</span>
                  <p className="text-slate-600">
                    The 28-hour limit applies to your <strong>total combined hours across all workplaces</strong>. If you work 15 hours at a convenience store and 14 hours at a cafe, your total is 29 hours. This is an immigration violation even though each individual job was under 28 hours.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900">2. Week Calculation (Monday to Sunday)</span>
                  <p className="text-slate-600">
                    Japan's Immigration Services Agency inspects work hours in <strong>calendar weeks (Monday 00:00 to Sunday 23:59)</strong>. BaitoMate groups shifts by these exact weekly boundaries.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900">3. Long University Vacation Exception (長期休業期間)</span>
                  <p className="text-slate-600">
                    During official long holidays designated by the school's regulations (e.g. Summer Vacation, Spring Break, Winter Break), students are legally authorized to work up to <strong>8 hours per day and 40 hours per week</strong>, provided they obtain an official vacation certificate from their school (在学・長期休業証明書).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Logging Over 28 Hours */}
          {activeSection === 'overlimit' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Logging Over 28 Hours & The Warning Message</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How BaitoMate handles overtime, transparent shift logs, and alert messages.
                </p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-900">
                <div className="font-bold text-sm text-rose-950 flex items-center gap-2">
                  <span>Why Does BaitoMate Allow Adding Over 28 Hours?</span>
                </div>
                <p className="leading-relaxed">
                  Unlike rigid apps that block users, BaitoMate gives you full freedom to log your actual hours. For instance, you may be in an <strong>authorized university vacation week (where 40h is legal)</strong>, or you need to record overtime accurately for payroll.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-slate-900">The Over-Limit Warning Flow:</div>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                  <li>
                    When logging a shift that pushes your weekly total past <strong>28.0 hours</strong>, a red warning banner appears immediately in the shift form displaying your projected weekly total and the exact excess hours.
                  </li>
                  <li>
                    When you click <strong>Save Shift</strong>, an <strong>Immigration Over-Limit Alert Modal</strong> pops up with legal notices and the option to declare if it falls under an official school vacation.
                  </li>
                  <li>
                    Once confirmed, the shift is saved and highlighted across the calendar and dashboard with a <strong>⚠️ Over 28h Week</strong> warning badge so you can monitor your legal risk.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Section 4: Red Days */}
          {activeSection === 'reddays' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Japanese Red Days (国民の祝日・赤日)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Understanding Japan's national holidays and holiday shift wage benefits.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                  <span>What are "Red Days" in Japan?</span>
                </div>
                <p className="leading-relaxed">
                  In Japan, Sundays and official national holidays designated by the Cabinet Office (内閣府) are traditionally printed in red ink on wall calendars, earning them the common nickname <strong>赤日 (Akabi - Red Days)</strong>. On these days, universities, language schools, and government offices are closed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900">Higher Shift Availability</span>
                  <p className="text-slate-600">
                    Because school classes are cancelled on Red Days, students frequently schedule daytime shifts without academic conflicts.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900">Holiday Shift Pay Premiums</span>
                  <p className="text-slate-600">
                    Many Japanese retail and dining employers provide special holiday allowances (祝日手当) or +25% late-night rates after 22:00.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Admin & Accounts */}
          {activeSection === 'admin' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>Login, "Remember Me" & The Admin User Dashboard</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage login sessions and view platform-wide user analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Enter Many Times (Remember Me)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Check the <strong>Remember Me</strong> option when logging in. Your credentials and session are securely saved in your browser, allowing you to log in repeatedly with a single click and keep track of your login counter.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Admin Oversight & User Counts
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Administrators (such as school advisors or supervisors) have access to the <strong>Admin Portal</strong>, showing exactly how many users use BaitoMate, user directories, login frequencies, and student compliance statuses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Cloudflare Deployment (.cloudflare.com) */}
          {activeSection === 'cloudflare' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-wide border border-orange-200">
                    Production Ready
                  </span>
                  <span className="text-xs text-slate-500">dash.cloudflare.com</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <Cloud className="w-5 h-5 text-orange-500" />
                  <span>Deploying to Cloudflare (Pages & .cloudflare.com)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  BaitoMate is 100% pre-configured for instant zero-config deployment on Cloudflare Pages and custom domains on Cloudflare.
                </p>
              </div>

              {/* Pre-configured features card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl">
                  <div className="font-bold text-orange-950 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>SPA _redirects</span>
                  </div>
                  <p className="text-orange-900/80 text-[11px] leading-relaxed">
                    <code className="bg-orange-100/90 text-orange-900 px-1 py-0.2 rounded font-mono">public/_redirects</code> ensures client routes never throw a 404 when refreshed on Cloudflare.
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Edge _headers</span>
                  </div>
                  <p className="text-blue-900/80 text-[11px] leading-relaxed">
                    <code className="bg-blue-100/90 text-blue-900 px-1 py-0.2 rounded font-mono">public/_headers</code> sets security headers (X-Frame, CSP) and 1-year cache headers on static assets.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                    <Terminal className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Wrangler Ready</span>
                  </div>
                  <p className="text-emerald-900/80 text-[11px] leading-relaxed">
                    <code className="bg-emerald-100/90 text-emerald-900 px-1 py-0.2 rounded font-mono">wrangler.toml</code> &amp; <code className="bg-emerald-100/90 text-emerald-900 px-1 py-0.2 rounded font-mono">wrangler.jsonc</code> allow 1-command deployment with Cloudflare CLI.
                  </p>
                </div>
              </div>

              {/* Step-by-Step deployment guide */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>2 Simple Ways to Deploy to Cloudflare</span>
                </h4>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Method A: Cloudflare Dashboard Git Integration (Recommended)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                    <li>Log in to your account at <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">dash.cloudflare.com</a>.</li>
                    <li>Navigate to <strong>Workers &amp; Pages</strong> &gt; <strong>Create application</strong> &gt; <strong>Pages</strong> tab &gt; <strong>Connect to Git</strong>.</li>
                    <li>Select your BaitoMate repository.</li>
                    <li>Under <strong>Build settings</strong>, enter:
                      <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200">
                        <li>Framework preset: <strong>Vite</strong></li>
                        <li>Build command: <strong className="text-blue-600">npm run build</strong></li>
                        <li>Build output directory: <strong className="text-blue-600">dist</strong></li>
                      </ul>
                    </li>
                    <li>Click <strong>Save and Deploy</strong>. Cloudflare will build and give you a free HTTPS URL (<code className="text-blue-700">your-app.pages.dev</code>).</li>
                  </ol>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Method B: Direct CLI Deployment via Wrangler</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    You can build locally and upload the compiled assets straight to Cloudflare with one command:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                    npm run build{'\n'}npx wrangler pages deploy dist
                  </pre>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span>Custom Domain on Cloudflare</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    To connect your own domain (e.g. <code className="font-semibold text-amber-950">baitomate.yourdomain.com</code>), go to your project in the Cloudflare Pages dashboard &gt; <strong>Custom domains</strong> &gt; <strong>Set up a custom domain</strong>. Cloudflare DNS will configure the CNAME and SSL certificate automatically with zero downtime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            BaitoMate Legal Compliance & Guide v2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-sm"
          >
            Got it, close instructions
          </button>
        </div>
      </div>
    </div>
  );
};
