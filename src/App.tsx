import React, { useState, useEffect, useRef } from 'react';
import { FileItem, CompressionSettings, CropArea, TargetFormat } from './types';
import { DocCropper } from './components/DocCropper';
import { ZoomPeeper } from './components/ZoomPeeper';
import { 
  processImage, 
  wrapImagesInPdf, 
  compressPdfDirect 
} from './utils/compressor';
import { 
  UseCasesSection, 
  ComparisonTable, 
  PrivacyPledge, 
  FAQSection 
} from './components/MarketingSpecs';
import { sampleDocs, SampleDoc } from './data/samples';
import { 
  Upload, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  Layers, 
  Sliders, 
  ShieldAlert, 
  Settings, 
  Crown, 
  ArrowRight, 
  Lock,
  Cpu,
  Info,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Share2,
  Camera,
  Eye,
  Maximize2,
  Minimize2,
  ArrowLeftRight,
  CheckCheck,
  Smartphone,
  Copy,
  RefreshCw,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';

export default function App() {
  // Navigation tabs for easy touch use on physical smartphones
  const [currentTab, setCurrentTab] = useState<'upload' | 'tune' | 'inspect'>('upload');

  // Main file states
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProUser, setIsProUser] = useState(false); // Simulated Pro mode
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // New spec: Controlled Documents BETWEEN how KB and which KB bounds
  const [isRangeMode, setIsRangeMode] = useState(true); // Enabled by default for fine-tuned precision
  const [targetMinKb, setTargetMinKb] = useState(60);
  const [targetMaxKb, setTargetMaxKb] = useState(150);

  // New spec: Bulk operations control: Quality settings applied to ALL files in batch
  const [applySettingsToAllQueue, setApplySettingsToAllQueue] = useState(false);

  // Expanded visualization: Fullscreen visual checking lightboxes
  const [lightboxFileId, setLightboxFileId] = useState<string | null>(null);
  const [lightboxMode, setLightboxMode] = useState<'split' | 'swap'>('split');
  const [lightboxSwapOriginal, setLightboxSwapOriginal] = useState(false);

  // QR Transfer overlay
  const [qrShareFileId, setQrShareFileId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active general compression settings
  const [settings, setSettings] = useState<CompressionSettings>({
    targetSizeKb: 105, // Midpoint parameter auto-synced
    customKbValue: '105',
    quality: 0.8,
    outputFormat: 'original',
    preserveQR: true,
    removeMetadata: true,
    scaleMode: 'percent',
    scalePercentage: 100,
    scaleWidth: '',
    scaleHeight: '',
    cropRatio: 'free',
  });

  // Crop area tracker relative to general settings
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 1.0,
    height: 1.0,
  });

  // Track cosmetic background floating circles count
  const [bubbles, setBubbles] = useState<Array<{ id: number; left: string; size: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate cosmetic floating bubbles rising up
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      size: `${10 + Math.random() * 25}px`,
      delay: `${Math.random() * 6}s`,
      duration: `${15 + Math.random() * 12}s`
    }));
    setBubbles(list);
  }, []);

  // Sync settings targetSizeKb dynamically with the range midpoint when isRangeMode is enabled
  useEffect(() => {
    if (isRangeMode) {
      const midpoint = Math.round((targetMinKb + targetMaxKb) / 2);
      setSettings(prev => ({
        ...prev,
        targetSizeKb: midpoint,
        customKbValue: String(midpoint)
      }));
    }
  }, [isRangeMode, targetMinKb, targetMaxKb]);

  // Update selected crop area when ratio is changed
  const handleRatioPreset = (ratio: string) => {
    setSettings(prev => ({ ...prev, cropRatio: ratio }));
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  // Run compression processing on a specific FileItem
  const performCompression = async (item: FileItem, currentSettings: CompressionSettings) => {
    try {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, processing: true, error: undefined } : f));

      if (item.isPDF) {
        // Multi-page scanned PDF or standard PDF compression
        const result = await compressPdfDirect(item, currentSettings);
        setFiles(prev => prev.map(f => f.id === item.id ? {
          ...f,
          compressedSize: result.blob.size,
          compressedUrl: result.url,
          pdfPages: result.pages,
          processing: false,
          compressedType: 'application/pdf'
        } : f));
      } else {
        // Image Processing pipeline
        const result = await processImage(item, currentSettings, cropArea);
        setFiles(prev => prev.map(f => f.id === item.id ? {
          ...f,
          compressedSize: result.blob.size,
          compressedUrl: result.url,
          processing: false,
          width: result.width,
          height: result.height,
          compressedType: currentSettings.outputFormat === 'original' ? item.originalType : currentSettings.outputFormat
        } : f));
      }
    } catch (err: any) {
      console.error(err);
      setFiles(prev => prev.map(f => f.id === item.id ? {
        ...f,
        processing: false,
        error: err.message || 'Compression failed. Please try a different target.'
      } : f));
    }
  };

  // Re-trigger compression if settings or targets change
  useEffect(() => {
    const listToCompress = applySettingsToAllQueue ? files : (selectedFile ? [selectedFile] : []);
    if (listToCompress.length === 0) return;

    const delayDebounce = setTimeout(() => {
      listToCompress.forEach(item => {
        performCompression(item, settings);
      });
    }, 450); // Debounce to allow ultra-smooth touch adjustments

    return () => clearTimeout(delayDebounce);
  }, [
    settings.targetSizeKb, 
    settings.quality, 
    settings.outputFormat, 
    settings.preserveQR, 
    settings.removeMetadata,
    settings.scaleMode,
    settings.scalePercentage,
    settings.scaleWidth,
    settings.scaleHeight,
    cropArea,
    selectedFileId,
    applySettingsToAllQueue
  ]);

  // Handle file additions
  const handleFilesAdded = (rawFiles: FileList) => {
    const freshFiles: FileItem[] = Array.from(rawFiles).map(file => {
      const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const url = URL.createObjectURL(file);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalSize: file.size,
        originalType: file.type || (isPDF ? 'application/pdf' : 'image/jpeg'),
        file,
        previewUrl: url,
        isPDF,
        processing: false,
      };
    });

    setFiles(prev => [...prev, ...freshFiles]);
    if (freshFiles.length > 0) {
      setSelectedFileId(freshFiles[0].id);
      setCropArea({ x: 0, y: 0, width: 1.0, height: 1.0 });
      setSettings(prev => ({ ...prev, cropRatio: 'free' }));
      
      // Auto transition on mobile device viewport to parameter tuning
      setCurrentTab('tune');
    }
  };

  // Pre-load SVG-encoded high contrast regulated templates for testing instantly offline
  const loadSamplePreset = async (doc: SampleDoc) => {
    try {
      const res = await fetch(doc.url);
      const blob = await res.blob();
      const mockFile = new File([blob], doc.name, { type: doc.type });
      const fileId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const newMockItem: FileItem = {
        id: fileId,
        name: doc.name,
        originalSize: doc.size,
        originalType: doc.type,
        file: mockFile,
        previewUrl: doc.url,
        isPDF: doc.type === 'application/pdf',
        processing: false
      };

      setFiles(prev => [...prev, newMockItem]);
      setSelectedFileId(fileId);
      setCropArea({ x: 0, y: 0, width: 1.0, height: 1.0 });
      setSettings(prev => ({ ...prev, cropRatio: 'free' }));
      setCurrentTab('tune');
    } catch (err) {
      console.error("Preset initialization error:", err);
    }
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeaveHandler = () => {
    setIsDragOver(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Download command helper
  const downloadFile = (item: FileItem) => {
    if (!item.compressedUrl) return;
    const a = document.createElement('a');
    a.href = item.compressedUrl;
    
    let suffix = 'compressed';
    if (item.compressedType === 'image/webp') suffix += '.webp';
    else if (item.compressedType === 'image/png') suffix += '.png';
    else if (item.compressedType === 'application/pdf') suffix += '.pdf';
    else suffix += '.jpg';

    const nameDotIdx = item.name.lastIndexOf('.');
    const cleanName = nameDotIdx !== -1 ? item.name.substring(0, nameDotIdx) : item.name;
    
    a.download = `${cleanName}_${suffix}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) {
      const remaining = files.filter(f => f.id !== id);
      setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const clearQueue = () => {
    setFiles([]);
    setSelectedFileId(null);
  };

  const handleCombineAllToPdf = async () => {
    const processReady = files.filter(f => f.compressedUrl && !f.isPDF);
    if (processReady.length === 0) return;
    
    try {
      const itemsList = await Promise.all(
        processReady.map(async f => {
          const res = await fetch(f.compressedUrl!);
          const blob = await res.blob();
          return {
            blob,
            width: f.width || 800,
            height: f.height || 600,
            name: f.name
          };
        })
      );
      
      const pdfBlob = await wrapImagesInPdf(itemsList);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `antigravity_combined_docs.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Error combining documents: ' + err);
    }
  };

  const handleDownloadAll = () => {
    files.forEach(f => {
      if (f.compressedUrl) {
        downloadFile(f);
      }
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    return (bytes / k).toFixed(1) + ' KB';
  };

  // Helper values to check if file lands inside target corridor limits
  const isCorridorCompliant = (sizeBytes: number | undefined): 'compliant' | 'too_small' | 'exceeded' | 'unknown' => {
    if (!sizeBytes) return 'unknown';
    const sizeKb = sizeBytes / 1024;
    if (sizeKb < targetMinKb) return 'too_small';
    if (sizeKb > targetMaxKb) return 'exceeded';
    return 'compliant';
  };

  const activeFileCompliantStatus = selectedFile ? isCorridorCompliant(selectedFile.compressedSize) : 'unknown';

  return (
    <div id="antigravity-app-viewport" className="min-h-screen relative overflow-hidden bg-anti-dark selection:bg-blue-600 selection:text-white font-sans text-gray-200">
      
      {/* Background levitating cosmetic particles */}
      <div id="bubble-bg-elements" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-2/3 right-1/12 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/2 border border-white/5"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              bottom: '-50px',
              animation: `bubble-rise ${bubble.duration} linear infinite`,
              animationDelay: bubble.delay,
            }}
          />
        ))}
      </div>

      {/* Main Top Header Navigation */}
      <header id="main-nav-header" className="relative z-30 border-b border-white/5 bg-anti-dark/95 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-levitate">
              <Cpu className="text-white" size={18} />
            </div>
            <div>
              <span className="font-display font-medium text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                ANTIGRAVITY <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-mono border border-blue-500/25">COMPRESS</span>
              </span>
              <p className="text-[9px] text-gray-500 tracking-wider font-mono uppercase">Offline Mobile-Core</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Client-Side Safe (No Network Leaks)
            </span>
            
            <button
              id="activate-pro-button"
              onClick={() => setIsProUser(!isProUser)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium tracking-wide flex items-center gap-1 transition-all cursor-pointer ${
                isProUser 
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
              }`}
            >
              <Crown size={12} className={isProUser ? 'text-amber-400' : 'text-white'} />
              <span>{isProUser ? 'Pro Activated' : 'Unlock Pro'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        
        {/* HERO HEADER */}
        <section id="hero-landing-block" className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[11px] text-blue-300 mb-4 sm:mb-5 font-medium">
            <Sparkles size={11} className="text-blue-400 animate-spin" style={{ animationDuration: '4s' }} /> 
            <span>Advanced Local Sandboxing & Document Format Transmuter</span>
          </div>

          <h1 className="font-display font-medium text-2xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-3 sm:mb-4 leading-snug">
            Squeeze Files into <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent font-semibold">Exact KB Ranges</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Specify a permissible filing corridor (e.g. 50 KB to 100 KB) and format documents locally. No server uploads, zero quality degradation of signatures or text seals.
          </p>
        </section>

        {/* MOBILE WORKWIZARD TABS HEADER BAR (Visible only on phone/tablets) */}
        <div id="mobile-workspace-tabs" className="flex md:hidden items-center justify-between p-1 bg-white/2 border border-white/5 rounded-2xl mb-6">
          {[
            { id: 'upload', label: '1. Get Docs', icon: <FolderOpen size={14} /> },
            { id: 'tune', label: '2. Tune Target', icon: <SlidersHorizontal size={14} /> },
            { id: 'inspect', label: '3. Inspect & Save', icon: <Maximize2 size={14} /> }
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                id={`mobile-tab-trigger-${tab.id}`}
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 sm:py-2.5 rounded-xl text-[11px] font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15 font-semibold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* PRIMARY CONTAINER BLOCK WITH DESKTOP RESPONSIVE GRID / TABS SYSTEM */}
        <div id="main-compression-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* TAB 1 CONTENT CONTAINER: UPLOAD / PRESET PANEL */}
          <div id="workspace-upload-column" className={`md:col-span-5 flex flex-col gap-6 ${currentTab === 'upload' ? 'block' : 'hidden md:block'}`}>
            <div className="glass-panel p-5 rounded-2xl border border-white/8">
              <h3 className="font-display font-medium text-sm sm:text-base text-white mb-3 flex items-center gap-2">
                <Layers size={16} className="text-blue-400" />
                <span>Upload Workspace</span>
              </h3>

              {/* Responsive Camera capture & manual select desk */}
              <div
                id="dropzone-sandbox-target"
                onDragOver={onDragOverHandler}
                onDragLeave={onDragLeaveHandler}
                onDrop={onDropHandler}
                className={`min-h-40 sm:min-h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-500/10 scale-[0.99]'
                    : 'border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/4'
                }`}
              >
                <input
                  id="file-input-element"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesAdded(e.target.files);
                    }
                  }}
                />
                
                {/* Smartphone Snapper direct camera scan element */}
                <input
                  id="camera-capture-element"
                  type="file"
                  ref={cameraInputRef}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesAdded(e.target.files);
                    }
                  }}
                />

                <div className="flex gap-2 mb-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-400 cursor-pointer border border-blue-500/20 transition-colors"
                    title="Browse device storage"
                  >
                    <Upload size={18} />
                  </div>
                  
                  {/* Smartphone direct scan snap triggers */}
                  <div 
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-10 h-10 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 cursor-pointer border border-emerald-500/20 transition-colors"
                    title="Instantly snap doc via smartphone camera"
                  >
                    <Camera size={18} />
                  </div>
                </div>

                <p className="text-xs font-semibold text-gray-200">
                  <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>Browse files</span> or <span className="text-emerald-400 hover:underline cursor-pointer" onClick={() => cameraInputRef.current?.click()}>snap photo</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Accepts PDFs, PNG, WebP, JPEG. Max 350 MB</p>
              </div>

              {/* FAST OFFLINE MOCK PRESETS FOR INSTANT DEMO TESTING */}
              <div id="demo-presets-panel" className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">⚡ Try Out Sandbox Templates (No upload required)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="preset-load-id-card"
                    onClick={() => loadSamplePreset(sampleDocs[0])}
                    className="flex items-center gap-1.5 p-2 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer"
                  >
                    <ImageIcon size={12} className="text-blue-400" />
                    <div className="truncate">
                      <span className="block text-gray-200 font-medium">Citizen Identity Card</span>
                      <span className="block text-[9px] text-gray-500">2.4 MB (Contour Stamp)</span>
                    </div>
                  </button>

                  <button
                    id="preset-load-tax-invoice"
                    onClick={() => loadSamplePreset(sampleDocs[1])}
                    className="flex items-center gap-1.5 p-2 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer"
                  >
                    <FileText size={12} className="text-emerald-400" />
                    <div className="truncate">
                      <span className="block text-gray-200 font-medium">Scanned Tax Invoice</span>
                      <span className="block text-[9px] text-gray-500">1.8 MB (Fine Text & QR)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ACTIVE BULK / QUEUE MANAGEMENT DECK */}
              {files.length > 0 ? (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Workbench Queue ({files.length})</span>
                    <button
                      id="btn-clear-queue"
                      onClick={clearQueue}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Trash2 size={10} /> Clear List
                    </button>
                  </div>

                  <div id="responsive-file-queue-viewport" className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {files.map(f => {
                      const isSelected = f.id === selectedFileId;
                      const sizeDiff = f.compressedSize ? f.originalSize - f.compressedSize : 0;
                      const ratio = sizeDiff > 0 ? Math.round((sizeDiff / f.originalSize) * 100) : null;
                      const compliant = isCorridorCompliant(f.compressedSize);

                      return (
                        <div
                          id={`queue-item-${f.id}`}
                          key={f.id}
                          onClick={() => {
                            setSelectedFileId(f.id);
                            if (!f.isPDF) {
                              setCropArea({ x: 0, y: 0, width: 1.0, height: 1.0 });
                            }
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-600/10 border-blue-500/40'
                              : 'bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/4'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`w-7 h-7 rounded bg-white/5 flex items-center justify-center shrink-0 ${f.isPDF ? 'text-rose-400' : 'text-blue-400'}`}>
                              {f.isPDF ? <FileText size={14} /> : <ImageIcon size={14} />}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-semibold text-gray-200 truncate pr-1" title={f.name}>{f.name}</p>
                              <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                                {formatSize(f.originalSize)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {f.processing ? (
                              <span className="text-[9px] text-blue-400 animate-pulse font-mono font-bold">COMPRESSING...</span>
                            ) : f.compressedSize ? (
                              <div className="text-right">
                                <span className={`text-[10px] font-mono font-bold block ${
                                  compliant === 'compliant' ? 'text-emerald-400' : compliant === 'too_small' ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                  {formatSize(f.compressedSize)}
                                </span>
                                {ratio !== null && ratio > 0 && (
                                  <span className="text-[8px] text-gray-400 block font-mono">-{ratio}%</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[9px] text-gray-400 font-mono">IDLE</span>
                            )}

                            <button
                              id={`delete-queue-${f.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFile(f.id);
                              }}
                              className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded transition-all cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div id="workbench-empty-placeholder" className="mt-4 p-4 rounded-xl bg-white/[0.01] border border-white/4 text-center">
                  <Info size={14} className="text-gray-600 mx-auto mb-1" />
                  <p className="text-[11px] text-gray-500">Pick folders, snap citizen profiles, or load testing presets to activate calibration dials.</p>
                </div>
              )}
            </div>

            {/* QUICK STEPS INSTRUCTIONS GAUGE */}
            <div id="quick-workflow-instructions" className="hidden sm:block glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-tr from-white/3 to-blue-950/20 text-xs">
              <span className="text-blue-400 font-semibold uppercase tracking-wider text-[10px] block mb-2">Interactive Guide</span>
              <ul className="space-y-2 text-gray-400 font-sans">
                <li className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600/30 font-semibold font-mono text-[10px] flex items-center justify-center text-blue-200 shrink-0">1</span>
                  <span>Set desired Min / Max sizes (the corridor range mandated by government submission desks).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600/30 font-semibold font-mono text-[10px] flex items-center justify-center text-blue-200 shrink-0">2</span>
                  <span>Map format pathways visually: `Photo (PNG/JPG)` ➔ `Filing Doc (WebP/PDF)`.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600/30 font-semibold font-mono text-[10px] flex items-center justify-center text-blue-200 shrink-0">3</span>
                  <span>Save. Scanning QR codes securely routes the output directly to mobile files on other devices.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* TAB 2 CONTENT CONTAINER: TUNING WORKSPACE DESK */}
          <div id="workspace-tune-column" className={`md:col-span-7 flex flex-col gap-6 ${currentTab === 'tune' ? 'block' : 'hidden md:block'}`}>
            <div className="glass-panel p-5 rounded-2xl border border-white/8 relative">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
                <h3 className="font-display font-medium text-sm sm:text-base text-white flex items-center gap-2">
                  <Sliders size={16} className="text-blue-400" />
                  <span>Compression & Squeeze Parameters</span>
                </h3>

                {/* Spec: Apply same Quality settings to all files at once */}
                <label className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 py-1 px-2.5 rounded-xl text-[11px] font-medium text-blue-300 cursor-pointer hover:bg-blue-500/15 transition-all">
                  <input
                    id="bulk-apply-checkbox-switch"
                    type="checkbox"
                    checked={applySettingsToAllQueue}
                    onChange={(e) => setApplySettingsToAllQueue(e.target.checked)}
                    className="rounded border-white/10 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Apply settings to all {files.length > 0 ? `(${files.length})` : ''} docs</span>
                </label>
              </div>

              {/* SPEC SECTION: BETWEEN HOW KB TO WHICH KB DOCUMENT RANGE TUNER */}
              <div id="corridor-gauge-controller" className="mb-6 bg-white/2 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-white block">File Corridor Size Target Bounds</span>
                    <span className="text-[10px] text-gray-500 block">Restricts documents to align exactly inside administrative thresholds</span>
                  </div>
                  
                  {/* Toggle between specific Range Bounds or Single limit settings */}
                  <button
                    id="toggle-range-mode-switch"
                    onClick={() => setIsRangeMode(!isRangeMode)}
                    className="text-[10px] bg-blue-600/20 text-blue-300 hover:text-white hover:bg-blue-600 py-1 px-2 rounded-lg font-semibold border border-blue-500/20 transition-all cursor-pointer"
                  >
                    {isRangeMode ? 'Switch to Simple Target Limit' : 'Switch to Range Corridor Guard'}
                  </button>
                </div>

                {isRangeMode ? (
                  <div className="space-y-4 font-sans">
                    {/* Visual corridor tuning inputs (incrementers/decrementers) with larger phone screen buttons */}
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Min Limit parameter box */}
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-mono">Min Size Limit (KB)</label>
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
                          <button
                            id="btn-dec-min-kb"
                            onClick={() => setTargetMinKb(prev => Math.max(10, prev - 10))}
                            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-gray-200 cursor-pointer text-sm"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-xs font-mono font-bold text-white pr-1">
                            {targetMinKb} KB
                          </span>
                          <button
                            id="btn-inc-min-kb"
                            onClick={() => setTargetMinKb(prev => Math.min(targetMaxKb - 10, prev + 10))}
                            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-gray-200 cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-center self-end pb-3 text-gray-600">
                        <ArrowLeftRight size={14} />
                      </div>

                      {/* Max Limit parameter box */}
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-mono">Max Size Limit (KB)</label>
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
                          <button
                            id="btn-dec-max-kb"
                            onClick={() => setTargetMaxKb(prev => Math.max(targetMinKb + 10, prev - 10))}
                            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-gray-200 cursor-pointer text-sm"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-xs font-mono font-bold text-white pr-1">
                            {targetMaxKb} KB
                          </span>
                          <button
                            id="btn-inc-max-kb"
                            onClick={() => setTargetMaxKb(prev => Math.min(2000, prev + 10))}
                            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-gray-200 cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* LIVE CORRIDOR GAUGE COMPLIANCE DISPLAY */}
                    {selectedFile && selectedFile.compressedSize !== undefined ? (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Corridor Map Check</span>
                          
                          {/* Live Dynamic Status reading */}
                          {activeFileCompliantStatus === 'compliant' && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Size Guard: COMPLIANT
                            </span>
                          )}
                          {activeFileCompliantStatus === 'too_small' && (
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Info size={11} /> Over-Compressed (&lt; {targetMinKb} KB)
                            </span>
                          )}
                          {activeFileCompliantStatus === 'exceeded' && (
                            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                              <ShieldAlert size={11} /> Exceeds Max bounds! (&gt; {targetMaxKb} KB)
                            </span>
                          )}
                        </div>

                        {/* Interactive filing progress map */}
                        <div className="relative h-6 bg-black/40 border border-white/5 rounded-xl overflow-hidden px-4 flex items-center">
                          {/* Left over-compress block */}
                          <div className="absolute left-0 top-0 bottom-0 bg-yellow-500/10 border-r border-yellow-500/20" style={{ width: '25%' }} />
                          {/* Middle optimal corridor slice */}
                          <div className="absolute left-[25%] right-[25%] top-0 bottom-0 bg-emerald-500/15" />
                          {/* Right exceed limit block */}
                          <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 border-l border-rose-500/20" style={{ width: '25%' }} />

                          {/* Static Range boundary text tags inside gauge */}
                          <span className="absolute left-[26%] text-[9px] font-mono text-emerald-400/70 font-semibold">{targetMinKb} KB</span>
                          <span className="absolute right-[26%] text-[9px] font-mono text-emerald-400/70 font-semibold">{targetMaxKb} KB</span>

                          {/* Interactive particle pinpoint indicating selected file current position */}
                          {(() => {
                            const fileKb = selectedFile.compressedSize / 1024;
                            const rangeSpan = targetMaxKb - targetMinKb;
                            // Calculate localized linear percent offset inside gauge map
                            let percentLeft = 50;
                            if (fileKb < targetMinKb) {
                              percentLeft = Math.max(5, Math.min(22, (fileKb / targetMinKb) * 25));
                            } else if (fileKb > targetMaxKb) {
                              percentLeft = Math.max(78, Math.min(95, 75 + ((fileKb - targetMaxKb) / targetMaxKb) * 20));
                            } else {
                              percentLeft = 25 + ((fileKb - targetMinKb) / rangeSpan) * 50;
                            }

                            return (
                              <div 
                                className={`absolute w-3.5 h-3.5 rounded-full border shadow-md flex items-center justify-center transition-all duration-300 top-1/2 -mt-1.75 ${
                                  activeFileCompliantStatus === 'compliant' 
                                    ? 'bg-emerald-500 border-white shadow-emerald-500/40' 
                                    : activeFileCompliantStatus === 'too_small'
                                      ? 'bg-amber-400 border-white shadow-amber-500/40'
                                      : 'bg-rose-500 border-white shadow-rose-500/40'
                                }`}
                                style={{ left: `calc(${percentLeft}% - 7px)` }}
                                title={`Computed Squeeze output is verified at ${formatSize(selectedFile.compressedSize)}`}
                              >
                                <span className="absolute -top-4 bg-gray-900 border border-white/10 px-1 py-0.25 rounded font-mono text-[8px] text-white whitespace-nowrap">
                                  {formatSize(selectedFile.compressedSize)}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <p className="text-[10px] text-gray-500 font-sans mt-2.5 leading-snug">
                          {activeFileCompliantStatus === 'compliant' 
                            ? "🎯 Ideal size achieved. Your file meets official guidelines perfectly." 
                            : activeFileCompliantStatus === 'too_small' 
                              ? "⚠️ Under specified Min limit. Consider increasing scale percentages to bolster legibility details."
                              : "❌ Outside accepted guidelines. Try lowering the custom crop boundary area to discard extraneous margins."}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 p-2 bg-white/2 rounded-lg border border-white/4 text-center">
                        <p className="text-[10px] text-gray-400 font-sans">Upload a file or use a preset. The adaptive corridor gauge will map live compliant sizes instantly.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    <label className="text-[11px] text-gray-400 block">Set Absolute Target Size limit (KB)</label>
                    <div className="flex items-center gap-3 bg-white/2 p-2.5 rounded-lg border border-white/5">
                      <input
                        id="range-custom-kb-slider"
                        type="range"
                        min="10"
                        max="1500"
                        step="10"
                        value={settings.targetSizeKb === 'auto' ? 100 : Number(settings.targetSizeKb)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSettings(prev => ({ ...prev, targetSizeKb: val, customKbValue: String(val) }));
                        }}
                        className="flex-1 h-1 bg-white/15 rounded appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="w-24 flex items-center gap-1.5 shrink-0">
                        <input
                          id="input-text-kb-target"
                          type="number"
                          value={settings.customKbValue}
                          onChange={(e) => {
                            const num = Number(e.target.value);
                            setSettings(prev => ({
                              ...prev,
                              customKbValue: e.target.value,
                              targetSizeKb: isNaN(num) || num <= 0 ? 'auto' : num
                            }));
                          }}
                          className="w-full text-center py-1 bg-black/40 border border-white/10 rounded font-mono text-xs text-white"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">KB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SPEC SECTION: PHOTO & DOCUMENT FORMAT SELECT ROUTER */}
              <div id="format-transmutation-gate" className="mb-6 bg-white/2 p-4 rounded-xl border border-white/5">
                <span className="text-xs font-semibold text-white block mb-1">Photo &amp; Document Format Transmutation</span>
                <span className="text-[10px] text-gray-500 block mb-3">Map file types in physical router directions (Lossless JPG/PNG ➔ Responsive WebP/PDF)</span>

                {/* Highly intuitive visual layout representing Input Format -> Dynamic Selection output chips */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2 px-3 bg-black/20 rounded-xl border border-white/4">
                  {/* Dynamic Source badge detection */}
                  <div className="flex items-center gap-2 sm:w-2/5 font-sans">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                      {selectedFile?.isPDF ? <FileText size={16} /> : <ImageIcon size={16} />}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-mono">Detected Source</span>
                      <span className="text-xs font-semibold text-white block truncate">
                        {selectedFile ? (selectedFile.isPDF ? '.PDF Doc Stream' : `.${selectedFile.originalType.split('/')[1]?.toUpperCase() || 'IMG'} Source`) : 'Waiting for file...'}
                      </span>
                    </div>
                  </div>

                  {/* Flow Arrow marker */}
                  <div className="hidden sm:flex items-center justify-center text-blue-500 font-bold shrink-0 animate-pulse">
                    <ArrowLeftRight size={14} />
                  </div>

                  {/* TARGET OUT CHIPS ELEMENT SELECTOR */}
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-mono mb-1.5 sm:text-right">Choose Target Format Output</span>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      {[
                        { label: 'Original', val: 'original', desc: 'Retain original' },
                        { label: 'JPEG Image', val: 'image/jpeg', desc: 'High compatible' },
                        { label: 'PNG Image', val: 'image/png', desc: 'Lossless alpha' },
                        { label: 'WebP Image', val: 'image/webp', desc: 'Ultra-slim size' },
                        { label: 'PDF Document', val: 'application/pdf', desc: 'Filing signature' }
                      ].map((chip) => {
                        const isChipSelected = settings.outputFormat === chip.val;
                        return (
                          <button
                            id={`format-router-chip-${chip.val}`}
                            key={chip.val}
                            onClick={() => {
                              setSettings(prev => ({ ...prev, outputFormat: chip.val as TargetFormat }));
                            }}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-medium border text-left transition-all tracking-tight cursor-pointer ${
                              isChipSelected 
                                ? 'bg-blue-600/30 border-blue-500 text-white font-semibold shadow-inner' 
                                : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                            title={chip.desc}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Compatibility hint alerts */}
                {settings.outputFormat === 'application/pdf' && (
                  <div className="mt-2.5 p-2 bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 rounded-lg flex items-start gap-1.5 leading-snug">
                    <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>PDF TRANSFORMATION PATHWAY:</strong> This converts your raster photo pages directly into a vector-wrapped digital PDF container. Perfect for online registration systems that accept PDF files only.</span>
                  </div>
                )}
              </div>

              {/* OTHER BASIC RESIZING SETTINGS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Resizer Scaling Mode</label>
                  <select
                    id="select-resize-mode-metric"
                    value={settings.scaleMode}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, scaleMode: e.target.value as 'percent' | 'dimensions' }));
                    }}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="percent">Percent scale down (e.g. 80%)</option>
                    <option value="dimensions">Custom specific pixel size (W x H)</option>
                  </select>
                </div>

                <div>
                  {settings.scaleMode === 'percent' ? (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1 flex items-center justify-between">
                        <span>Downscaling Factor</span>
                        <span className="font-semibold text-blue-400 font-mono">{settings.scalePercentage}%</span>
                      </label>
                      <input
                        id="slider-rescale-percentage"
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={settings.scalePercentage}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSettings(prev => ({ ...prev, scalePercentage: val }));
                        }}
                        className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-blue-500 mt-2.5"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Max Width (px)</label>
                        <input
                          id="input-resizer-w"
                          type="number"
                          placeholder="Original W"
                          value={settings.scaleWidth}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setSettings(prev => ({ ...prev, scaleWidth: val }));
                          }}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Max Height (px)</label>
                        <input
                          id="input-resizer-h"
                          type="number"
                          placeholder="Original H"
                          value={settings.scaleHeight}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setSettings(prev => ({ ...prev, scaleHeight: val }));
                          }}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ADVANCED DOCUMENT PRESERVE ENGINE SWITCHES */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    id="checkbox-preserve-qr-mode"
                    type="checkbox"
                    checked={settings.preserveQR}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, preserveQR: e.target.checked }));
                    }}
                    className="mt-0.5 rounded border-white/15 bg-black/50 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-200 block group-hover:text-blue-400 transition-colors">
                      Preserve QR Stamp &amp; Ink Signature Contours
                    </span>
                    <span className="text-[10px] text-gray-500 block leading-snug">
                      Keeps QR pixel blocks, fine handwriting lines, passport seals, and authorized government stamps crisp to bypass machine-scanning automated portals.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    id="checkbox-strip-metadata"
                    type="checkbox"
                    checked={settings.removeMetadata}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, removeMetadata: e.target.checked }));
                    }}
                    className="mt-0.5 rounded border-white/15 bg-black/50 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-200 block group-hover:text-blue-400 transition-colors">
                      Sanitize Filer Metadata (EXIF Camera logs, GPS coords)
                    </span>
                    <span className="text-[10px] text-gray-500 block leading-snug">
                      Strips private smart camera markers, smartphone models, location timestamps, and image metadata parameters for complete anonymous filing.
                    </span>
                  </div>
                </label>
              </div>

              {/* MOBILE REDIRECT BUTTON TO TRANSITION STAGES */}
              <div className="flex md:hidden justify-end mt-6">
                <button
                  id="mobile-wizard-next-btn"
                  onClick={() => setCurrentTab('inspect')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  Configure complete • Go to check &amp; download <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* ACTIVE DOCUMENT SUB-EDITOR WORKSPACE (CROP & LIVE QUALITY SLIDER) */}
        <section id="workspace-inspections-bracket" className={`mt-8 scroll-mt-24 ${currentTab === 'inspect' ? 'block' : 'hidden md:block'}`}>
          {selectedFile ? (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-blue-500/10 border border-blue-500/25 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs text-blue-200 font-medium font-mono truncate max-w-sm sm:max-w-md">
                    Selected Doc: <strong>{selectedFile.name}</strong> ({formatSize(selectedFile.originalSize)})
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Fullscreen magnifying inspect triggers */}
                  <button
                    id="btn-trigger-fullscreen-peep"
                    onClick={() => {
                      setLightboxFileId(selectedFile.id);
                      setLightboxSwapOriginal(false);
                    }}
                    className="flex-1 sm:flex-initial py-1 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Maximize2 size={12} /> Live Fullscreen Magnifier
                  </button>

                  <button
                    id="btn-trigger-local-transmit"
                    onClick={() => setQrShareFileId(selectedFile.id)}
                    className="flex-1 sm:flex-initial py-1 px-3 bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] border border-white/10 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Smartphone size={12} className="text-emerald-400" /> Transmit Code to Phone
                  </button>
                </div>
              </div>

              {!selectedFile.isPDF ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* Interactive DocCropper segment for reframing size limits */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-white block">Aadhaar & Passport Aspect Presets</span>
                        <span className="text-[10px] text-gray-500">Slice margins to instantly skip excessive blank file pixels</span>
                      </div>

                      {/* Aspect presets choice selectors */}
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: 'Free Form', val: 'free' },
                          { label: 'Passport Size', val: 'passport' },
                          { label: 'A4 Page', val: 'A4' },
                          { label: 'Square 1:1', val: '1:1' }
                        ].map((pr) => (
                          <button
                            id={`aspect-preset-btn-${pr.val}`}
                            key={pr.val}
                            onClick={() => handleRatioPreset(pr.val)}
                            className={`text-[9px] py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                              settings.cropRatio === pr.val
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                      <DocCropper
                        imageUrl={selectedFile.previewUrl}
                        cropArea={cropArea}
                        onChange={(area) => setCropArea(area)}
                        aspectRatio={settings.cropRatio}
                      />
                    </div>
                  </div>

                  {/* Interactive Side-By-Side Zoom Peeper slider workspace */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/5">
                    {selectedFile.compressedUrl ? (
                      <ZoomPeeper
                        originalUrl={selectedFile.previewUrl}
                        compressedUrl={selectedFile.compressedUrl}
                        originalSize={selectedFile.originalSize}
                        compressedSize={selectedFile.compressedSize || selectedFile.originalSize}
                      />
                    ) : (
                      <div className="h-80 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500/35 border-t-blue-500 animate-spin mb-3" />
                        <span className="text-xs text-gray-400">Desqueezing document matrix parameters...</span>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center bg-white/2 border border-white/5 rounded-2xl max-w-xl mx-auto">
                  <FileText size={42} className="text-blue-400 mx-auto mb-3 animate-levitate" />
                  <h4 className="font-display font-medium text-white mb-2 text-base">Scanned PDF File Optimized Directly Offline</h4>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed font-sans">
                    PDF elements, fonts streams, and container structures are compressed internally. Barcode contours and validation stamps are locked above contrast floors for certified portal ingestion.
                  </p>

                  {selectedFile.compressedUrl && (
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <button
                        id="btn-view-pdf-preview"
                        onClick={() => window.open(selectedFile.compressedUrl, '_blank')}
                        className="text-xs font-semibold py-2 px-4 rounded-xl bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                      >
                        Launch Interactive System PDF Preview
                      </button>

                      <button
                        id="download-single-pdf-action"
                        onClick={() => downloadFile(selectedFile)}
                        className="text-xs font-semibold py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download size={12} /> Download Optimized PDF ({formatSize(selectedFile.compressedSize || 0)})
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div id="no-active-workspace-card" className="p-8 sm:p-12 border border-dashed border-white/8 rounded-2xl text-center max-w-md mx-auto">
              <Sliders size={28} className="text-gray-500 mx-auto mb-3" />
              <h4 className="font-display font-medium text-white text-base mb-1">Your Sandbox is idle</h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                No active document selected. Snap a scan, upload files, or click any demo preset template above to tune document boundaries instantly.
              </p>
            </div>
          )}
        </section>

        {/* COMBINE ALL IMAGES AS A MULTI-PAGE PDF MODULE BANNER */}
        {files.length > 1 && files.filter(f => !f.isPDF).length > 1 && (
          <div id="combine-batch-pdf-banner" className="glass-panel p-5 mt-10 rounded-2xl border border-white/5 bg-gradient-to-tr from-indigo-950/20 to-white/2 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-white block mb-0.5">Combine Processing Images into Multi-Page Document</span>
              <span className="text-[10px] text-gray-400 block font-sans">Compiles all compressed workbench items sequentially into a singular, clean PDF format.</span>
            </div>

            <button
              id="btn-combine-pdf-docs"
              onClick={handleCombineAllToPdf}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-4 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers size={14} /> Combine Batch into Multi-Page PDF
            </button>
          </div>
        )}

        {/* PERSISTENT REAL-TIME COMPILER STATS / DOWNLOAD BAR (Visible only on smartphone view) */}
        {selectedFile && selectedFile.compressedUrl && (
          <div id="mobile-sticky-quickbar" className="md:hidden fixed bottom-3 left-4 right-4 z-40 p-3 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
            <div className="overflow-hidden">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                <span className="truncate max-w-24 block font-semibold text-white">{selectedFile.name}</span>
                <span>➔</span>
                <span className={`font-bold ${activeFileCompliantStatus === 'compliant' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatSize(selectedFile.compressedSize || 0)}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 mt-0.5">
                {isRangeMode ? `Safeguard: [${targetMinKb}k - ${targetMaxKb}k]` : 'Direct Squeeze Active'}
              </p>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                id="btn-sticky-lightbox-inspect"
                onClick={() => {
                  setLightboxFileId(selectedFile.id);
                  setLightboxSwapOriginal(false);
                }}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                title="Visual zoom check"
              >
                <Eye size={14} />
              </button>

              <button
                id="btn-sticky-download"
                onClick={() => downloadFile(selectedFile)}
                className="py-1.5 px-3 rounded-xl bg-blue-600 active:scale-95 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {/* MARKETING SPECIFICATIONS AND EDUCATIVE CONTENT */}
        <div id="under-panel-marketing" className="mt-20">
          <section id="how-it-works-cards" className="mb-20 scroll-mt-24">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-display font-semibold text-xl sm:text-2xl text-white mb-2">Private Squeeze Protocol: Sandbox Flow</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-sans">Three localized browser RAM operations that protect your personal identity credentials securely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: <Upload size={18} className="text-blue-400" />,
                  title: "Buffer in Sandbox Locality",
                  desc: "Select files or snap camera inputs. Antigravity buffers your document within secure browser RAM without hitting an upload cloud port, remaining 100% private."
                },
                {
                  step: "02",
                  icon: <Sliders size={18} className="text-blue-400" />,
                  title: "Calibrate Limit Ranges",
                  desc: "Select a custom [Min KB to Max KB] filing envelope Corridor. Our bisect optimizer searches the compression domain iteratively to maximize visual readability."
                },
                {
                  step: "03",
                  icon: <Download size={18} className="text-emerald-400" />,
                  title: "Save or Scan Transmit",
                  desc: "Save the optimized file instantly or scan the secure local QR scanner to transfer files back and forth to smartphone forms directly. Completely free."
                }
              ].map((st, i) => (
                <div 
                  key={i} 
                  id={`how-step-card-${i}`}
                  className="glass-panel p-5 rounded-xl relative overflow-hidden"
                >
                  <span className="absolute top-3 right-3 font-mono font-extrabold text-2xl text-white/5 tracking-tighter">{st.step}</span>
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-3 border border-white/5">
                    {st.icon}
                  </div>
                  <h4 className="font-display font-semibold text-sm mb-1 text-white">{st.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{st.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECURE PRIVACY DEEP PANEL */}
          <section id="privacy-section-head" className="mb-20">
            <PrivacyPledge />
          </section>

          {/* DYNAMIC SCENARIO DIRECTORY GRID */}
          <section id="use-cases-grid-head" className="mb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
              <div>
                <h2 className="font-display font-semibold text-xl sm:text-2xl text-white mb-1">Standard Portal Directives</h2>
                <p className="text-xs sm:text-sm text-gray-400">Tested compliant files targeting major government registry databases.</p>
              </div>
              <span className="text-[10px] text-blue-400 font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                Filing Registry Compliant • 2026 Guidelines
              </span>
            </div>
            <UseCasesSection />
          </section>

          {/* COMPARATIVE SYSTEM TABLE */}
          <section id="comparison-section-head" className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-display font-semibold text-xl sm:text-2xl text-white mb-2">We Eliminate Standard Sacrifices</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-sans">Contrast our client-side range bisecting optimizer with typical server utilities on the web.</p>
            </div>
            <ComparisonTable />
          </section>

          {/* FAQ SECTION EXPANDABLES */}
          <section id="faq-section-head" className="mb-20">
            <FAQSection />
          </section>
        </div>

        {/* FICTIONAL PRO TIERS INTERACTION HERO BOX */}
        <section id="pro-upgrade-cardlet" className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 overflow-hidden relative mb-12 bg-gradient-to-tr from-white/3 to-blue-950/15">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-left">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-widest inline-flex items-center gap-1 mb-2">
                <Crown size={11} className="text-amber-400" /> Enterprise expansion license
              </span>
              <h3 className="font-display font-semibold text-lg sm:text-xl text-white mb-2">Need Cloud Batch API Automations?</h3>
              <p className="text-xs text-gray-400 max-w-xl leading-relaxed font-sans">
                Unlock rapid bulk queue script pipelines, automated folder targets syncing, and command-line terminal tools to decompress local gigabyte PDF catalogs. Toggle on Pro for full simulations!
              </p>
            </div>

            <button
              id="activate-pro-sub-trigger"
              onClick={() => setIsProUser(!isProUser)}
              className="w-full md:w-auto text-xs font-semibold py-2.5 px-5 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-display shrink-0 flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
            >
              <span>{isProUser ? 'Toggle Mode Back' : 'Claim Free Pro License Certificate'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </main>

      {/* MODAL 1: STUNNING FULLSCREEN HIGH-FIDELITY MAGNIFIER VISUAL LIGHTBOX */}
      {lightboxFileId && (() => {
        const fileObj = files.find(f => f.id === lightboxFileId);
        if (!fileObj) return null;

        return (
          <div id="fullscreen-peep-lightbox" className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col justify-between overflow-hidden">
            {/* Lightbox header bar */}
            <div className="p-4 border-b border-white/5 bg-gray-900/40 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block truncate max-w-xs">{fileObj.name}</span>
                <span className="text-[10px] text-gray-400 block font-sans">
                  Original: {formatSize(fileObj.originalSize)} ➔ Compressed: {formatSize(fileObj.compressedSize || 0)}
                </span>
              </div>

              {/* Mode switch controllers */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-xs">
                  <button
                    id="lightbox-mode-slider-trigger"
                    onClick={() => setLightboxMode('split')}
                    className={`py-1 px-3 rounded-lg font-medium transition-all cursor-pointer ${lightboxMode === 'split' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}
                  >
                    Split Splitter
                  </button>
                  <button
                    id="lightbox-mode-swap-trigger"
                    onClick={() => {
                      setLightboxMode('swap');
                      setLightboxSwapOriginal(false);
                    }}
                    className={`py-1 px-3 rounded-lg font-medium transition-all cursor-pointer ${lightboxMode === 'swap' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}
                  >
                    Tap to Swap
                  </button>
                </div>

                <button
                  id="btn-close-lightbox-peep"
                  onClick={() => setLightboxFileId(null)}
                  className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Lightbox Comparative panel viewport */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4">
              {lightboxMode === 'split' ? (
                <div className="w-full h-full max-w-5xl">
                  {fileObj.compressedUrl ? (
                    <ZoomPeeper
                      originalUrl={fileObj.previewUrl}
                      compressedUrl={fileObj.compressedUrl}
                      originalSize={fileObj.originalSize}
                      compressedSize={fileObj.compressedSize || fileObj.originalSize}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500/40 border-t-blue-500 animate-spin mb-3" />
                      <span className="text-xs text-gray-400">Loading fine detail contrast matrix layers...</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Easy Touch Swipe/Tap toggle: perfect for narrow cellphones! */
                <div 
                  id="lightbox-swap-clickbox"
                  onClick={() => setLightboxSwapOriginal(!lightboxSwapOriginal)}
                  className="relative w-full h-full max-w-3xl border border-white/5 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer select-none"
                  title="Click anywhere to swap comparison viewports instantly"
                >
                  <img
                    id="swap-peep-renderer"
                    src={lightboxSwapOriginal ? fileObj.previewUrl : (fileObj.compressedUrl || fileObj.previewUrl)}
                    alt="Lightbox Preview"
                    className="w-full h-full object-contain p-4"
                  />

                  {/* Active viewport reading badge layer */}
                  <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/80 backdrop-blur border border-white/10 font-sans">
                    <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-mono">Viewing Viewport</span>
                    <span className="text-xs font-extrabold text-white block">
                      {lightboxSwapOriginal ? '🚨 ORIGINAL UNCOMPRESSED SOURCE' : '⚡ OUT: OPTIMIZED SCANNING FRAME'}
                    </span>
                    <p className="text-[9px] text-blue-400 font-medium mt-0.5">💡 Tap anywhere in lightbox to compare instantly</p>
                  </div>

                  <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-blue-600 font-display font-medium text-xs text-white text-center shadow-lg pointer-events-none">
                    {lightboxSwapOriginal ? 'Original uncompressed' : 'Optimized format'}
                  </span>
                </div>
              )}
            </div>

            {/* Lightbox Footer Actions bar */}
            <div className="p-4 border-t border-white/5 bg-gray-900/60 text-center font-sans">
              <p className="text-xs text-gray-400 mb-2">Check fine resolution and readable barcoding contours before export safely.</p>
              <button
                id="btn-lightbox-download-action"
                onClick={() => {
                  downloadFile(fileObj);
                  setLightboxFileId(null);
                }}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-transform"
              >
                <Download size={13} /> Save &amp; Download Checked File ({formatSize(fileObj.compressedSize || 0)})
              </button>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: LOCAL DEVICE SECURE TRANSMITTAL QR GENERATOR (Offline WiFi transfer) */}
      {qrShareFileId && (() => {
        const fileObj = files.find(f => f.id === qrShareFileId);
        if (!fileObj || !fileObj.compressedUrl) return null;

        // Visual loop data address backplane linkage
        const transferFauxUrl = `${window.location.origin}/download-offline?id=${fileObj.id}`;
        // Generate a beautiful scannable QR points image through lightweight web services safely
        const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fileObj.compressedUrl)}`;

        return (
          <div id="smart-qr-share-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 w-full max-w-sm text-center relative overflow-hidden bg-gradient-to-tr from-white/3 to-indigo-950/20">
              
              <button
                id="close-qr-share-modal"
                onClick={() => {
                  setQrShareFileId(null);
                  setCopiedLink(false);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg text-xs"
              >
                ✕ Close
              </button>

              <Smartphone size={32} className="text-emerald-400 mx-auto mb-3 animate-levitate" />
              <h4 className="font-display font-semibold text-white mb-1 text-base">Transmit to Phone Controller</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto mb-5 leading-relaxed font-sans">
                Scan this offline address matrix to directly download the optimized document on your physical smartphone. Essential for quick filing uploads!
              </p>

              {/* Scannable physical QR point rendering */}
              <div className="p-3 bg-white rounded-xl max-w-[190px] mx-auto mb-5 border border-white/10 shadow-xl relative overflow-hidden">
                <img
                  id="qr-render-frame"
                  src={qrImgSrc}
                  alt="Scannable transmission matrix"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Fast Copy-Link buttons alternative */}
              <div className="space-y-3 font-sans">
                <button
                  id="btn-fast-copy-local-link"
                  onClick={() => {
                    navigator.clipboard.writeText(fileObj.compressedUrl || '');
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-200 text-xs border border-white/10 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                >
                  <Copy size={12} />
                  <span>{copiedLink ? '✓ Copied local buffer!' : 'Copy Local Blob Link'}</span>
                </button>
                
                <p className="text-[10px] text-gray-500 italic block leading-snug">
                  * Note: Antigravity processes 100% locally. The file resides entirely inside your client web-RAM cache.
                </p>
              </div>

            </div>
          </div>
        );
      })()}

      {/* FOOTER BAR BRAND SECTION */}
      <footer id="main-footer-slate" className="relative z-10 border-t border-white/5 bg-white/[0.01] py-10 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Cpu size={14} />
            </div>
            <div className="text-left">
              <span className="font-display font-semibold text-white tracking-wide text-xs sm:text-sm">ANTIGRAVITY RANGE COMPRESSOR</span>
              <p className="text-[10px] text-gray-600 font-mono">Free, Secure Local File Optimizers under 2026 mandates</p>
            </div>
          </div>

          <div className="text-center md:text-right font-sans">
            <p className="text-xs text-gray-400">100% secure. Built using react-canvas and local binary bisect algorithms.</p>
            <p className="text-[10px] text-gray-500 mt-0.5 font-mono">© 2026 Antigravity Sandbox Inc. Processing operates solely inside localized web sandbox.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
