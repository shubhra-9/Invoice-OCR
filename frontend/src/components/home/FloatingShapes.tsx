import { motion } from "framer-motion";

export function FloatingStar({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ 
        y: [-15, 15, -15], 
        rotate: [-10, 10, -10],
        scale: [0.95, 1.05, 0.95]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`absolute z-10 text-slate-800 ${className}`}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    </motion.div>
  );
}

export function FloatingLightning({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ 
        y: [15, -15, 15], 
        rotate: [10, -10, 10],
        scale: [1.05, 0.95, 1.05]
      }}
      transition={{ 
        duration: 7, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`absolute z-10 text-slate-800 ${className}`}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    </motion.div>
  );
}
