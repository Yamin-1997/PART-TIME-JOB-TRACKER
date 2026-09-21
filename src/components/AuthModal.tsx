import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  User, 
  School, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Users
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { useLanguage } from '../utils/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserAccount, rememberMe: boolean) => void;
  onRegister: (newUser: Omit<UserAccount, 'id' | 'totalLogins' | 'lastLoginAt' | 'createdAt'>, rememberMe: boolean) => void;
  onResetPassword?: (user: UserAccount, newPassword?: string) => void;
  users: UserAccount[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onResetPassword,
  users,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasRememberedEmail, setHasRememberedEmail] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regSchool, setRegSchool] = useState('');
  const [regVisaExpiry, setRegVisaExpiry] = useState('2027-03-31');

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'new_password'>('email');
  const [resetTargetUser, setResetTargetUser] = useState<UserAccount | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const [error, setError] = useState('');

  // Load remembered email on this specific device ONLY if previously saved by user
  useEffect(() => {
    if (isOpen) {
      setError('');
      setShowPassword(false);
      setShowRegPassword(false);
      setShowForgotNewPassword(false);
      setForgotSuccessMsg('');
      setForgotStep('email');
      setResetTargetUser(null);
      setForgotNewPassword('');
      setForgotConfirmPassword('');

      try {
        const saved = localStorage.getItem('baitomate_remembered_credentials');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email && typeof parsed.email === 'string') {
            setEmail(parsed.email);
            setRememberMe(true);
            setHasRememberedEmail(true);
          }
        } else {
          setEmail('');
          setPassword('');
          setRememberMe(false);
          setHasRememberedEmail(false);
        }
      } catch (e) {
        console.error('Failed reading saved credentials', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForgetSavedEmail = () => {
    try {
      localStorage.removeItem('baitomate_remembered_credentials');
      setEmail('');
      setPassword('');
      setRememberMe(false);
      setHasRememberedEmail(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both your email address and password.');
      return;
    }

    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      setError('No account found with this email. Please check your spelling or register a new account.');
      return;
    }

    if (matchedUser.password && matchedUser.password !== cleanPassword) {
      setError('Incorrect password. Click "Forgot Password?" below to reset it.');
      return;
    }

    // Login successful
    onLogin(matchedUser, rememberMe);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPassword = regPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setError('Full name, email address, and password are required.');
      return;
    }

    const existing = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      setError('An account with this email address already exists. Please sign in instead.');
      return;
    }

    onRegister(
      {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: regRole,
        schoolOrUniversity: regSchool.trim() || undefined,
        visaExpiryDate: regVisaExpiry || undefined,
      },
      rememberMe
    );
    onClose();
  };

  // Step 1 of Forgot Password: Verify email
  const handleVerifyForgotEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your account email address.');
      return;
    }

    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      setError('No account found with this email address. Please check your spelling or register a new account.');
      return;
    }

    setResetTargetUser(matched);
    setForgotStep('new_password');
  };

  // Step 2 of Forgot Password: Set new password and log in
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetTargetUser) {
      setError('User verification expired. Please re-enter your email.');
      setForgotStep('email');
      return;
    }

    const newPass = forgotNewPassword.trim();
    const confirmPass = forgotConfirmPassword.trim();

    if (!newPass) {
      setError('Please enter a new password.');
      return;
    }

    if (newPass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Passwords do not match. Please re-type your new password.');
      return;
    }

    // Call reset handler
    if (onResetPassword) {
      onResetPassword(resetTargetUser, newPass);
    }

    // Automatically log user in with new credentials
    const updatedUser: UserAccount = {
      ...resetTargetUser,
      password: newPass,
    };

    onLogin(updatedUser, rememberMe);
    onClose();
  };

  // Safe isolated demo student login without exposing other real accounts
  const handleLaunchDemoStudent = () => {
    const demoStudent = users.find(
      (u) => u.email.toLowerCase() === 'student.demo@example.com'
    ) || {
      id: 'demo-student',
      name: 'Demo Student (留学太郎)',
      email: 'student.demo@example.com',
      password: 'password123',
      role: 'student' as UserRole,
      schoolOrUniversity: 'Tokyo International Japanese Academy',
      visaExpiryDate: '2027-03-31',
      totalLogins: 1,
      createdAt: new Date().toISOString()
    };

    onLogin(demoStudent, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {mode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : mode === 'register' ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {mode === 'login'
                  ? 'Sign In to BaitoMate'
                  : mode === 'register'
                  ? 'Create Student / Admin Account'
                  : 'Forgot Password & Recovery'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {mode === 'login'
                  ? 'Enter your credentials to access your tracker'
                  : mode === 'register'
                  ? 'Register your personal student account'
                  : 'Reset your password or recover your account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Login vs Register */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In (ログイン)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register (新規登録)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {forgotSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{forgotSuccessMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Email Address
                  </label>
                  {hasRememberedEmail && (
                    <button
                      type="button"
                      onClick={handleForgetSavedEmail}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                      title="Clear saved email on this browser"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Forget saved email</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setMode('forgot');
                      setForgotStep('email');
                      setError('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
                    title="Forgot Password or Need Help?"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium">Remember my email on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              {/* Use other user / Switch Account Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleForgetSavedEmail();
                    setEmail('');
                    setPassword('');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-blue-600 transition inline-flex items-center gap-1.5 cursor-pointer font-medium"
                  title="Clear email and password fields to sign in as another user"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Use other user (別のアカウントを使用)</span>
                </button>
              </div>

              {/* Safe Guest Demo Exploration */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">Just testing or exploring?</span>
                <button
                  type="button"
                  onClick={handleLaunchDemoStudent}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try Demo Student Mode</span>
                </button>
              </div>
            </form>
          ) : mode === 'register' ? (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. John Doe / 留学生名前"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student (留学生)</option>
                    <option value="admin">Admin (管理者)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Visa Expiry
                  </label>
                  <input
                    type="date"
                    value={regVisaExpiry}
                    onChange={(e) => setRegVisaExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  School / University (Optional)
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="e.g. Tokyo University / Language School"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Remember my email on this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register &amp; Sign In</span>
              </button>
            </form>
          ) : (
            /* Forgot Password / Account Recovery Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password &amp; Account Recovery
                </span>
              </div>

              {forgotStep === 'email' ? (
                <form onSubmit={handleVerifyForgotEmail} className="space-y-3.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the email address associated with your student or supervisor account. We will verify your account and allow you to set a new password immediately.
                  </p>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. student@school.ac.jp"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Account &amp; Continue</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  {/* Verified account badge */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Account Verified: {resetTargetUser?.name}</span>
                      </div>
                      <div className="text-[11px] text-blue-700/80 font-mono mt-0.5">
                        {resetTargetUser?.email} • {resetTargetUser?.role === 'admin' ? 'Supervisor' : 'Student'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 4 characters)"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
                        aria-label={showForgotNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-type your new password"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password &amp; Sign In</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
