import { Triangle } from "lucide-react";

export default function Footer() {
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
