import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Summarizer from './components/Summarizer';
import IdeaGenerator from './components/IdeaGenerator';
import ContentRefiner from './components/ContentRefiner';
import Chatbot from './components/Chatbot';
import DashboardHome from './components/DashboardHome';
import ErrorBoundary from './components/ErrorBoundary';
import ImageGenerator from './components/ImageGenerator';

// Create context for auth
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// AuthProvider component
function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    logout
  }), [currentUser, loading, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// PrivateRoute component
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Login Component
function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-teal-200 to-emerald-300 rounded-full blur-3xl"></div>
      </div>

      <div className="glass-strong apple-shadow-2xl rounded-3xl p-8 max-w-md w-full mx-4 relative z-10 border border-emerald-100/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 tracking-tight">
            SM Content
          </h1>
          <p className="text-gray-600 font-medium">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-xl apple-shadow-lg hover:apple-shadow-xl active:scale-98 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="w-full mt-4 text-sm text-gray-600 hover:text-emerald-600 font-bold transition-colors duration-300"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}

// Main dashboard layout
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatbotPage = location.pathname === '/dashboard/chatbot';

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-3xl"></div>
      </div>
      
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-20 relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="glass-strong apple-shadow-xl rounded-3xl p-6 md:p-8 h-full min-h-[600px] border border-emerald-100/50">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/summarizer" element={<Summarizer />} />
              <Route path="/idea-generator" element={<IdeaGenerator />} />
              <Route path="/content-refiner" element={<ContentRefiner />} />
              <Route path="/image-generator" element={<ImageGenerator />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <button
        onClick={() => {
          if (isChatbotPage) {
            document.querySelector('input[type="text"]')?.focus();
          } else {
            navigate('/dashboard/chatbot');
          }
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white apple-shadow-xl hover:apple-shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 z-50 group flex items-center justify-center"
        aria-label="Open AI Chatbot"
      >
        <svg className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        
        {!isChatbotPage && (
          <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
        )}
        
        <span className="hidden sm:block absolute bottom-full mb-2 right-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap apple-shadow-lg">
          {isChatbotPage ? 'Focus Input' : 'AI Chatbot'}
        </span>
      </button>
    </div>
  );
}

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/summarizer" element={<Navigate to="/dashboard/summarizer" replace />} />
            <Route path="/idea-generator" element={<Navigate to="/dashboard/idea-generator" replace />} />
            <Route path="/content-refiner" element={<Navigate to="/dashboard/content-refiner" replace />} />
            <Route path="/image-generator" element={<Navigate to="/dashboard/image-generator" replace />} />
            <Route path="/chatbot" element={<Navigate to="/dashboard/chatbot" replace />} />
            <Route path="/" element={<Navigate to="/dashboard/summarizer" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
