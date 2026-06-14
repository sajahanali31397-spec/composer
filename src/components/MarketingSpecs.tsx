import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  ShoppingBag, 
  GraduationCap, 
  Map, 
  ShieldCheck, 
  X, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  HeartHandshake, 
  Database,
  CloudLightning,
  Sparkles
} from 'lucide-react';

// Use Cases Component
export const UseCasesSection: React.FC = () => {
  const cases = [
    {
      icon: <Building className="text-blue-400" size={24} />,
      title: "Government Portals",
      desc: "Upload secure PAN cards, Aadhaar, паспорта or passport scans down to 100 KB or 300 KB limits. Our text-preservation grid maintains clear ID numbers and official rubber stamps seamlessly."
    },
    {
      icon: <Briefcase className="text-blue-400" size={24} />,
      title: "Job Applications",
      desc: "Squeeze multi-megabyte PDF portfolios and multi-page professional resumes down to exact applicant portal bounds (usually under 200 KB) with absolute structural typography preservation."
    },
    {
      icon: <ShoppingBag className="text-blue-400" size={24} />,
      title: "E-Commerce Merchants",
      desc: "Slickly batch convert catalog photos to next-gen WebP formatting. Lighten page loading speeds to double conversion rates and maximize Google Lighthouse SEO rankings."
    },
    {
      icon: <GraduationCap className="text-blue-400" size={24} />,
      title: "Academic Submissions",
      desc: "Downsize high-res research models, sketches, or hand-written thesis pages. Retain crucial notation sharpness for server portals and professors."
    },
    {
      icon: <CloudLightning className="text-blue-400" size={24} />,
      title: "Professional Distribution",
      desc: "Squeeze legal deeds, design proofs, blueprints or brochures to lightweight levels. Send batches via WhatsApp, email, or Slack instantly without memory storage overhead."
    }
  ];

  return (
    <div id="use-cases-grid-wrapper" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((c, i) => (
        <div 
          key={i} 
          id={`use-case-card-${i}`}
          className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
              {c.icon}
            </div>
            <h4 className="font-display font-medium text-lg leading-snug mb-2 text-white">{c.title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">{c.desc}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 font-medium">
            <span>Verified Target KB Compliant</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Comparison Table Component
export const ComparisonTable: React.FC = () => {
  const metrics = [
    { 
      feature: "Target File-Size Control", 
      anti: "Exact KB Target (e.g., set precisely 99 KB)", 
      typical: "Vague quality sliders (pray it reaches target size)", 
      highlight: true 
    },
    { 
      feature: "QR & Barcode Safelight", 
      anti: "Adaptive pixel thresh filter preserves crisp scannability", 
      typical: "Blurry corner squares, failing scanner reads", 
      highlight: true 
    },
    { 
      feature: "Privacy & Data Leak Security", 
      anti: "100% Client-side RAM processing (Files never leave device)", 
      typical: "Uploaded to central servers, risk of leakage", 
      highlight: true 
    },
    { 
      feature: "Official Document Stamps", 
      anti: "Fine signature line preservation & seals boosting", 
      typical: "Fuzzy borders, muddy numbers, loss of validation", 
      highlight: false 
    },
    { 
      feature: "Multi-Format Conversions", 
      anti: "Batch PNG, JPG, WebP & PDF vice versa dynamically", 
      typical: "Paywalled converter tabs, watermarked PDFs", 
      highlight: false 
    },
    { 
      feature: "Processing Limits", 
      anti: "Completely unlimited (No limits, up to 500 MB per file)", 
      typical: "2-file restriction unless premium subscripted", 
      highlight: false 
    },
  ];

  return (
    <div id="comparison-table-wrapper" className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
      <table className="w-full text-left border-collapse min-w-[600px] text-sm font-sans">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="p-4 font-display font-medium text-gray-300">CORE METRIC</th>
            <th className="p-4 font-display font-medium text-blue-400 flex items-center gap-1.5">
              <span>ANTIGRAVITY</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded uppercase font-mono font-bold">100% Local</span>
            </th>
            <th className="p-4 font-display font-medium text-gray-400 text-opacity-80">TYPICAL ONLINE COMPRESSORS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {metrics.map((row, i) => (
            <tr 
              key={i} 
              id={`comp-row-${i}`}
              className={`hover:bg-white/2 transition-colors ${row.highlight ? 'bg-blue-500/[0.03]' : ''}`}
            >
              <td className="p-4 font-medium text-gray-300">{row.feature}</td>
              <td className="p-4 text-blue-300 font-medium flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>{row.anti}</span>
              </td>
              <td className="p-4 text-gray-500 flex items-center gap-2">
                <X size={16} className="text-rose-500 shrink-0" />
                <span>{row.typical}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Privacy Pledge Component
export const PrivacyPledge: React.FC = () => {
  return (
    <div id="privacy-pledge-panel" className="relative p-8 md:p-10 rounded-3xl border border-dashed border-blue-500/30 bg-blue-950/10 overflow-hidden text-sm font-sans">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

      <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
        <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-inner shrink-0 text-blue-400">
          <Lock size={36} id="privacy-lock-icon" />
        </div>
        
        <div>
          <h4 className="font-display font-medium text-xl text-white mb-2 flex items-center gap-2">
            <span>Our Bank-Grade Zero-Server Privacy Pledge</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">Secure Sandbox</span>
          </h4>
          <p className="text-gray-400 leading-relaxed mb-4 text-base">
            We believe that military cards, signatures, scan indexes, ID certificates, and balance statement files should **never** touch a remote server database.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="flex items-center gap-2 bg-white/2 p-2.5 rounded-lg border border-white/5">
              <Database size={16} className="text-blue-400 shrink-0" />
              <span className="text-gray-300">Processed solely in local RAM</span>
            </div>
            <div className="flex items-center gap-2 bg-white/2 p-2.5 rounded-lg border border-white/5">
              <HeartHandshake size={16} className="text-blue-400 shrink-0" />
              <span className="text-gray-300">No telemetry or logs saved</span>
            </div>
            <div className="flex items-center gap-2 bg-white/2 p-2.5 rounded-lg border border-white/5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span className="text-gray-300">100% Offline processing safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// FAQ Component
export const FAQSection: React.FC = () => {
  const faqs = [
    {
      q: "What is the absolute maximum file size I can load?",
      a: "Because Antigravity executes entirely in the browser using the capabilities of your local RAM, we technically support file uploads up to 500 MB per file. This eliminates waiting on slow server upload queues or bandwidth throttling bottlenecks."
    },
    {
      q: "Will my compressed QR, barcode, or signature break?",
      a: "Never. With our unique 'QR & Government Docs' mode toggled, the engine uses dynamic segment contrast stretching and adaptive high-contrast luminance binarization. This locks black dots and signatures to crisp margins and prevents color bleed, ensuring QR readers and passport portals parse them perfectly."
    },
    {
      q: "Can I convert multi-page PDFs to image files?",
      a: "Yes! Antigravity supports dual bidirectional conversion. You can easily bundle a batch sequence of JPG/PNG/WebP images into a single formatted PDF file, or load multi-page PDFs to optimize streams down to smaller dimensions for government file registries."
    },
    {
      q: "How does the 'Magic' target KB compressor work?",
      a: "We deploy an iterative dynamic double-point bisection algorithm. The application repeatedly calculates different output variables on a rapid sub-frame canvas: if resizing under 100 KB exceeds standard quality limits, we scale down coordinates and sharpen lines automatically to land precisely below your exact target KB limit (e.g. 50 KB or 100 KB) with maximum fidelity."
    },
    {
      q: "Is there any cost for batch folders processing?",
      a: "Our core compression suite, format converting, document sharpening, and crop instruments are completely free, and files never leave your client-side workspace. We offer a fictional Antigravity 'Pro' upgrade card to acknowledge heavy power-users who want automation folders batching."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div id="faq-accordions-group" className="space-y-4 max-w-4xl mx-auto font-sans">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div 
            key={i} 
            id={`faq-node-${i}`}
            className="glass-panel rounded-2xl overflow-hidden border border-white/5 transition-all duration-200"
          >
            <button
              id={`btn-toggle-faq-${i}`}
              onClick={() => toggle(i)}
              className="w-full text-left p-5 flex items-center justify-between font-display font-medium text-gray-200 hover:text-white hover:bg-white/2 transition-colors gap-4 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={16} className="text-blue-400 shrink-0" />
                <span>{faq.q}</span>
              </span>
              {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {isOpen && (
              <div id={`faq-panel-body-${i}`} className="p-5 pt-0 border-t border-white/5 bg-white/1 text-sm text-gray-400 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
