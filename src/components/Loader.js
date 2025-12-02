import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', className = '', fullScreen = false, message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const loader = (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border border-t-transparent border-white/20 border-r-cyan-300 border-b-cyan-300 animate-spin`} />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-slate-300"
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader; 