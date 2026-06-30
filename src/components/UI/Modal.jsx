import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', closeOnBackdrop = true }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ background: 'rgba(6,14,26,0.8)', backdropFilter: 'blur(6px)' }}
            onClick={closeOnBackdrop ? onClose : undefined} />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            className={`relative w-full ${sizes[size]} rounded-2xl`}
            style={{ background: '#0f2442', border: '1px solid rgba(27,154,245,0.2)', boxShadow: '0 16px 64px rgba(0,0,0,0.5)' }}>
            {title && (
              <div className="flex items-center justify-between p-6"
                style={{ borderBottom: '1px solid rgba(27,154,245,0.1)' }}>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#7a94ab' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(27,154,245,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 p-6"
                style={{ borderTop: '1px solid rgba(27,154,245,0.1)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message,
  confirmLabel = 'Confirm', confirmVariant = 'primary', loading = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }>
    <p className="text-sm leading-relaxed" style={{ color: '#b0c4d8' }}>{message}</p>
  </Modal>
);
