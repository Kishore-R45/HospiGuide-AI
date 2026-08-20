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
  const sizeClasses = {
    sm: 'px-[14px] py-[6px] text-sm min-h-[36px]',
    md: 'px-[20px] py-[10px] text-[15px] min-h-[44px]',
    lg: 'px-[28px] py-[14px] text-base min-h-[52px]',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-primary hover:from-primary-500 hover:to-primary-400 hover:shadow-[0_6px_20px_rgba(13,148,136,0.35)]',
    secondary: 'bg-surface-100 text-surface-700 border border-surface-200 hover:bg-surface-200 hover:border-surface-300',
    ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-800',
    danger: 'bg-gradient-to-br from-error to-red-500 text-white shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)]',
    outline: 'bg-transparent border-2 border-primary-500 text-primary-700 hover:bg-primary-50',
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 relative overflow-hidden whitespace-nowrap select-none';
  const fullClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${fullClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex shrink-0">{icon}</span>
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
  const variantClasses = {
    default: 'bg-surface-0 border border-surface-200 shadow-card',
    elevated: 'bg-surface-0 border border-surface-100 shadow-lg',
    glass: 'bg-white/85 backdrop-blur-md border border-white/60 shadow-md',
  };
  const interactiveClasses = onClick ? 'cursor-pointer hover:border-primary-300 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200' : 'transition-all duration-200';

  return (
    <div
      className={`rounded-lg ${variantClasses[variant]} ${interactiveClasses} ${className}`}
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
  const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer select-none transition-all border border-surface-200 shrink-0 whitespace-nowrap h-7 active:scale-95 shadow-xs';
  const stateClasses = active 
    ? 'bg-primary-50 border-primary-400 text-primary-700 font-semibold' 
    : 'bg-surface-0 border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-primary-300 hover:text-primary-600';

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="flex items-center w-3.5 h-3.5 shrink-0 text-current">{icon}</span>}
      <span className="whitespace-nowrap">{label}</span>
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
    <div className="relative flex items-center w-full">
      {icon && <span className="absolute left-[14px] text-surface-400 pointer-events-none flex items-center">{icon}</span>}
      <input
        ref={ref}
        className={`w-full bg-surface-50 border-[1.5px] border-surface-200 rounded-md text-surface-800 text-[15px] leading-relaxed min-h-[52px] transition-all focus:border-primary-400 focus:ring-[3px] focus:ring-primary-500/12 focus:bg-surface-0 placeholder:text-surface-400 ${icon ? 'pl-[44px]' : 'px-[18px]'} ${rightElement ? 'pr-[48px]' : ''} py-[14px] ${className}`}
        {...props}
      />
      {rightElement && <span className="absolute right-[6px] flex items-center">{rightElement}</span>}
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

  const variantClasses = {
    info: 'bg-info text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none w-[calc(100%-32px)] max-w-[400px]">
      <div className={`px-5 py-3 rounded-md text-sm font-medium text-center pointer-events-auto animate-bounce shadow-lg ${variantClasses[variant]}`}>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface-0 rounded-xl shadow-xl w-full max-w-[400px] max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200" role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div className="p-5 flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-surface-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-100 flex items-center justify-center text-surface-500"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-5 pb-5">
          {children}
        </div>
        {footer && (
          <div className="px-5 pb-5 flex gap-2">
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
      <div className="fixed inset-0 bg-black/35 z-[900] animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[950] max-h-[80vh] rounded-t-xl overflow-y-auto bg-surface-0 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
        <div className="w-10 h-1 rounded-full bg-surface-300 mx-auto my-3" />
        {title && (
          <div className="px-6 pb-3">
            <h3 className="text-lg font-semibold text-surface-800">{title}</h3>
          </div>
        )}
        <div className="px-6 pb-8 max-h-[60vh] overflow-y-auto">
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
  const variantClasses = {
    available: 'bg-success-bg text-success border-success/20',
    soon: 'bg-warning-bg text-warning border-warning/20',
    unavailable: 'bg-surface-100 text-surface-500 border-surface-200',
  };
  const dotClasses = {
    available: 'bg-success animate-pulse',
    soon: 'bg-warning',
    unavailable: 'bg-surface-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-[0.01em] border shrink-0 whitespace-nowrap ${variantClasses[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[status]}`} />
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
    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 shrink-0 border-none outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-primary-500' : 'bg-surface-300'}`}
    onClick={() => !disabled && onChange(!checked)}
    type="button"
  >
    <span className={`absolute top-[2px] left-0 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
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
  <div className="flex items-center justify-between mb-3">
    <div>
      <h2 className="text-base font-bold text-surface-800">{title}</h2>
      {subtitle && <p className="text-[13px] color-surface-500 mt-0.5">{subtitle}</p>}
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
    <Button
      variant="danger"
      size="sm"
      fullWidth
      onClick={onClick}
      className="gap-2"
    >
      <span className="relative flex w-3 h-3">
        <span className="absolute inset-0 rounded-full bg-white opacity-75 animate-ping" />
        <span className="relative w-3 h-3 rounded-full bg-white" />
      </span>
      {label}
    </Button>
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
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-surface-50">
          <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center text-error mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-[15px] text-surface-500 mb-2 max-w-[300px] text-center">
            An unexpected error occurred. Please try again.
          </p>
          {this.state.error && (
            <p className="text-[13px] text-error bg-error-bg px-4 py-2 rounded-lg mb-6 max-w-[300px] break-words">
              {this.state.error.message}
            </p>
          )}
          <Button variant="primary" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
