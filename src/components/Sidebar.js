import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { MdSummarize, MdMenu, MdClose, MdHome } from 'react-icons/md';
import { FaLightbulb, FaComments, FaImage } from 'react-icons/fa';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <MdHome size={24} /> },
  { name: 'AI Chatbot', path: '/dashboard/chatbot', icon: <FaComments size={24} /> },
  { name: 'Image Studio', path: '/dashboard/image-generator', icon: <FaImage size={24} /> },
  { name: 'Summarizer', path: '/dashboard/summarizer', icon: <MdSummarize size={24} /> },
  { name: 'Idea Generator', path: '/dashboard/idea-generator', icon: <FaLightbulb size={24} /> },
  { name: 'Content Refiner', path: '/dashboard/content-refiner', icon: <TbAdjustmentsHorizontal size={24} /> },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
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
        className="md:hidden fixed top-4 left-4 z-50 p-3 glass-strong rounded-xl apple-shadow hover:apple-shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <MdClose size={24} className="text-gray-700" /> : <MdMenu size={24} className="text-gray-700" />}
      </button>

      {/* Desktop Fan-style Sidebar */}
      <aside 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          hidden md:block fixed inset-y-0 left-0 z-40 
          ${isExpanded ? 'w-64' : 'w-20'} 
          transition-all duration-300 ease-in-out
          glass-strong apple-shadow-lg border-r border-emerald-100/50
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo/Brand */}
          <div className={`mb-8 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">AI Tools</h2>
            <p className="text-sm text-gray-700 font-semibold">Choose your content companion</p>
          </div>

          {/* Collapsed Logo */}
          {!isExpanded && (
            <div className="mb-8 flex justify-center animate-fade-in">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 apple-shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-3.5 rounded-xl font-bold transition-all duration-300 group relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white apple-shadow-lg scale-105' 
                      : 'text-gray-700 glass-subtle hover:glass hover:apple-shadow hover:scale-105 hover:text-emerald-600'
                  }`
                }
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300 shrink-0">{item.icon}</span>
                
                {/* Text - expands with sidebar */}
                <span className={`text-sm whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}>
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none apple-shadow-lg z-50">
                    {item.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Expand hint */}
          {!isExpanded && (
            <div className="text-center pb-4 animate-fade-in">
              <div className="text-xs text-gray-500 font-semibold">
                <MdMenu className="mx-auto text-emerald-600" size={20} />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 w-64 
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-300 ease-in-out
          glass-strong apple-shadow-lg border-r border-emerald-100/50
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8 mt-12">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">AI Tools</h2>
            <p className="text-sm text-gray-700 font-semibold">Choose your content companion</p>
          </div>
          
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white apple-shadow-lg transform scale-105' 
                      : 'text-gray-700 glass-subtle hover:glass hover:apple-shadow hover:scale-105 hover:text-emerald-600'
                  }`
                }
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar; 