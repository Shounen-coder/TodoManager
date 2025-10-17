import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

// Props for the Button component
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  icon?: React.ReactNode;
}

// Reusable Button Component with loading state and variant styles
const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  className,
  ...props
}) => {
  const baseStyles = 'flex-row items-center justify-center rounded-lg px-6 py-3 min-h-[48px]';
  
  const variantStyles = {
    primary: 'bg-accent',
    secondary: 'bg-bg-secondary border-2 border-text-secondary',
    danger: 'bg-error',
  };

  const textStyles = {
    primary: 'text-bg-primary font-semibold text-base',
    secondary: 'text-text-primary font-semibold text-base',
    danger: 'text-white font-semibold text-base',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className || ''}`}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? '#d1d0c5' : '#323437'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text className={textStyles[variant]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(Button);
