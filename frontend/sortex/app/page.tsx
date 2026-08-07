"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  Recycle,
  Cpu,
  Layers,
  LineChart,
  ArrowRight,
  Phone,
  Mail,
  Boxes,
  Sparkles,
} from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-black font-sans relative overflow-x-hidden">
      {/* Ambient glow blobs — same treatment as login page */}
      <div className="pointer-events-none fixed -top-20 -left-20 w-[36rem] h-[36rem] bg-orange-600/20 rounded-full blur-[140px] z-0" />
      <div className="pointer-events-none fixed top-[20%] right-[15%] w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-[130px] z-0" />
      <div className="pointer-events-none fixed bottom-[25%] left-[25%] w-[32rem] h-[32rem] bg-orange-500/15 rounded-full blur-[150px] z-0" />
      <div className="pointer-events-none fixed -bottom-10 -right-10 w-[34rem] h-[34rem] bg-orange-600/15 rounded-full blur-[160px] z-0" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* NAV */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500 rounded-xl shadow-lg shadow-orange-900/40">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Sortex<span className="text-orange-400">AI</span>
          </h1>
        </div>

        <nav className="hidden sm:flex items-center gap-8 text-sm font-semibold text-neutral-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-900/30 transition-all"
        >
          Login <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-28 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Textile Recovery
        </span>
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight max-w-4xl">
          Sort smarter.<br />
          Recycle{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-200">
            better.
          </span>
        </h2>
        <p className="mt-8 text-neutral-400 text-lg max-w-2xl leading-relaxed">
          SortexAI helps recycling facilities, manufacturers, and sustainability teams
          classify, track, and recover textile waste with computer vision —
          turning every batch into measurable circularity.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-900/30 transition-all"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#about"
            className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-neutral-200 px-7 py-3.5 rounded-xl font-bold transition-all"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">About Us</span>
            <h3 className="text-4xl font-extrabold text-white mt-3 mb-6 leading-tight">
              Built for the people closing the loop on textile waste.
            </h3>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Every year, millions of tonnes of textile waste end up in landfills
              simply because sorting it at scale is slow, manual, and inconsistent.
              SortexAI was built to change that — giving recycling facilitators,
              manufacturers, and sustainability managers a shared, intelligent
              platform to classify fabric type, condition, and recyclability in
              seconds instead of hours.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              From a single photo to a full collection drive, our computer-vision
              pipeline scores every batch on circularity, recommends the right
              recovery pathway, and keeps a complete, exportable record — so
              facilities can move faster and report with confidence.
            </p>
          </div>

          <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
                <Cpu className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold">AI Material Analysis</h4>
                <p className="text-neutral-500 text-sm mt-1 leading-relaxed">
                  Instant fabric composition, condition, and pattern detection via computer vision.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
                <Boxes className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Batch Inventory Tracking</h4>
                <p className="text-neutral-500 text-sm mt-1 leading-relaxed">
                  Register, search, and manage waste batches across every source and condition.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
                <LineChart className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold">ESG Reporting</h4>
                <p className="text-neutral-500 text-sm mt-1 leading-relaxed">
                  Real-time circularity scores, recovery statistics, and exportable reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Features</span>
          <h3 className="text-4xl font-extrabold text-white mt-3">Everything at one place</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
            <Recycle className="w-6 h-6 text-orange-400 mb-4" />
            <h4 className="text-white font-bold mb-1.5">Recycling Recommendations — Waste In, Value Out</h4>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Tracks incoming waste inventory and turns it into clear recycling opportunities, processing analytics, and recovery statistics you can act on.
            </p>
          </div>
          <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
            <Layers className="w-6 h-6 text-orange-400 mb-4" />
            <h4 className="text-white font-bold mb-1.5">Sustainability Analytics — Your Impact, Quantified</h4>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Turns raw waste and recovery data into carbon reduction, ESG, and waste-diversion metrics you can report to stakeholders with confidence.
            </p>
          </div>
          <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
            <LineChart className="w-6 h-6 text-orange-400 mb-4" />
            <h4 className="text-white font-bold mb-1.5">Manufacturing Strategies — From Scrap to Strategy</h4>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Reveals where production waste is coming from and how to route it back into the circular economy for measurable material recovery gains.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT US */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-10 sm:p-14 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Contact Us</span>
          <h3 className="text-4xl font-extrabold text-white mt-3 mb-4">Let&apos;s talk circularity</h3>
          <p className="text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Have a question about onboarding your facility, or want a walkthrough of SortexAI?
            Reach out through any of the channels below.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+919580541901"
              className="flex items-center gap-3 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-200 px-6 py-3.5 rounded-xl font-semibold transition-all w-full sm:w-auto justify-center"
            >
              <Phone className="w-5 h-5 text-orange-400" />
              +91 95805 41901
            </a>
            <a
              href="https://instagram.com/sortexai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-200 px-6 py-3.5 rounded-xl font-semibold transition-all w-full sm:w-auto justify-center"
            >
              <InstagramIcon className="w-5 h-5 text-orange-400" />
              @adminsortexai
            </a>
            <a
              href="mailto:hello@sortexai.com"
              className="flex items-center gap-3 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-200 px-6 py-3.5 rounded-xl font-semibold transition-all w-full sm:w-auto justify-center"
            >
              <Mail className="w-5 h-5 text-orange-400" />
              hello@sortexai.com
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-10 flex items-center justify-center gap-2 text-sm text-neutral-600">
        <span>Made with</span>
        <span className="text-red-500">❤️</span>
        <span>by</span>
        <span className="font-semibold text-orange-400/80">JanKas</span>
      </footer>

      {/* FLOATING THEME TOGGLE — BOTTOM LEFT CORNER */}
      <ThemeToggle variant="floating" />
    </div>
  );
}