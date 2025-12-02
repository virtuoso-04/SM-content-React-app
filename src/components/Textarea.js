/**
 * Reusable Textarea Component
 */
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Textarea = forwardRef(({
  label = '',
  error = '',
  helperText = '',
  showCount = false,
  maxLength,
  fullWidth = true,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const charCount = props.value?.length || 0;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-200">
            {label}
            {props.required && <span className="ml-1 text-rose-400">*</span>}
          </label>
          {showCount && maxLength && (
            <span className={`text-xs ${charCount > maxLength ? 'text-rose-400' : 'text-slate-400'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full rounded-2xl border backdrop-blur-xl
          px-4 py-3 text-white placeholder-slate-400
          transition-all duration-200 resize-none
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError
            ? 'border-rose-400/50 bg-rose-500/10 focus:border-rose-400 focus:ring-rose-400/50'
            : 'border-white/20 bg-white/5 focus:border-cyan-400 focus:ring-cyan-400/50 hover:border-white/30'
          }
          ${className}
        `}
        {...props}
      />
      
      {(error || helperText) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-1.5 text-xs ${hasError ? 'text-rose-400' : 'text-slate-400'}`}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
