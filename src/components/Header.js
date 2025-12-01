import React, { useCallback } from 'react';
import { useAuth } from '../App';

const Header = () => {
  const { user, signOut, authLoading, authError } = useAuth();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }, [signOut]);
  
  return (
    <header className="border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between">
        <div className="ml-12 md:ml-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-cyan-200 via-sky-200 to-indigo-200 bg-clip-text">
            Smart Content Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-300">All in one companion for creators</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-3">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="h-9 w-9 rounded-full border-2 border-white/30"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-slate-100">
                  {user.displayName || user.email}
                </p>
                <p className="text-xs text-slate-400">Authenticated</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            disabled={authLoading}
            className="group relative overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-60 md:px-4"
            aria-label="Sign out of account"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 opacity-90 transition group-hover:opacity-100" aria-hidden="true" />
            <span className="relative flex items-center gap-2">
            {authLoading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span className="relative">Sign Out</span>
            </span>
          </button>
        </div>
      </div>
      
      {authError && (
        <div className="mt-3 rounded-2xl border border-rose-400/50 bg-rose-500/10 p-3 text-sm text-rose-200">
          {authError}
        </div>
      )}
    </header>
  );
};

export default Header; 