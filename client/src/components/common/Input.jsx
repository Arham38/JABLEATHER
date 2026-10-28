import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      id,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || name || 'input-' + Math.random().toString(36).substr(2, 9);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1.5"
          >
            {label}
            {required && <span className="text-amber-800 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B665F]/50 transition duration-150 focus:outline-none focus:ring-1 ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-[#DDD8D0] focus:border-[#171717] focus:ring-[#171717]'
            } disabled:bg-stone-100 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#6B665F]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
