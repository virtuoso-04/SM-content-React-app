import React, { useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MdSummarize, MdMenu, MdClose } from 'react-icons/md';
import { FaLightbulb, FaComments, FaGamepad, FaImage, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { checkHealth } from '../services/api';

const navItems = [
  { name: 'Summarizer', path: '/dashboard/summarizer', icon: <MdSummarize size={24} />, color: 'cyan' },
  { name: 'Idea Generator', path: '/dashboard/idea-generator', icon: <FaLightbulb size={24} />, color: 'amber' },
  { name: 'Content Refiner', path: '/dashboard/content-refiner', icon: <TbAdjustmentsHorizontal size={24} />, color: 'purple' },
  { name: 'Chatbot', path: '/dashboard/chatbot', icon: <FaComments size={24} />, color: 'emerald' },
  { name: 'Image Studio', path: '/dashboard/image-generator', icon: <FaImage size={24} />, color: 'pink' },
  { name: 'GameForge AI', path: '/dashboard/gameforge', icon: <FaGamepad size={24} />, color: 'indigo' },
];

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ healthy: null, checking: true });

  useEffect(() => {
    const checkAPIStatus = async () => {
      const status = await checkHealth();
      setApiStatus({ ...status, checking: false });
    };

    checkAPIStatus();
    const interval = setInterval(checkAPIStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="md:hidden fixed top-4 left-4 z-50 rounded-2xl border border-white/20 bg-white/10 p-2 text-white backdrop-blur-xl shadow-lg"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-200 ease-in-out
          bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-[0_25px_80px_rgba(1,8,23,0.65)]
          flex flex-col
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6 flex-1">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 mt-12 md:mt-0"
          >
            <h2 className="mb-2 text-xl font-bold text-white">AI Tools</h2>
            <p className="text-sm text-slate-300">Choose your content companion</p>
          </motion.div>
          
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all duration-200 group ${
                      isActive 
                        ? `bg-gradient-to-r from-${item.color}-400/30 via-${item.color}-500/30 to-${item.color}-500/30 text-white border border-${item.color}-200/40 shadow-lg shadow-${item.color}-500/20` 
                        : 'text-slate-200 border border-white/5 hover:border-cyan-200/30 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <motion.span 
                    className="text-xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span>{item.name}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* API Status Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 border-t border-white/10"
        >
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            {apiStatus.checking ? (
              <>
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-slate-300">Checking API...</span>
              </>
            ) : apiStatus.healthy ? (
              <>
                <FaCheckCircle className="text-emerald-400" size={14} />
                <span className="text-xs text-slate-300">API Connected</span>
              </>
            ) : (
              <>
                <FaExclamationCircle className="text-rose-400" size={14} />
                <span className="text-xs text-slate-300">API Offline</span>
              </>
            )}
          </div>
        </motion.div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 