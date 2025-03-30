import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  "rounded-card bg-surface p-6 transition-all",
  {
    variants: {
      variant: {
        default: "shadow-card hover:shadow-card-hover",
        flat: "border border-gray-200",
        elevated: "shadow-lg"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, className })}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card, cardVariants };