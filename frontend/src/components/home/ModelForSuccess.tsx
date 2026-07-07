import { motion } from "framer-motion";

export default function ModelForSuccess() {
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
