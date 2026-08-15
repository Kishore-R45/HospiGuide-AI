import React from 'react';

/* ============================================
   Button Component
   ============================================ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
  const variantClass = `btn-${variant}`;
  const fullClass = fullWidth ? 'btn-full' : '';

  return (
    <button
      className={`btn ${sizeClass} ${variantClass} ${fullClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

/* ============================================
   Card Component
   ============================================ */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  style,
}) => {
  const variantClass = variant === 'glass' ? 'card-glass' : variant === 'elevated' ? 'card-elevated' : 'card';
  const interactiveClass = onClick ? 'card-interactive' : '';

  return (
    <div
      className={`${variantClass} ${interactiveClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={style}
    >
      {children}
    </div>
  );
};

/* ============================================
   Chip Component
   ============================================ */
interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  onClick,
  active = false,
}) => {
  return (
    <button
      className={`chip ${active ? 'chip-active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="chip-icon">{icon}</span>}
      {label}
    </button>
  );
};

/* ============================================
   Input Component
   ============================================ */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  icon,
  rightElement,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="input-wrapper">
      {icon && <span className="input-icon">{icon}</span>}
      <input
        ref={ref}
        className={`input-field ${icon ? 'has-icon' : ''} ${rightElement ? 'has-right' : ''} ${className}`}
        {...props}
      />
      {rightElement && <span className="input-right">{rightElement}</span>}
    </div>
  );
});

Input.displayName = 'Input';

/* ============================================
   Toast Component
   ============================================ */
interface ToastProps {
  message: string;
  visible: boolean;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  variant = 'info',
  onClose,
}) => {
  React.useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${variant}`}>
        {message}
      </div>
    </div>
  );
};

/* ============================================
   Modal Component
   ============================================ */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div className="modal-header">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--surface-900)' }}>{title}</h2>
            <button
              onClick={onClose}
              className="btn-icon-sm"
              style={{
                background: 'var(--surface-100)',
                borderRadius: '50%',
                color: 'var(--surface-500)',
              }}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================
   Bottom Sheet Component
   ============================================ */
interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose,
  title,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="bottom-sheet-overlay animate-fade-in" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="bottom-sheet-handle" />
        {title && (
          <div style={{ padding: '0 24px 12px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--surface-800)' }}>{title}</h3>
          </div>
        )}
        <div style={{ padding: '0 24px 32px', maxHeight: '60vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  );
};

/* ============================================
   Status Badge
   ============================================ */
interface StatusBadgeProps {
  status: 'available' | 'soon' | 'unavailable';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  return (
    <span className={`status-badge status-${status}`}>
      <span className={`status-dot status-dot-${status}`} />
      {label}
    </span>
  );
};

/* ============================================
   Toggle Switch
   ============================================ */
export const Toggle: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    className={`toggle ${checked ? 'toggle-on' : 'toggle-off'}`}
    onClick={() => !disabled && onChange(!checked)}
    type="button"
  >
    <span className="toggle-knob" />
  </button>
);

/* ============================================
   Section Header
   ============================================ */
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--surface-800)' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--surface-500)', marginTop: 2 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ============================================
   Emergency Banner
   ============================================ */
interface EmergencyBannerProps {
  label: string;
  onClick: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ label, onClick }) => {
  return (
    <button
      className="btn btn-md btn-danger btn-full"
      onClick={onClick}
      type="button"
      style={{ gap: 8 }}
    >
      <span style={{ position: 'relative', display: 'flex', width: 12, height: 12 }}>
        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: '#ffffff',
          opacity: 0.75,
          animation: 'pulse-scale 1.5s ease-in-out infinite',
        }} />
        <span style={{
          position: 'relative',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#ffffff',
        }} />
      </span>
      {label}
    </button>
  );
};

/* ============================================
   Error Boundary
   ============================================ */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <div className="error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-800)', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--surface-500)', marginBottom: 8, maxWidth: 300, textAlign: 'center' }}>
            An unexpected error occurred. Please try again.
          </p>
          {this.state.error && (
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--color-error)',
              background: 'var(--color-error-bg)',
              padding: '8px 16px',
              borderRadius: 8,
              marginBottom: 24,
              maxWidth: 300,
              wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </p>
          )}
          <button className="btn btn-md btn-primary" onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
