import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary:   'text-white',
  secondary: 'text-white border',
  ghost:     'bg-transparent text-blue-300 hover:text-white hover:bg-blue-900/20',
  danger:    'text-red-400 border border-red-500/30 hover:bg-red-500/10',
  success:   'text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10',
  gradient:  'text-white',
};
const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg' };

const getStyle = (variant) => {
  if (variant === 'primary')   return { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', boxShadow: '0 2px 12px rgba(27,154,245,0.3)' };
  if (variant === 'gradient')  return { background: 'linear-gradient(135deg,#0b1f3a,#0e7ee4,#42b4ff)', boxShadow: '0 2px 16px rgba(27,154,245,0.25)' };
  if (variant === 'secondary') return { borderColor: 'rgba(27,154,245,0.3)', background: 'rgba(27,154,245,0.08)' };
  return {};
};

export const Button = ({
  children, variant = 'primary', size = 'md', className = '',
  loading = false, disabled = false, icon: Icon, iconPosition = 'left',
  onClick, type = 'button', fullWidth = false, style, ...props
}) => (
  <motion.button
    type={type} onClick={onClick}
    disabled={disabled || loading}
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
    style={{ ...getStyle(variant), ...style }}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold rounded-xl
      transition-all duration-200 cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant]} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''} ${className}
    `}
    {...props}
  >
    {loading ? (
      <>
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Loading...</span>
      </>
    ) : (
      <>
        {Icon && iconPosition === 'left'  && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      </>
    )}
  </motion.button>
);
