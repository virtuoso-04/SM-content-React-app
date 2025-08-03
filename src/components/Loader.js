import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

export default Loader; 