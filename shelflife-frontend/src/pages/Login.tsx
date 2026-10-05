import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('librarian@shelflife.edu');
  const [password, setPassword] = useState<string>('password123');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      showToast('Signed in successfully.', 'success');
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const message = errorObj?.message || 'Invalid email or password. Please verify staff credentials.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleResetDefaults = () => {
    setEmail('librarian@shelflife.edu');
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-[#1769AA]/20">
      
      {/* Calm academic container */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT / EDITORIAL INSTITUTIONAL AREA */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5 text-center lg:text-left py-2">
          
          <div className="flex items-center justify-center lg:justify-start space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#172033]">
                ShelfLife
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                College Library Management System
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] leading-snug">
              Library Staff & Circulation Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Institutional workspace for managing holdings, cardholder registrations, and checkout ledger records.
            </p>
          </div>

          <div className="pt-2 space-y-2 text-xs text-slate-600 max-w-md mx-auto lg:mx-0 text-left">
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1769AA]" />
              <span>Catalog accession and stock availability tracking</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1769AA]" />
              <span>Student & faculty membership registry</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1769AA]" />
              <span>Circulation desk borrowing and return verification</span>
            </div>
          </div>

        </div>

        {/* RIGHT / CLEAN LOGIN FORM CARD */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#E3E8EE]">
            
            <div className="mb-5 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#172033]">
                Staff Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in with librarian credentials to access the workspace.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label
                  htmlFor="email"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="librarian@shelflife.edu"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] transition"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-medium text-slate-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#1769AA] transition"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-1.5 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#1769AA] rounded border-slate-300 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-slate-400">Institutional SSO</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-medium text-white bg-[#1769AA] hover:bg-[#125488] transition disabled:opacity-60 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Librarian'}</span>
                {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>

            {/* Exam / Evaluation Demo Credentials Box */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700">Demo Credentials</span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-[11px] text-[#1769AA] hover:underline"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded border border-slate-200/80">
                  <span>librarian@shelflife.edu</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('librarian@shelflife.edu', 'email')}
                    className="text-[#1769AA] hover:underline flex items-center space-x-0.5"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-[#16845B]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded border border-slate-200/80">
                  <span>password123</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('password123', 'password')}
                    className="text-[#1769AA] hover:underline flex items-center space-x-0.5"
                  >
                    {copiedPassword ? <Check className="w-3 h-3 text-[#16845B]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
