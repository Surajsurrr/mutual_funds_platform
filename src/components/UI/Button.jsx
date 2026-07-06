import React from 'react';
import { motion } from 'framer-motion';

/* Design system: pill-shaped teal gradient buttons */
const TEAL_GRAD = 'linear-gradient(135deg, #0B667E 0%, #12B4C3 100%)';
const TEAL_GRAD_HOVER = 'linear-gradient(135deg, #0d8fa8 0%, #3ecfdc 100%)';

const variants = {
  primary:   'text-white font-bold',
  secondary: 'font-semibold border',
  ghost:     'bg-transparent font-semibold',
  danger:    'font-semibold border',
  success:   'font-semibold border',
  gradient:  'text-white font-bold',
};

const SIZE_STYLES = {
  sm: { padding: '0.45rem 1rem', fontSize: '0.75rem' },
  md: { padding: '0.625rem 1.45rem', fontSize: '0.85rem' },
  lg: { padding: '0.875rem 1.85rem', fontSize: '0.95rem' },
  xl: { padding: '1.125rem 2.25rem', fontSize: '1.125rem' },
};

const getStyle = (variant) => {
  if (variant === 'primary')   return { background: TEAL_GRAD, color: '#ffffff', border: 'none', boxShadow: '0 4px 16px rgba(18,180,195,0.3)' };
  if (variant === 'gradient')  return { background: TEAL_GRAD, color: '#ffffff', border: 'none', boxShadow: '0 4px 20px rgba(18,180,195,0.25)' };
  if (variant === 'secondary') return { background: 'transparent', border: '2px solid #12B4C3', color: '#12B4C3' };
  if (variant === 'ghost')     return { color: '#7a94ab' };
  if (variant === 'danger')    return { color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'transparent' };
  if (variant === 'success')   return { color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'transparent' };
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
    style={{ ...getStyle(variant), ...SIZE_STYLES[size], ...style }}
    className={`
      inline-flex items-center justify-center gap-2 rounded-full
      transition-all duration-200 cursor-pointer
      disabled:opacity-40 disabled:cursor-not-allowed
      ${variants[variant]}
      ${fullWidth ? 'w-full' : ''} ${className}
    `}
    onMouseEnter={e => {
      if ((variant === 'primary' || variant === 'gradient') && !disabled && !loading) {
        e.currentTarget.style.background = TEAL_GRAD_HOVER;
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(18,180,195,0.45)';
      } else if (variant === 'ghost' && !disabled && !loading) {
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }
    }}
    onMouseLeave={e => {
      if ((variant === 'primary' || variant === 'gradient') && !disabled && !loading) {
        e.currentTarget.style.background = TEAL_GRAD;
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(18,180,195,0.3)';
      } else if (variant === 'ghost' && !disabled && !loading) {
        e.currentTarget.style.color = '#7a94ab';
        e.currentTarget.style.background = 'transparent';
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
