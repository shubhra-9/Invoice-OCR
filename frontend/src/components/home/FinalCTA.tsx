import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useAuth, useClerk } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import sceneCta from "../../assets/scene-cta.jpg";

export default function FinalCTA() {
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
