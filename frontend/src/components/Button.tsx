import React, { forwardRef, ComponentPropsWithRef } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string; // Add className to base props
};

// For regular buttons
export type ButtonProps = ButtonBaseProps & 
  ComponentPropsWithRef<'button'> & {
    href?: undefined;
    to?: undefined;
    as?: undefined;
  };

// For Link components
type ButtonLinkProps = ButtonBaseProps & {
  to: string;
  href?: undefined;
  as?: typeof Link;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>;

// For anchor elements
type ButtonAnchorProps = ButtonBaseProps & {
  href: string;
  to?: undefined;
  as?: undefined;
} & Omit<React.ComponentPropsWithoutRef<'a'>, 'className'>;

// For custom components
type ButtonAsProps = ButtonBaseProps & {
  as: React.ElementType;
  href?: string;
  to?: string;
} & React.ComponentPropsWithoutRef<'button'>;

export type ButtonAllProps = ButtonProps | ButtonLinkProps | ButtonAnchorProps | ButtonAsProps;

const Button = forwardRef<HTMLButtonElement, ButtonAllProps>((props, ref) => {
  const {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    ...rest
  } = props;

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    secondary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 underline focus:ring-0',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
  };
  
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = 'disabled' in rest && rest.disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;
  
  const content = (
    <>
      {isLoading && (
        <LoadingSpinner 
          size="sm" 
          color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} 
          className="mr-2"
        />
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );
  
  // For custom component
  if ('as' in rest && rest.as) {
    const { as: Component, ...otherProps } = rest;
    return <Component className={buttonClasses} {...otherProps}>{content}</Component>;
  }
  
  // For react-router Link
  if ('to' in rest && rest.to) {
    return (
      <Link to={rest.to} className={buttonClasses} {...(rest as any)}>
        {content}
      </Link>
    );
  }
  
  // For anchor tag
  if ('href' in rest && rest.href) {
    return (
      <a href={rest.href} className={buttonClasses} {...(rest as any)}>
        {content}
      </a>
    );
  }
  
  // Default button
  return (
    <button 
      ref={ref} 
      className={buttonClasses} 
      disabled={('disabled' in rest && rest.disabled) || isLoading} 
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
