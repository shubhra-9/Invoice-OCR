import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import sceneAdvantages from "../../assets/scene-advantages.jpeg";

/* ---------- ADVANTAGE CARD ---------- */

function AdvantageCard({ it, i }: { it: { n: string; title: string; desc: string }, i: number }) {
  const [clicks, setClicks] = useState(0);

  return (
    <motion.div
      onClick={() => setClicks(clicks + 1)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      animate={{ rotateY: clicks * 360 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        opacity: { duration: 0.8, delay: i * 0.1 },
        y: { duration: 0.8, delay: i * 0.1 },
        rotateY: { duration: 0.9, ease: "easeInOut" }
      }}
      style={{ transformStyle: "preserve-3d", transformPerspective: 1200 }}
      className="relative p-8 rounded-3xl cursor-pointer bg-[#2A111A]/70 backdrop-blur-lg transition-all duration-500 hover:-translate-y-3 group shadow-xl hover:shadow-[0_20px_50px_-12px_rgba(226,62,87,0.4)] border border-white/5 hover:border-white/20"
    >
      <div style={{ backfaceVisibility: "hidden", transform: "translateZ(1px)" }}>
        <div className="font-display text-3xl text-primary/80 group-hover:text-primary transition-colors mb-2">{it.n}</div>
        <h3 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "#10b981" }}>{it.title}</h3>
        <p className="font-light leading-relaxed max-w-md" style={{ color: "rgba(255, 255, 255, 0.8)" }}>{it.desc}</p>
      </div>
    </motion.div>
  );
}

/* ---------- ADVANTAGES SECTION ---------- */

export default function Advantages() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);

  const items = [
    { n: "01", title: "Smart OCR", desc: "Pixel-perfect text recognition across PDFs, scans, and photos — every line item captured." },
    { n: "02", title: "AI Understanding", desc: "Totals, taxes, and vendors parsed in context, not just transcribed." },
    { n: "03", title: "Smart Repositories", desc: "Auto-categorized, searchable archives ready for tax season or audits." },
    { n: "04", title: "Enterprise Security", desc: "Encrypted at rest, audited end-to-end, with seamless SSO authentication." },
  ];

  return (
    <section id="advantages" ref={ref} className="relative min-h-screen w-full overflow-hidden py-32">
      <motion.div
        style={{ y: bgY, backgroundImage: `url(${sceneAdvantages})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center blur-[40px] opacity-70 saturate-200"
      />
      <motion.div
        style={{ y: bgY, backgroundImage: `url(${sceneAdvantages})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-80 contrast-150 saturate-150"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(16,185,129,0.35)_100%)] pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/10 to-background/40" />

      <div className="relative px-8 md:px-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="max-w-2xl bg-[#2A111A]/70 backdrop-blur-lg border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(226,62,87,0.4)]"
        >
          <div className="tracked text-primary mb-4">02 — Our Advantages</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[1.05]" style={{ color: "#10b981" }}>
            Built for teams that ship clean books.
          </h2>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {items.map((it, i) => (
            <AdvantageCard key={it.n} it={it} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
