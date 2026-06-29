import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error ? 'border-rose-500/50 focus:border-rose-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-400 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';


export const Select = forwardRef(({
  label,
  error,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`input-field cursor-pointer ${error ? 'border-rose-500/50' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-400">⚠ {error}</p>}
    </div>
  );
});

Select.displayName = 'Select';


export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-field resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400">⚠ {error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
