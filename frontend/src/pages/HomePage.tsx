import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Triangle, ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth, useClerk } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import "../lovable.css";
import { HeroSection } from "../components/home/HeroSection";
import sceneMission from "../assets/scene-mission.jpeg";
import sceneAdvantages from "../assets/scene-advantages.jpeg";
import sceneCta from "../assets/scene-cta.jpg";

export default function HomePage() {
  return (
    <div className="lovable-theme h-full min-h-screen">
      <main className="relative isolate text-foreground overflow-x-hidden">
        <Nav />
        <HeroSection />
        <IdentityCardSection />
        <Mission />
        <Advantages />
        <ModelForSuccess />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-6 md:px-12 lg:px-20 py-4 md:py-6 bg-background/40 backdrop-blur-md border-b border-foreground/5">
        <div className="mx-auto max-w-7xl flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-8">
          <nav className="hidden md:flex items-center gap-8 tracked text-foreground/85">
            <a href="#mission" className="hover:text-primary transition-colors">Our Story</a>
            <a href="#advantages" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#model" className="hover:text-primary transition-colors">Clients</a>
          </nav>
          
          <a href="#" className="justify-self-center group z-50">
            <Triangle className="w-7 h-7 fill-foreground/90 text-foreground/90 group-hover:fill-primary group-hover:text-primary transition-colors" />
          </a>
          
          <nav className="hidden md:flex items-center justify-end gap-8 tracked text-foreground/85">
            {/* Right side navigation reserved for future links */}
          </nav>

          <button 
            className="md:hidden relative z-50 text-foreground p-2 -mr-2 hover:bg-foreground/5 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-32 px-8 flex flex-col gap-8 md:hidden transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <a href="#mission" onClick={() => setIsOpen(false)} className="text-4xl font-display text-foreground hover:text-primary transition-colors">Our Story</a>
        <a href="#advantages" onClick={() => setIsOpen(false)} className="text-4xl font-display text-foreground hover:text-primary transition-colors">Solutions</a>
        <a href="#model" onClick={() => setIsOpen(false)} className="text-4xl font-display text-foreground hover:text-primary transition-colors">Clients</a>
        
        <div className="mt-8 pt-8 border-t border-foreground/10 flex flex-col gap-4">
          {/* We can add mobile specific auth/cta links here if needed */}
        </div>
      </div>
    </>
  );
}

function Mission() {
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

function AdvantageCard({ it, i }: { it: any, i: number }) {
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

/* ---------- ADVANTAGES ---------- */
function Advantages() {
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

/* ---------- MODEL FOR SUCCESS ---------- */
function ModelForSuccess() {
  return (
    <section id="model" className="relative py-32 px-8 md:px-20 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid md:grid-cols-[1fr_2fr] gap-16"
        >
          <div>
            <div className="tracked text-primary mb-4">03 — Model For Success</div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              A measured approach to chaos.
            </h2>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="font-display text-2xl mb-3">Attentiveness as a Priority.</h3>
              <p className="text-foreground/75 font-light leading-relaxed">
                Your invoices are important to us. Once we lock things off, you'll receive updates on every parsed batch, every flagged exception, and every reconciled vendor — so nothing slips through the cracks during a close.
              </p>
            </div>
            <div>
              <h3 className="font-display text-2xl mb-3">Crafted, not generated.</h3>
              <p className="text-foreground/75 font-light leading-relaxed">
                We've trained custom models against millions of real-world documents — across vendors, languages, and formats — so the data we hand back to you reads like it was entered by your most careful bookkeeper.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (isSignedIn) navigate("/dashboard");
    else navigate("/sign-in");
  };

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      await signOut();
    }
    navigate("/sign-in");
  };

  return (
    <section id="cta" ref={ref} className="relative h-screen min-h-[700px] w-full overflow-hidden">
      <motion.div
        style={{ y: bgY, scale: bgScale, backgroundImage: `url(${sceneCta})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center blur-[40px] opacity-80 saturate-200"
      />
      <motion.div
        style={{ y: bgY, scale: bgScale, backgroundImage: `url(${sceneCta})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-80 contrast-150 saturate-150"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(16,185,129,0.35)_100%)] pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/20 to-background/50" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="relative h-full flex flex-col items-center justify-center text-center px-6"
      >
        <div className="bg-[#111A13]/50 backdrop-blur-lg border border-white/10 p-10 md:p-14 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col items-center">
          <div className="tracked mb-6" style={{ color: "rgba(255,255,255,0.8)" }}>Ready when you are</div>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] drop-shadow-2xl" style={{ color: "#ffffff" }}>
              Automate your <em className="text-primary not-italic">workflow.</em>
          </h2>
          <div className="mt-8 max-w-lg">
            <p className="font-light" style={{ color: "rgba(255,255,255,0.9)" }}>
              Create a free repository, upload your first invoice, and watch every line item digitize itself.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button onClick={handleGetStarted} className="inline-flex items-center gap-2 px-7 py-3 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-colors tracked cursor-pointer">
            Create a Free Repository <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleSignIn} className="inline-flex items-center gap-2 px-7 py-3 border border-white/40 text-white rounded-full hover:bg-white hover:text-black transition-colors tracked cursor-pointer">
            Sign In
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-foreground/10 py-10 px-8 md:px-20 bg-background relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 tracked text-foreground/60">
        <div className="flex items-center gap-3">
          <Triangle className="w-3.5 h-3.5 fill-foreground/80 text-foreground/80" />
          <span>Invoice·OCR</span>
        </div>
        <p>© {new Date().getFullYear()} — All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ---------- IDENTITY CARD ---------- */
function IdentityCardSection() {
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
