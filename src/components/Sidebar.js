import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { MdSummarize, MdMenu, MdClose } from 'react-icons/md';
import { FaLightbulb, FaComments } from 'react-icons/fa';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';

const navItems = [
  { name: 'Summarizer', path: '/dashboard/summarizer', icon: <MdSummarize size={24} /> },
  { name: 'Idea Generator', path: '/dashboard/idea-generator', icon: <FaLightbulb size={24} /> },
  { name: 'Content Refiner', path: '/dashboard/content-refiner', icon: <TbAdjustmentsHorizontal size={24} /> },
  { name: 'Chatbot', path: '/dashboard/chatbot', icon: <FaComments size={24} /> },
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
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
          bg-white/90 backdrop-blur-lg shadow-lg border-r border-gray-200
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6">
          <div className="mb-8 mt-12 md:mt-0">
            <h2 className="text-xl font-bold text-gray-800 mb-2">AI Tools</h2>
            <p className="text-sm text-gray-600">Choose your content companion</p>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar; 