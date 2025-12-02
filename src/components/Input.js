/**
 * Reusable Input Component with variants
 */
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label = '',
  error = '',
  helperText = '',
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const hasError = Boolean(error);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-200">
          {label}
          {props.required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full rounded-2xl border backdrop-blur-xl
            px-4 py-2.5 text-white placeholder-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${hasError
              ? 'border-rose-400/50 bg-rose-500/10 focus:border-rose-400 focus:ring-rose-400/50'
              : 'border-white/20 bg-white/5 focus:border-cyan-400 focus:ring-cyan-400/50 hover:border-white/30'
            }
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      
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

Input.displayName = 'Input';

export default Input;
