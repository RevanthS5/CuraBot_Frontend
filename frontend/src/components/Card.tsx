import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  hoverable = false,
  bordered = true,
}) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  const hoverClasses = hoverable ? 'transition-shadow hover:shadow-lg' : '';
  const borderClasses = bordered ? 'border border-gray-200' : '';
  const shadowClasses = 'shadow-sm';
  
  const cardClasses = `${baseClasses} ${hoverClasses} ${borderClasses} ${shadowClasses} ${className}`;

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card;
