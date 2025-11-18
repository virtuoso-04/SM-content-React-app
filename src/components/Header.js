import React, { useCallback, useState } from 'react';
import { useAuth } from '../App';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const handleSignOut = useCallback(async () => {
    try {
      setLogoutError('');
      setSigningOut(true);
      await logout();
    } catch (error) {
      console.error('Sign out failed:', error);
      setLogoutError('Sign out failed. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }, [logout]);
  
  return (
    <header className="glass-strong apple-shadow-lg sticky top-0 z-30 px-4 md:px-8 py-5 border-b border-emerald-100/50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="ml-12 md:ml-0 flex items-center gap-3">
          {/* Premium Logo Icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center apple-shadow">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Reely.AI  
            </h1>
            <p className="text-xs md:text-sm text-gray-600 font-semibold">Smart Content Studio</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-3 glass-subtle px-4 py-2.5 rounded-2xl apple-shadow border border-emerald-100/50">
              {currentUser.photoURL && (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-emerald-200 apple-shadow"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {currentUser.displayName || currentUser.email}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-xs text-emerald-600 font-semibold">Active</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            disabled={!currentUser || signingOut}
            className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold apple-shadow hover:apple-shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:transform-none hover:-translate-y-0.5"
            aria-label="Sign out of account"
          >
            {signingOut && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
            )}
            Sign Out
          </button>
        </div>
      </div>
      
      {logoutError && (
        <div className="mt-3 p-3 glass-subtle border-red-200 rounded-xl text-red-700 text-sm apple-shadow animate-shake">
          {logoutError}
        </div>
      )}
    </header>
  );
};

export default Header; 