import { motion } from "framer-motion";
import { useRef } from "react";
import sceneCta from "../../assets/scene-cta.jpg";

export default function IdentityCardSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-4 md:px-20 bg-primary flex items-center justify-center min-h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-6xl aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] bg-background rounded-[2rem] md:rounded-[3rem] relative overflow-hidden flex flex-col items-center justify-center p-8 md:p-12 shadow-2xl border border-black/5"
      >
        {/* Top Pill */}
        <div className="absolute top-8 md:top-12 bg-foreground text-background px-5 py-2.5 rounded-full flex items-center gap-4 text-sm md:text-base font-medium shadow-lg z-20">
          <span>InvoiceOCR</span>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-background/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-background/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-background/60" />
          </div>
        </div>

        {/* Sparkle Left */}
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[5%] md:left-[15%] top-[15%] md:top-[25%] text-foreground z-20"
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-28 md:h-28 drop-shadow-xl">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </motion.div>

        {/* Zap Right */}
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [5, -5, 5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[5%] md:right-[15%] bottom-[20%] md:bottom-[35%] text-foreground z-20"
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-28 md:h-28 drop-shadow-xl">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>
        </motion.div>

        {/* Main Text */}
        <div className="flex flex-col items-center z-10 mt-12 md:mt-0 w-full px-4">
          <h2 className="font-climax text-[18vw] md:text-[13rem] leading-[0.85] text-black text-center drop-shadow-sm">
            INVOICE
            <br />
            OCR
          </h2>

          {/* Center Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden mt-8 md:mt-12 shadow-2xl relative z-30 ring-8 ring-background"
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
            <img src={sceneCta} alt="Invoice OCR" className="w-full h-full object-cover grayscale contrast-125" />
          </motion.div>
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 text-foreground font-bold text-2xl md:text-5xl font-sans tracking-tight z-20">
          ©2026
        </div>


      </motion.div>
    </section>
  );
}
