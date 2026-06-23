import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

import { WorkflowAnimation } from "./WorkflowAnimation";
import { FeatureStats } from "./FeatureStats";
import { FloatingStar, FloatingLightning } from "./FloatingShapes";
import { SolidReceiptIcon } from "../Icons";

export function HeroSection() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (isSignedIn) navigate("/dashboard");
    else navigate("/sign-in");
  };

  return (
    <section className="relative min-h-screen w-full bg-emerald-500 flex items-center justify-center py-24 px-4 overflow-hidden pt-32">
      {/* Decorative background gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-7xl min-h-[75vh] bg-[#F3F4F6] rounded-[32px] shadow-2xl overflow-hidden p-8 md:p-12 lg:p-16 flex flex-col"
      >
        {/* Glassmorphism subtle overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none" />

        {/* Floating Shapes */}
        <FloatingStar className="top-[15%] left-[5%] md:left-[10%] w-12 h-12 text-slate-800" />
        <FloatingLightning className="top-[40%] right-[5%] md:right-[10%] w-12 h-12 text-slate-800" />

        {/* Card Header (Logo) */}
        <div className="relative z-20 flex justify-center w-full mb-12">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white shadow-lg">
              <SolidReceiptIcon />
            </span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Invoice<span className="text-emerald-600">OCR</span>
            </span>
          </div>
        </div>

        {/* Card Body - Two Columns on Desktop */}
        <div className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 w-full">
          
          {/* Left Column - Text & CTAs */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium shadow-[0_0_15px_rgba(15,23,42,0.3)] mb-8"
            >
              <span>InvoiceOCR</span>
              <div className="flex gap-1 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>

            {/* Headlines */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Extract invoice data in <span className="text-emerald-600">seconds</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed mb-10 max-w-xl">
              Upload PDFs, convert them into structured JSON, and sync directly with SAP automatically.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px 5px rgba(16,185,129,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Right Column - Visual Workflow */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none flex items-center justify-center mt-8 lg:mt-0">
            <WorkflowAnimation />
          </div>

        </div>

        {/* Bottom Section - Feature Stats */}
        <div className="relative z-20 w-full mt-auto pt-8">
          <FeatureStats />
        </div>

      </motion.div>
    </section>
  );
}
