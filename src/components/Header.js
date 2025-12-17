import React, { useCallback, useState } from 'react';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import Button from './Button';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { user, signOut, authLoading, authError } = useAuth();
  const { t } = useTranslation();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }, [signOut]);
  
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl md:px-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="ml-12 md:ml-0">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-cyan-200 via-sky-200 to-indigo-200 bg-clip-text"
          >
            {t('header.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs md:text-sm text-slate-300"
          >
            {t('header.subtitle')}
          </motion.p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSelector />
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-all"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full border-2 border-cyan-400/50"
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-cyan-400" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-100 max-w-32 truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-emerald-400">● Online</p>
                </div>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          className="h-12 w-12 rounded-full border-2 border-cyan-400/50"
                        />
                      ) : (
                        <FaUserCircle className="h-12 w-12 text-cyan-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      <p>Member since: {new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <Button
            onClick={handleSignOut}
            loading={authLoading}
            variant="danger"
            size="sm"
            leftIcon={<FaSignOutAlt />}
            className="shadow-lg"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-2xl border border-rose-400/50 bg-rose-500/10 p-3 text-sm text-rose-200"
          >
            {authError}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 