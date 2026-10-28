import React from 'react';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#171717] text-white hover:bg-black focus:ring-stone-900 shadow-sm',
      secondary:
        'bg-[#3A2418] text-white hover:bg-[#2c1b12] focus:ring-[#3A2418]',
      accent:
        'bg-[#A66A3F] text-white hover:bg-[#8e5832] focus:ring-[#A66A3F]',
      outline:
        'border border-[#DDD8D0] bg-transparent text-[#1C1C1C] hover:bg-stone-100 hover:border-[#171717] focus:ring-stone-400',
      ghost:
        'bg-transparent text-[#1C1C1C] hover:bg-stone-100 focus:ring-stone-400',
      danger:
        'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-2 min-h-[36px] rounded-sm gap-1.5',
      md: 'text-sm px-5 py-3 min-h-[44px] rounded-sm gap-2',
      lg: 'text-base px-7 py-3.5 min-h-[50px] rounded-sm gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${
          sizes[size] || sizes.md
        } ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
