import { motion } from "framer-motion";
import { FileText, ScanLine, Code, CloudUpload, ArrowRight } from "lucide-react";

export function WorkflowAnimation() {
  const steps = [
    { icon: <FileText className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />, label: "PDF" },
    { icon: <ScanLine className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />, label: "OCR" },
    { icon: <Code className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />, label: "JSON" },
    { icon: <CloudUpload className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />, label: "SAP" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex items-center justify-between"
      >
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center">
            {/* Node */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ boxShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 15px rgba(16,185,129,0.3)", "0px 0px 0px rgba(16,185,129,0)"] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100"
              >
                {step.icon}
              </motion.div>
              <span className="font-semibold text-slate-700 text-sm md:text-base tracking-wide">
                {step.label}
              </span>
            </motion.div>

            {/* Arrow */}
            {idx < steps.length - 1 && (
              <div className="mx-2 md:mx-4 overflow-hidden flex-shrink-0">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: [0, 10, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.5 }}
                  className="text-slate-300"
                >
                  <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
