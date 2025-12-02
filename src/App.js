import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { auth, provider } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import heroWorkspace from './assets/into.jpg';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import Summarizer from './components/Summarizer';
import IdeaGenerator from './components/IdeaGenerator';
import ContentRefiner from './components/ContentRefiner';
import Chatbot from './components/Chatbot';
import GameForge from './components/GameForge';
import ImageGenerator from './components/ImageGenerator';
import ErrorBoundary from './components/ErrorBoundary';

// Auth context for global user state
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Listen for auth state changes
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        try {
          setUser(firebaseUser);
          setLoading(false);
        } catch (error) {
          console.error('Error setting user state:', error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth listener:', error);
        }
      }
    };
  }, []);

  // Google Sign-In
  const signIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked. Please allow popups and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Sign in was cancelled.');
      } else if (err.code === 'auth/network-request-failed') {
        setAuthError('Network error. Please check your connection.');
      } else {
        setAuthError(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out
  const signOutUser = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      setAuthError(err.message || 'Sign out failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut: signOutUser, authLoading, authError }}>
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
}

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Login page
function Login() {
  const { signIn, user, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard/summarizer';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormLoading(true);
    const trimmedEmail = email.trim();
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      }
      const from = location.state?.from?.pathname || '/dashboard/summarizer';
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Unable to authenticate right now. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#03121f] to-[#01221d] px-4 py-12 text-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute -left-10 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[48px] border border-white/15 bg-white/5 shadow-[0_50px_140px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,1.05fr]">
          <div className="relative px-8 py-12 text-slate-100 md:px-12">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Smart Content Studio
            </div>

            <h1 className="mt-8 text-4xl font-semibold leading-tight text-white">
              Welcome back, creator.
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Simplify your workflow and boost your productivity with a workspace tailored for creative strategists.
            </p>

            <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold text-slate-300 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(true);
                  setFormError('');
                }}
                className={`rounded-full px-6 py-2 transition ${
                  isLoginMode ? 'bg-white/90 text-slate-900 shadow-lg shadow-emerald-500/20' : 'hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setFormError('');
                }}
                className={`rounded-full px-6 py-2 transition ${
                  !isLoginMode ? 'bg-white/90 text-slate-900 shadow-lg shadow-emerald-500/20' : 'hover:text-white'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-200">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-400 transition hover:text-emerald-200"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-4 py-3 text-base font-semibold text-slate-900 shadow-[0_25px_80px_rgba(45,212,191,0.45)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              >
                {formLoading ? 'Please wait…' : isLoginMode ? 'Login' : 'Create account'}
              </button>
            </form>

            {formError && (
              <div className="mt-4 rounded-2xl border border-rose-300/60 bg-rose-500/10 p-3 text-sm text-rose-100">
                {formError}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="h-px flex-1 bg-white/10" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-1">
                <button
                  type="button"
                  onClick={signIn}
                  disabled={authLoading}
                  className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 py-3 text-white shadow-[0_15px_45px_rgba(15,23,42,0.35)] transition hover:border-emerald-200 hover:text-emerald-200 disabled:opacity-60"
                >
                  {authLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <FaGoogle className="h-5 w-5" />
                  )}
                </button>
                
              </div>
            </div>

            {authError && (
              <p className="mt-3 text-sm text-rose-300">{authError}</p>
            )}

            <p className="mt-8 text-sm text-slate-400">
              Not a member?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setFormError('');
                }}
                className="font-semibold text-emerald-200 transition hover:text-emerald-100"
              >
                Register now
              </button>
            </p>
          </div>

          <div className="relative hidden overflow-hidden md:flex">
            <img
              src={heroWorkspace}
              alt="Creative workspace"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main dashboard layout
function Dashboard() {
  return (
    <div className="relative flex min-h-screen bg-transparent text-slate-100">
      <Sidebar />
      <div className="flex-1 md:ml-0 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="glass-panel relative h-full min-h-[600px] border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_45px_120px_rgba(1,8,23,0.65)]">
            <Routes>
              <Route path="/summarizer" element={<Summarizer />} />
              <Route path="/idea-generator" element={<IdeaGenerator />} />
              <Route path="/content-refiner" element={<ContentRefiner />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/image-generator" element={<ImageGenerator />} />
              <Route path="/gameforge" element={<GameForge />} />
              <Route path="*" element={<Navigate to="/summarizer" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Dashboard and tools */}
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            {/* Redirect top-level tool routes to dashboard equivalents */}
            <Route path="/summarizer" element={<Navigate to="/dashboard/summarizer" replace />} />
            <Route path="/idea-generator" element={<Navigate to="/dashboard/idea-generator" replace />} />
            <Route path="/content-refiner" element={<Navigate to="/dashboard/content-refiner" replace />} />
            <Route path="/chatbot" element={<Navigate to="/dashboard/chatbot" replace />} />
            <Route path="/image-generator" element={<Navigate to="/dashboard/image-generator" replace />} />
            <Route path="/gameforge" element={<Navigate to="/dashboard/gameforge" replace />} />
            {/* Default route goes to dashboard/summarizer */}
            <Route path="/" element={<Navigate to="/dashboard/summarizer" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
