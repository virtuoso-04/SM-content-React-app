import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { auth, provider } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import Summarizer from './components/Summarizer';
import IdeaGenerator from './components/IdeaGenerator';
import ContentRefiner from './components/ContentRefiner';
import Chatbot from './components/Chatbot';
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

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard/summarizer';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Content Studio
          </h1>
          <p className="text-gray-600 text-lg">Your AI-powered content companion</p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-6">Sign in with Google to access powerful AI tools</p>
            <button
              onClick={signIn}
              disabled={authLoading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-3"
            >
              {authLoading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
          
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-center">
              {authError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main dashboard layout
function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8 h-full min-h-[600px]">
            <Routes>
              <Route path="/summarizer" element={<Summarizer />} />
              <Route path="/idea-generator" element={<IdeaGenerator />} />
              <Route path="/content-refiner" element={<ContentRefiner />} />
              <Route path="/chatbot" element={<Chatbot />} />
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
            {/* Default route goes to dashboard/summarizer */}
            <Route path="/" element={<Navigate to="/dashboard/summarizer" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
