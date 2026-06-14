// High-contrast, offline-capable SVG data-URLs representing common files for instant compression testing.
export interface SampleDoc {
  name: string;
  type: string;
  size: number; // Simulated original size in bytes
  url: string;
}

// Helper to wrap SVG in encoded base64
const svgToDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};

export const sampleDocs: SampleDoc[] = [
  {
    name: "official_id_card_scan.png",
    type: "image/png",
    size: 2457600, // 2.4 MB simulated
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="100%" height="100%" fill="#0a0f1d" rx="24" stroke="#1d4ed8" stroke-width="4"/>
        <defs>
          <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#090514"/>
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#card-grad)" rx="24"/>
        <rect width="100%" height="100%" fill="url(#grid)" rx="24"/>
        
        <!-- Header Banner -->
        <rect x="30" y="30" width="740" height="65" rx="12" fill="#1e293b" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
        <circle cx="70" cy="62" r="18" fill="#3b82f6"/>
        <path d="M 62 68 L 70 54 L 78 68 Z" fill="#ffffff"/>
        <text x="105" y="61" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="bold" font-size="20" fill="#ffffff" letter-spacing="1">FEDERAL REPUBLIC CITIZEN CARD</text>
        <text x="105" y="77" font-family="sans-serif" font-size="10" fill="#94a3b8" letter-spacing="2">OFFICIAL ELECTRONIC IDENTITY DOCUMENT</text>
        
        <!-- Photo Frame -->
        <rect x="50" y="130" width="200" height="250" rx="16" fill="#1e293b" stroke="#1e4ed8" stroke-width="3"/>
        <!-- Face Outline sketch -->
        <ellipse cx="150" cy="220" rx="55" ry="70" fill="#334155"/>
        <ellipse cx="150" cy="180" rx="35" ry="40" fill="#64748b"/>
        <circle cx="150" cy="285" r="50" fill="#475569"/>
        <text x="150" y="360" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#60a5fa">DOCUMENT PHOTO</text>
        
        <!-- Document credentials details -->
        <text x="280" y="160" font-family="sans-serif" font-size="11" fill="#94a3b8">FULL NAME OF BEARER</text>
        <text x="280" y="185" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="bold" font-size="18" fill="#ffffff">ALEXANDER D. SMITH-CHEVREUX</text>
        
        <text x="280" y="225" font-family="sans-serif" font-size="11" fill="#94a3b8">CITIZENSHIP IDENTIFIER NUMBER (ID-REG)</text>
        <text x="280" y="250" font-family="monospace" font-weight="bold" font-size="22" fill="#3b82f6" letter-spacing="1">FR-9482-AZ71-992K</text>
        
        <text x="280" y="290" font-family="sans-serif" font-size="11" fill="#94a3b8">EXPIRY DATE</text>
        <text x="280" y="310" font-family="'Space Grotesk', system-ui, sans-serif" font-size="14" fill="#f8fafc">31 DEC 2036</text>
        
        <text x="440" y="290" font-family="sans-serif" font-size="11" fill="#94a3b8">EMITTING JURISDICTION</text>
        <text x="440" y="310" font-family="'Space Grotesk', system-ui, sans-serif" font-size="14" fill="#f8fafc">METROPOLIS DISTRICT</text>

        <text x="280" y="350" font-family="sans-serif" font-size="11" fill="#94a3b8">AUTHORIZED SIGNATURE</text>
        <!-- Faux official script signature -->
        <path d="M 280 380 Q 300 350 320 385 T 360 375 T 400 380" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>
        
        <!-- Official Crest Seal watermark -->
        <circle cx="670" cy="200" r="60" fill="none" stroke="#10b981" stroke-dasharray="10 5" stroke-width="2"/>
        <text x="670" y="195" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#10b981" font-weight="bold">VERIFIED</text>
        <text x="670" y="210" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#10b981">SECURE SCAN</text>
        
        <!-- Highly scannable QR Code point -->
        <rect x="610" y="300" width="120" height="120" fill="white" rx="8"/>
        <!-- QR markers -->
        <rect x="620" y="310" width="30" height="30" fill="black"/>
        <rect x="625" y="315" width="20" height="20" fill="white"/>
        <rect x="628" y="318" width="14" height="14" fill="black"/>
        
        <rect x="690" y="310" width="30" height="30" fill="black"/>
        <rect x="695" y="315" width="20" height="20" fill="white"/>
        <rect x="698" y="318" width="14" height="14" fill="black"/>
        
        <rect x="620" y="380" width="30" height="30" fill="black"/>
        <rect x="625" y="385" width="20" height="20" fill="white"/>
        <rect x="628" y="388" width="14" height="14" fill="black"/>
        
        <!-- QR Random pixels grid -->
        <rect x="660" y="320" width="10" height="15" fill="black"/>
        <rect x="675" y="310" width="10" height="10" fill="black"/>
        <rect x="660" y="340" width="15" height="10" fill="black"/>
        <rect x="680" y="350" width="20" height="10" fill="black"/>
        <rect x="660" y="365" width="10" height="25" fill="black"/>
        <rect x="680" y="375" width="15" height="15" fill="black"/>
        <rect x="705" y="370" width="10" height="10" fill="black"/>
        <rect x="710" y="350" width="10" height="15" fill="black"/>
        <rect x="700" y="390" width="15" height="10" fill="black"/>
        <rect x="680" y="400" width="10" height="10" fill="black"/>
        
        <!-- Regulatory Microtext line -->
        <text x="50" y="465" font-family="monospace" font-size="8" fill="#475569" letter-spacing="1.5">
          SECURITY PROTOCOL LEVEL-B VERIFIED // PRIVACY SANDBOX GUARANTEED BY LOCAL WEB GL CANVAS MEMORY CONTROLS
        </text>
      </svg>
    `)
  },
  {
    name: "official_regulatory_invoice.jpg",
    type: "image/jpeg",
    size: 1843200, // 1.8 MB simulated
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <!-- Background faint legal seal watermark -->
        <circle cx="400" cy="550" r="180" fill="none" stroke="#f1f5f9" stroke-width="12" stroke-opacity="0.5"/>
        <text x="400" y="555" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="bold" font-size="36" fill="#f1f5f9" fill-opacity="0.5">TRUSTED RECEIPT</text>
        
        <!-- Header -->
        <rect x="40" y="40" width="720" height="140" fill="#f8fafc" rx="12"/>
        <text x="70" y="100" font-family="'Space Grotesk', sans-serif" font-weight="bold" font-size="28" fill="#0f172a">GOVT TAX CERTIFICATE &amp; INVOICE</text>
        <text x="70" y="125" font-family="monospace" font-weight="bold" font-size="12" fill="#3b82f6">REGISTRY NO: TX-P901-2900A</text>
        <text x="70" y="150" font-family="sans-serif" font-size="11" fill="#64748b">OFFICIAL RECORD KEEPING FORMAT • AUDIT INTACT</text>
        
        <circle cx="700" cy="110" r="30" fill="#10b981"/>
        <path d="M 688 110 L 696 118 L 715 99" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>

        <!-- Sender / Receiver -->
        <text x="60" y="230" font-family="sans-serif" font-weight="bold" font-size="12" fill="#475569">ISSUING AGENCY</text>
        <text x="60" y="250" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a">National Revenue Administration</text>
        <text x="60" y="270" font-family="monospace" font-size="12" fill="#64748b">Treasury Complex Building C, Zone 12</text>
        
        <text x="440" y="230" font-family="sans-serif" font-weight="bold" font-size="12" fill="#475569">RECIPIENT FILER</text>
        <text x="440" y="250" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a">ALEXANDER SMITH LTD</text>
        <text x="440" y="270" font-family="monospace" font-size="12" fill="#64748b">Corporate Filing ID: TAX-CO-10023</text>

        <!-- Main Ledger Table -->
        <rect x="40" y="320" width="720" height="40" fill="#0f172a" rx="6"/>
        <text x="60" y="345" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff">DESCRIPTION OF REGULATED ASSETS &amp; DUTIES</text>
        <text x="680" y="345" text-anchor="end" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff">AMOUNT USD</text>
        
        <text x="60" y="400" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a">01. Central Filing Process Administrative Rate</text>
        <text x="60" y="420" font-family="sans-serif" font-size="12" fill="#64748b">Filing fee for passport and Aadhaar scan record compression indexation</text>
        <text x="680" y="405" text-anchor="end" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">$120.00</text>
        <line x1="40" y1="440" x2="760" y2="440" stroke="#f1f5f9" stroke-width="2"/>

        <text x="60" y="480" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a">02. High Contrast Signal Correction Matrix</text>
        <text x="60" y="500" font-family="sans-serif" font-size="12" fill="#64748b">Adaptive filters tuning, threshold calculations, local RAM sandboxing</text>
        <text x="680" y="485" text-anchor="end" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">$280.00</text>
        <line x1="40" y1="520" x2="760" y2="520" stroke="#f1f5f9" stroke-width="2"/>

        <text x="60" y="560" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a">03. Local Device Verification Surcharge</text>
        <text x="60" y="580" font-family="sans-serif" font-size="12" fill="#64748b">100% Client-side browser execution and private encryption guarantee</text>
        <text x="680" y="565" text-anchor="end" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">$0.00</text>
        <line x1="40" y1="600" x2="760" y2="600" stroke="#f1f5f9" stroke-width="2"/>

        <!-- Calculations -->
        <text x="440" y="650" font-family="sans-serif" font-size="14" fill="#475569">SUBTOTAL:</text>
        <text x="680" y="650" text-anchor="end" font-family="monospace" font-size="14" fill="#0f172a">$400.00</text>
        
        <text x="440" y="680" font-family="sans-serif" font-size="14" fill="#475569">STATE LEVY TAX (0.0%):</text>
        <text x="680" y="680" text-anchor="end" font-family="monospace" font-size="14" fill="#0f172a">$0.00</text>

        <rect x="430" y="700" width="270" height="5" fill="#3b82f6"/>
        
        <text x="440" y="735" font-family="sans-serif" font-weight="bold" font-size="16" fill="#0f172a">TOTAL OUTSTANDING:</text>
        <text x="680" y="735" text-anchor="end" font-family="monospace" font-weight="bold" font-size="18" fill="#1e4ed8">$400.00</text>

        <!-- Terms & Seal signature -->
        <rect x="40" y="780" width="350" height="250" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1"/>
        <text x="60" y="810" font-family="sans-serif" font-weight="bold" font-size="12" fill="#475569">GOVERNMENT SECURITY ACCREDIT</text>
        <text x="60" y="830" font-family="sans-serif" font-size="11" fill="#64748b" width="300">
          This digital file is compiled with a local zero-record system. Content values do not upload to outer servers. QR stamp below holds secure hash validation bounds.
        </text>
        
        <!-- Faux visual stamp seals -->
        <circle cx="120" cy="940" r="40" fill="none" stroke="#dc2626" stroke-width="3" stroke-opacity="0.8"/>
        <text x="120" y="935" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626">ISSUED STATE</text>
        <text x="120" y="950" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#dc2626">2026 AUDITED</text>

        <!-- QR Code -->
        <text x="590" y="810" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569" font-weight="bold">SCAN AUDIT SIGN</text>
        <rect x="530" y="830" width="120" height="120" fill="white" stroke="#e2e8f0" stroke-width="1" rx="8"/>
        <!-- QR markers -->
        <rect x="540" y="840" width="30" height="30" fill="black"/>
        <rect x="545" y="845" width="20" height="20" fill="white"/>
        <rect x="548" y="848" width="14" height="14" fill="black"/>
        
        <rect x="610" y="840" width="30" height="30" fill="black"/>
        <rect x="615" y="845" width="20" height="20" fill="white"/>
        <rect x="618" y="848" width="14" height="14" fill="black"/>
        
        <rect x="540" y="910" width="30" height="30" fill="black"/>
        <rect x="545" y="915" width="20" height="20" fill="white"/>
        <rect x="548" y="918" width="14" height="14" fill="black"/>
        
        <!-- Random pixels -->
        <rect x="580" y="850" width="10" height="15" fill="black"/>
        <rect x="595" y="840" width="10" height="10" fill="black"/>
        <rect x="580" y="870" width="15" height="10" fill="black"/>
        <rect x="600" y="880" width="20" height="10" fill="black"/>
        <rect x="580" y="895" width="10" height="25" fill="black"/>
        <rect x="600" y="905" width="15" height="15" fill="black"/>
        <rect x="625" y="900" width="10" height="10" fill="black"/>
        <rect x="630" y="880" width="10" height="15" fill="black"/>
        <rect x="620" y="920" width="15" height="10" fill="black"/>
        <rect x="600" y="930" width="10" height="10" fill="black"/>

        <!-- Signature authorize -->
        <path d="M 450 960 Q 480 1000 520 950 T 570 980" fill="none" stroke="#2563eb" stroke-width="2"/>
        <line x1="440" y1="990" x2="580" y2="990" stroke="#94a3b8" stroke-width="1"/>
        <text x="510" y="1005" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">AUDITOR-GENERAL OFFICE</text>

        <!-- Terms Footer footer -->
        <text x="400" y="1060" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">
          METROPOLIS AUDIT OFFICE STANDARD CODE-SECURE // PRINTED STRICTLY VIA LOCAL DEVICE PROCESSING
        </text>
      </svg>
    `)
  }
];
