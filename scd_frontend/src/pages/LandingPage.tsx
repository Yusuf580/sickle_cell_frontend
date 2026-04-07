import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Microscope, ChevronRight, HeartPulse, Brain, ShieldCheck,
  Users, MapPin, FlaskConical, ArrowRight, Menu, X,
  Sparkles, BookOpen, Globe, Star, ChevronDown
} from "lucide-react";

// ── Smooth scroll helper ──────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ── Navbar ────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "About", id: "about" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Impact", id: "impact" },
    { label: "Team", id: "team" },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-100" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
            <Microscope className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-slate-800 text-base tracking-tight">SickleXAI</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
          >
            Try It Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 space-y-3">
          {links.map(l => (
            <button key={l.id} onClick={() => { scrollTo(l.id); setOpen(false); }}
              className="block w-full text-left text-slate-700 font-medium py-2">
              {l.label}
            </button>
          ))}
          <button onClick={() => navigate("/upload")}
            className="w-full py-3 rounded-full bg-emerald-500 text-white font-semibold text-sm mt-2">
            Try It Now →
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered · Explainable · Edge-Optimised
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-6">
          Detecting Sickle Cell<br />
          <span className="text-emerald-500">Smarter & Faster</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          A causal counterfactual AI system that analyses peripheral blood smears in seconds —
          bringing clinical-grade insights to resource-limited regions like Teso.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1"
          >
            <HeartPulse className="w-5 h-5" />
            Try It Now — Free
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            See How It Works <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { value: "94%+", label: "Model Accuracy" },
            { value: "< 5s", label: "Analysis Time" },
            { value: "XAI", label: "Explainable AI" },
          ].map(s => (
            <div key={s.label} className="bg-white/70 backdrop-blur rounded-2xl px-4 py-5 border border-white shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-xs">
        <span>Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}

// ── About Section ─────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-6 uppercase tracking-wide">
              <BookOpen className="w-3 h-3" /> About The Project
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-5">
              Bringing Precision Diagnostics to Every Clinic
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-5">
              Sickle Cell Disease (SCD) is a life-threatening genetic disorder affecting millions across
              Sub-Saharan Africa. Early, accurate detection is critical — but microscopy expertise is scarce
              and lab infrastructure is limited in rural regions.
            </p>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              SickleXAI combines a compact <strong className="text-slate-700">EfficientNetB0</strong> neural
              network with <strong className="text-slate-700">Grad-CAM</strong> and <strong className="text-slate-700">SHAP</strong> explainability
              tools. The system not only classifies blood smear images but also tells clinicians <em>why</em> — using
              causal counterfactual reasoning to highlight exactly which cellular features drove the decision.
            </p>
            <div className="flex flex-wrap gap-3">
              {["EfficientNetB0", "Grad-CAM", "SHAP", "Counterfactual XAI"].map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Image collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <img
                src="/28.jpg"
                alt="Sickle cell blood smear"
                className="rounded-2xl w-full h-48 object-cover shadow-md col-span-2"
              />
              <img
                src="scd.jpeg"
                alt="SCD world distribution"
                className="rounded-2xl w-full h-36 object-cover shadow-md"
              />
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 flex flex-col justify-center">
                <div className="text-3xl font-bold text-emerald-600">300M+</div>
                <div className="text-slate-500 text-sm mt-1">people carry the sickle cell trait globally</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: <FlaskConical className="w-6 h-6" />,
      color: "emerald",
      title: "Upload Blood Smear",
      desc: "Take a photo or upload an image of a peripheral blood smear from a microscope slide.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      color: "teal",
      title: "AI Classification",
      desc: "EfficientNetB0 analyses the image in under 5 seconds, classifying cells as sickle or normal.",
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      color: "sky",
      title: "Explainability Maps",
      desc: "Grad-CAM heatmaps and SHAP pixel importance maps reveal exactly what the model detected.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "indigo",
      title: "Clinical Report",
      desc: "A structured report with counterfactual explanations and suggested next clinical steps.",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600 border-emerald-200",
    teal: "bg-teal-100 text-teal-600 border-teal-200",
    sky: "bg-sky-100 text-sky-600 border-sky-200",
    indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
  };

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-5 uppercase tracking-wide">
            <FlaskConical className="w-3 h-3" /> The Process
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">How SickleXAI Works</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            From a simple photo to a full clinical report — in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-0" style={{ width: "calc(100% - 2.5rem)", left: "calc(50% + 1.5rem)" }} />
              )}
              <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 z-10">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[step.color]}`}>
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-slate-400 mb-2">STEP {i + 1}</div>
                <h3 className="text-slate-800 font-bold text-base mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture visual */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-slate-800 font-bold text-lg mb-6 text-center">Model Architecture</h3>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {[
              "Blood Smear Image", "→", "Preprocessing (224×224)", "→",
              "EfficientNetB0 Backbone", "→", "Classifier Head", "→",
              "SCD / Normal", "→", "Grad-CAM + SHAP XAI"
            ].map((node, i) => node === "→" ? (
              <ChevronRight key={i} className="w-4 h-4 text-slate-300 flex-shrink-0" />
            ) : (
              <div key={i} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium text-center text-xs whitespace-nowrap">
                {node}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Impact / Teso Section ─────────────────────────────────────────────
function Impact() {
  return (
    <section id="impact" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative order-2 md:order-1">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="scd2.jpeg"
                alt="Teso Region Uganda"
                className="w-full h-64 object-contain bg-emerald-50 p-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="text-2xl font-bold text-emerald-600">~30%</div>
                <div className="text-slate-500 text-xs mt-1">SCD trait prevalence in some Ugandan regions</div>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
                <div className="text-2xl font-bold text-teal-600">Rural</div>
                <div className="text-slate-500 text-xs mt-1">Areas lack specialist haematology services</div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold mb-6 uppercase tracking-wide">
              <MapPin className="w-3 h-3" /> Local Impact
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-5">
              Designed for Teso — Built for Africa
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-5">
              The Teso sub-region of eastern Uganda has one of the highest sickle cell trait carrier rates in
              East Africa. Yet most rural health centres operate without haematology specialists or
              expensive lab equipment.
            </p>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              SickleXAI is optimised to run on low-resource devices — making it viable for deployment at
              district hospitals, health centres, and community screening programmes. A smartphone camera,
              a basic microscope, and an internet connection is all that's needed.
            </p>
            <div className="space-y-3">
              {[
                { icon: <Users className="w-4 h-4" />, text: "Community health workers can operate it without specialist training" },
                { icon: <Globe className="w-4 h-4" />, text: "Works on low-bandwidth connections in remote areas" },
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Transparent AI decisions build clinician trust" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                    {item.icon}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Who Uses It ───────────────────────────────────────────────────────
function Users_() {
  const users = [
    {
      icon: <HeartPulse className="w-6 h-6" />,
      color: "emerald",
      title: "Clinicians & Nurses",
      desc: "Get rapid preliminary screening results with explainable AI confidence scores.",
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      color: "teal",
      title: "Lab Technicians",
      desc: "Augment manual microscopy with AI assistance for higher throughput.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      color: "sky",
      title: "Community Health Workers",
      desc: "Run point-of-care screening in villages without specialist knowledge.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      color: "indigo",
      title: "Researchers",
      desc: "Analyse datasets with full XAI outputs for academic and clinical research.",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
    teal: "bg-teal-50 border-teal-200 text-teal-600",
    sky: "bg-sky-50 border-sky-200 text-sky-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-5 uppercase tracking-wide">
            <Users className="w-3 h-3" /> Who It's For
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Built for People on the Ground</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            SickleXAI is designed to empower anyone working in health — no AI expertise needed.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {users.map((u, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[u.color]}`}>
                {u.icon}
              </div>
              <h3 className="text-slate-800 font-bold text-base mb-2">{u.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Team Section ──────────────────────────────────────────────────────
function Team() {
  const members = [
    {
      name: "Developer One",
      role: "AI / ML Engineer",
      desc: "Designed the EfficientNetB0 classification pipeline and XAI integration.",
      initials: "D1",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      name: "Developer Two",
      role: "Frontend & Systems Engineer",
      desc: "Built the React interface, backend API, and deployment infrastructure.",
      initials: "D2",
      color: "bg-teal-100 text-teal-700",
    },
  ];

  return (
    <section id="team" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-5 uppercase tracking-wide">
            <Star className="w-3 h-3" /> The Team
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet the Builders</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            A two-person team combining machine learning and software engineering to tackle a real health challenge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {members.map((m, i) => (
            <div key={i} className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-all">
              <div className={`w-16 h-16 rounded-2xl ${m.color} flex items-center justify-center text-2xl font-bold mb-5`}>
                {m.initials}
              </div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">{m.role}</div>
              <h3 className="text-slate-900 font-bold text-xl mb-3">{m.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* University badge */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200">
            <BookOpen className="w-5 h-5 text-slate-500" />
            <div className="text-left">
              <div className="text-xs text-slate-400 font-medium">Class Project</div>
              <div className="text-slate-700 font-semibold text-sm">Causal Counterfactual Explainability for SCD Detection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────
function CTABanner() {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <HeartPulse className="w-12 h-12 text-white/80 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Analyse a Blood Smear?</h2>
        <p className="text-emerald-100 text-lg mb-8 max-w-lg mx-auto">
          Upload an image now and receive a full AI-powered report with explainability insights — completely free.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-emerald-600 font-bold text-base hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1"
        >
          Start Analysis <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Microscope className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-bold">SickleXAI</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Causal Counterfactual Explainability for Sickle Cell Disease Detection via Edge-Optimised CNNs.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            {[
              { label: "About", id: "about" },
              { label: "How It Works", id: "how-it-works" },
              { label: "Impact", id: "impact" },
              { label: "Team", id: "team" },
            ].map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className="hover:text-emerald-400 transition-colors">
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2024 SickleXAI. Class project — not a medical device. Always consult a clinician.</p>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-emerald-400 font-medium ml-1">EfficientNetB0 · Grad-CAM · SHAP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Export ───────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Impact />
      <Users_ />
      <Team />
      <CTABanner />
      <Footer />
    </div>
  );
}
