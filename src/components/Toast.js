/**
 * Toast Notification Component with animations
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const toastIcons = {
  success: <FaCheckCircle className="text-emerald-400" size={20} />,
  error: <FaTimesCircle className="text-red-400" size={20} />,
  warning: <FaExclamationCircle className="text-amber-400" size={20} />,
  info: <FaInfoCircle className="text-cyan-400" size={20} />,
};

const toastStyles = {
  success: 'border-emerald-400/30 bg-emerald-500/10',
  error: 'border-red-400/30 bg-red-500/10',
  warning: 'border-amber-400/30 bg-amber-500/10',
  info: 'border-cyan-400/30 bg-cyan-500/10',
};

const Toast = ({ toast, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={`
        flex items-start gap-3 rounded-2xl border backdrop-blur-xl 
        px-4 py-3 shadow-lg min-w-[300px] max-w-md
        ${toastStyles[toast.type] || toastStyles.info}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {toastIcons[toast.type] || toastIcons.info}
      </div>
      <div className="flex-1 text-sm text-white">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <FaTimesCircle size={18} />
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
