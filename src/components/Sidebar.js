import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { MdSummarize, MdMenu, MdClose } from 'react-icons/md';
import { FaLightbulb, FaComments, FaGamepad, FaImage } from 'react-icons/fa';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';

const navItems = [
  { name: 'Summarizer', path: '/dashboard/summarizer', icon: <MdSummarize size={24} /> },
  { name: 'Idea Generator', path: '/dashboard/idea-generator', icon: <FaLightbulb size={24} /> },
  { name: 'Content Refiner', path: '/dashboard/content-refiner', icon: <TbAdjustmentsHorizontal size={24} /> },
  { name: 'Chatbot', path: '/dashboard/chatbot', icon: <FaComments size={24} /> },
  { name: 'Image Studio', path: '/dashboard/image-generator', icon: <FaImage size={24} /> },
  { name: 'GameForge AI', path: '/dashboard/gameforge', icon: <FaGamepad size={24} /> },
];

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 rounded-2xl border border-white/20 bg-white/10 p-2 text-white backdrop-blur-xl shadow-lg"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-200 ease-in-out
          bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-[0_25px_80px_rgba(1,8,23,0.65)]
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6">
          <div className="mb-8 mt-12 md:mt-0">
            <h2 className="mb-2 text-xl font-bold text-white">AI Tools</h2>
            <p className="text-sm text-slate-300">Choose your content companion</p>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-400/30 via-sky-500/30 to-indigo-500/30 text-white border border-cyan-200/40 shadow-lg shadow-cyan-500/20' 
                      : 'text-slate-200 border border-white/5 hover:border-cyan-200/30 hover:text-white'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar; 