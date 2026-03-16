/**
 * Premium Framer Motion Variants
 * Cinematic, smooth, and sophisticated animations
 */

// Easing curves - Apple-like smoothness
export const easings = {
  smooth: [0.16, 1, 0.3, 1],          // Primary easing - smooth and elegant
  spring: [0.34, 1.56, 0.64, 1],      // Subtle bounce
  snappy: [0.23, 1, 0.32, 1],         // Quick but smooth
  gentle: [0.25, 0.46, 0.45, 0.94],   // Very gentle
};

// Page transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.smooth,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
};

// Card animations with lift
export const cardVariants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: easings.snappy,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// Stagger container for lists
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Stagger items
export const staggerItem = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

// Fade in from direction
export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.smooth,
    },
  },
};

export const fadeInDown = {
  initial: {
    opacity: 0,
    y: -24,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.smooth,
    },
  },
};

export const fadeInLeft = {
  initial: {
    opacity: 0,
    x: -24,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: easings.smooth,
    },
  },
};

export const fadeInRight = {
  initial: {
    opacity: 0,
    x: 24,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: easings.smooth,
    },
  },
};

// Scale animations
export const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

// Sidebar animations
export const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  closed: {
    x: -280,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
};

// Nav item animations
export const navItemVariants = {
  initial: {
    opacity: 0,
    x: -16,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  hover: {
    x: 4,
    transition: {
      duration: 0.2,
      ease: easings.snappy,
    },
  },
};

// Upload zone animations
export const uploadZoneVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easings.smooth,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: easings.gentle,
    },
  },
  tap: {
    scale: 0.98,
  },
  processing: {
    opacity: 1,
    scale: [1, 1.02, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.gentle,
    },
  },
  success: {
    opacity: 1,
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      ease: easings.spring,
    },
  },
};

// Metric number animation
export const metricVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easings.spring,
    },
  },
};

// Glow pulse for important elements
export const glowPulse = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Modal/Drawer animations
export const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: easings.smooth,
    },
  },
};

// Backdrop
export const backdropVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Chart entrance
export const chartVariants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easings.smooth,
    },
  },
};

// Badge pop
export const badgeVariants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// Shimmer effect for loading states
export const shimmerVariants = {
  initial: {
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Button press
export const buttonVariants = {
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: easings.snappy,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
};

// Icon bounce
export const iconBounce = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      ease: easings.spring,
    },
  },
};

// Notification slide in
export const notificationVariants = {
  initial: {
    x: 400,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
};

// Tooltip
export const tooltipVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: easings.snappy,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: easings.snappy,
    },
  },
};
