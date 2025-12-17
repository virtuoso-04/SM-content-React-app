import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PromptTemplateSelector = ({ templates, onSelectTemplate, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { t } = useTranslation();

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 text-sm"
        aria-label={t('common.selectTemplate')}
      >
        <span className="text-lg">
          {selectedTemplate ? selectedTemplate.icon : '📝'}
        </span>
        <span className="text-white/80 font-medium">
          {selectedTemplate ? selectedTemplate.name : t('common.selectTemplate')}
        </span>
        <svg
          className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">
                  {t('templates.title')}
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  {t('templates.selectPrompt')}
                </p>
              </div>
              
              <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                {/* Custom/Reset Option */}
                <button
                  onClick={() => handleSelect(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    !selectedTemplate
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">✨</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">
                      {t('templates.custom')}
                    </div>
                    <div className="text-xs text-white/50">
                      Write your own prompt
                    </div>
                  </div>
                </button>

                {/* Template Options */}
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedTemplate?.id === template.id
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">
                        {template.name}
                      </div>
                      <div className="text-xs text-white/50 line-clamp-1">
                        {template.description}
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptTemplateSelector;
