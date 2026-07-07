import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import sceneMission from "../../assets/scene-mission.jpeg";

export default function Mission() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.2]);

  const [clicks, setClicks] = useState(0);

  return (
    <section id="mission" ref={ref} className="relative h-screen min-h-[700px] w-full overflow-hidden">
      <motion.div
        style={{ y: bgY, scale: bgScale, backgroundImage: `url(${sceneMission})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center blur-[40px] opacity-80 saturate-200"
      />
      <motion.div
        style={{ y: bgY, scale: bgScale, backgroundImage: `url(${sceneMission})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-80 contrast-150 saturate-150"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(16,185,129,0.35)_100%)] pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/40 via-transparent to-background/30" />

      <div className="relative h-full flex items-center px-8 md:px-20">
        <motion.div
          onClick={() => setClicks(clicks + 1)}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{ rotateY: clicks * 360 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            opacity: { duration: 1 },
            y: { duration: 1 },
            rotateY: { duration: 0.9, ease: "easeInOut" }
          }}
          style={{ transformStyle: "preserve-3d", transformPerspective: 1200 }}
          className="max-w-lg cursor-pointer bg-[#111A13]/70 backdrop-blur-lg border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl hover:shadow-[0_20px_50px_-12px_rgba(34,197,94,0.3)]"
        >
          <div style={{ backfaceVisibility: "hidden", transform: "translateZ(1px)" }}>
            <div className="tracked text-primary mb-4">01 — Our Mission</div>
            <h2 className="font-display text-5xl md:text-7xl leading-[1.05]" style={{ color: "#ffffff" }}>
              Seamless data,<br /><em className="text-primary not-italic">effortlessly</em> extracted.
            </h2>
            <p className="mt-6 font-light leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              At our core, we exist to empower financial workflows through intelligent automation. By designing and developing AI that reads, parses, and understands invoices like a human accountant — we act as a quiet partner inside your business, surfacing the numbers that matter.
            </p>
            <a href="#advantages" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-colors tracked">
              Let's Build <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
