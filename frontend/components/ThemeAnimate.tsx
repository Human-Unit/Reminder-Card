'use client';

import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState, ReactNode } from 'react';

type ThemeAnimateProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
};

export default function ThemeAnimate({ 
  children, 
  className = "",
  ...props 
}: ThemeAnimateProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for mount to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme || resolvedTheme}
        className={className}
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        transition={{ 
          duration: 0.25, 
          ease: [0.22, 1, 0.36, 1]
        }}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}