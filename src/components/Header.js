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
    <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="ml-12 md:ml-0">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reely.AI  
          </h1>
          <p className="text-xs md:text-sm text-gray-600"> Smart Content Studio</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-3">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.displayName || user.email}
                </p>
                <p className="text-xs text-gray-500">Authenticated</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            disabled={authLoading}
            className="px-3 md:px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60 disabled:transform-none"
            aria-label="Sign out of account"
          >
            {authLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
            )}
            Sign Out
          </button>
        </div>
      </div>
      
      {authError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {authError}
        </div>
      )}
    </header>
  );
};

export default Header; 