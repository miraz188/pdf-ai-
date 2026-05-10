import React from 'react';

const Input = ({ label, error, icon: Icon = null, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-dark-300">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-dark-400" />
          </div>
        )}
        <input
          className={`w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg
            text-dark-100 placeholder-dark-400
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
