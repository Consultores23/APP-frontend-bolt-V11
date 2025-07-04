import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-md 
              ${icon ? 'pl-10' : 'pl-4'} 
              py-2.5 
              bg-dark-700 
              border border-dark-500 
              text-white 
              placeholder-gray-400 
              transition-all 
              focus:outline-none 
              focus:ring-2 
              focus:ring-secondary-500/30 
              focus:border-secondary-500 
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;