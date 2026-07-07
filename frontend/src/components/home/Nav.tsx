import { useState } from "react";
import { Triangle, Menu, X } from "lucide-react";

export default function Nav() {
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
