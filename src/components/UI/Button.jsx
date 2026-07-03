import React from 'react';
import { motion } from 'framer-motion';

/* Design system: pill-shaped teal gradient buttons */
const TEAL_GRAD = 'linear-gradient(135deg, #0B667E 0%, #12B4C3 100%)';
const TEAL_GRAD_HOVER = 'linear-gradient(135deg, #0d8fa8 0%, #3ecfdc 100%)';

const variants = {
  primary:   'text-white font-bold',
  secondary: 'text-white font-semibold',
  ghost:     'bg-transparent font-semibold',
  danger:    'font-semibold border',
  success:   'font-semibold border',
  gradient:  'text-white font-bold',
};

const sizes = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
  xl: 'px-9 py-4 text-lg',
};

const getStyle = (variant) => {
  if (variant === 'primary')   return { background: TEAL_GRAD, boxShadow: '0 4px 16px rgba(11,102,126,0.3)' };
  if (variant === 'gradient')  return { background: TEAL_GRAD, boxShadow: '0 4px 20px rgba(11,102,126,0.25)' };
  if (variant === 'secondary') return { background: 'transparent', border: '2px solid #0B667E', color: '#0B667E' };
  if (variant === 'ghost')     return { color: '#0B667E' };
  if (variant === 'danger')    return { color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' };
  if (variant === 'success')   return { color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' };
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
      inline-flex items-center justify-center gap-2 rounded-full
      transition-all duration-200 cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant]} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''} ${className}
    `}
    onMouseEnter={e => {
      if ((variant === 'primary' || variant === 'gradient') && !disabled && !loading) {
        e.currentTarget.style.background = TEAL_GRAD_HOVER;
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(11,102,126,0.4)';
      }
    }}
    onMouseLeave={e => {
      if ((variant === 'primary' || variant === 'gradient') && !disabled && !loading) {
        e.currentTarget.style.background = TEAL_GRAD;
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(11,102,126,0.3)';
      }
    }}
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


