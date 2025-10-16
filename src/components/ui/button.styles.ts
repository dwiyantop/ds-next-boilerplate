import { tv } from 'tailwind-variants';

export const buttonStyles = tv({
  base: 'inline-flex items-center justify-center rounded-full px-6 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 shadow-sm',
  variants: {
    variant: {
      primary: 'bg-accent text-[#1f1a2d] shadow-lg shadow-accent/30 hover:bg-accent/90',
      secondary:
        'border border-foreground/15 bg-surface text-foreground hover:border-accent/40 hover:text-accent shadow-none',
      ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-foreground/5 shadow-none',
    },
    size: {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 text-sm',
      lg: 'h-12 px-8 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
