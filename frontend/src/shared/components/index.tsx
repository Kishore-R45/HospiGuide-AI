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
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-surface-950 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40',
    secondary: 'bg-surface-700/80 text-surface-100 hover:bg-surface-600/80 border border-surface-600/50',
    ghost: 'bg-transparent text-surface-300 hover:bg-surface-800/60 hover:text-surface-100',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-600/25',
    outline: 'bg-transparent border-2 border-primary-500/60 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-base min-h-[44px]',
    lg: 'px-8 py-3.5 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
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
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  animate = false,
}) => {
  const variants = {
    default: 'bg-surface-800/60 border border-surface-700/50 rounded-[var(--radius-lg)]',
    glass: 'glass-card rounded-[var(--radius-lg)]',
    elevated: 'bg-surface-800/80 border border-surface-700/40 rounded-[var(--radius-lg)] shadow-elevated',
  };

  return (
    <div
      className={`${variants[variant]} ${onClick ? 'cursor-pointer hover:border-primary-500/30 transition-all duration-300' : ''} ${animate ? 'animate-fade-in-up' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
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
  variant?: 'default' | 'outline';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  onClick,
  active = false,
  variant = 'default',
}) => {
  const base = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-full)] text-sm font-medium transition-all duration-300 cursor-pointer select-none active:scale-95 min-h-[44px]';
  const styles = {
    default: active
      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
      : 'bg-surface-700/60 text-surface-300 border border-surface-600/40 hover:bg-surface-600/60 hover:text-surface-100',
    outline: active
      ? 'bg-primary-500/10 text-primary-400 border-2 border-primary-500/50'
      : 'bg-transparent text-surface-400 border-2 border-surface-600/40 hover:border-surface-500/60 hover:text-surface-200',
  };

  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
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
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3.5 text-surface-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`w-full bg-surface-800/70 border border-surface-600/50 rounded-[var(--radius-md)] text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all duration-300 ${icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} py-3 text-base min-h-[48px] ${className}`}
        {...props}
      />
      {rightElement && (
        <span className="absolute right-2">{rightElement}</span>
      )}
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
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  variant = 'info',
}) => {
  if (!visible) return null;

  const variants = {
    info: 'bg-primary-600/90 text-white',
    success: 'bg-green-600/90 text-white',
    warning: 'bg-amber-600/90 text-white',
    error: 'bg-red-600/90 text-white',
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-[var(--radius-full)] backdrop-blur-lg text-sm font-medium shadow-elevated animate-fade-in-down ${variants[variant]}`}>
      {message}
    </div>
  );
};

/* ============================================
   Floating Action Button
   ============================================ */
interface FABProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  onClick,
  label,
  variant = 'primary',
  className = '',
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-500/50',
    secondary: 'bg-surface-700/90 text-surface-200 border border-surface-600/50 hover:bg-surface-600/90 backdrop-blur-md',
  };

  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-[var(--radius-full)] transition-all duration-300 active:scale-95 min-w-[48px] min-h-[48px] ${label ? 'px-5 py-3' : 'w-12 h-12'} ${variants[variant]} ${className}`}
      onClick={onClick}
      title={label}
    >
      {icon}
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
};

/* ============================================
   Bottom Sheet
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
  if (!isOpen) return null;

  return (
    <>
      <div className="bottom-sheet-overlay animate-fade-in" onClick={onClose} />
      <div className="bottom-sheet glass-card animate-slide-up">
        <div className="bottom-sheet-handle" />
        {title && (
          <div className="px-6 pb-3">
            <h3 className="text-lg font-semibold text-surface-100">{title}</h3>
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
  const styles = {
    available: 'bg-green-500/15 text-green-400 border-green-500/30',
    soon: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    unavailable: 'bg-surface-600/30 text-surface-400 border-surface-600/40',
  };

  const dotStyles = {
    available: 'bg-green-400',
    soon: 'bg-amber-400',
    unavailable: 'bg-surface-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]} ${status === 'available' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
};

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
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600/90 to-red-500/90 text-white font-semibold text-sm rounded-[var(--radius-md)] hover:from-red-500/90 hover:to-red-400/90 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-red-600/20 min-h-[44px]"
      onClick={onClick}
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
      </span>
      {label}
    </button>
  );
};

/* ============================================
   Section Header
   ============================================ */
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-bold text-surface-100">{title}</h2>
      {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

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
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${checked ? 'bg-primary-500' : 'bg-surface-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={() => !disabled && onChange(!checked)}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);
