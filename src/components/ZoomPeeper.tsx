import React, { useState, useRef, useEffect } from 'react';
import { Eye, Settings, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface ZoomPeeperProps {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
}

export const ZoomPeeper: React.FC<ZoomPeeperProps> = ({
  originalUrl,
  compressedUrl,
  originalSize,
  compressedSize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // Slider percent 0-100
  const [isSliding, setIsSliding] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3); // 3x zoom default
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, showLens: false });

  // Handle split-screen slider drags
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSliding) {
      handleMove(e.clientX);
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verify if hovering inside bounding area
    const showLens = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    setMousePos({ x, y, showLens });
  };

  const handleMouseLeave = () => {
    setIsSliding(false);
    setMousePos((prev) => ({ ...prev, showLens: false }));
  };

  // Convert bytes size to human-readable string
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const shrinkRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

  return (
    <div id="pixel-peep-root" className="glass-panel p-5 rounded-2xl glow-border-blue text-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="font-display font-medium text-blue-400 flex items-center gap-2 text-base">
            <Eye size={18} id="eye-peep-icon" /> Split-Screen Quality Inspector
          </span>
          <p className="text-xs text-gray-400 font-sans">Scrub the slider or hover to double-check QR nodes and regulatory micro-text.</p>
        </div>

        {/* Dynamic shrink badge statistics */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Sparkles size={12} /> Desqueezed by {shrinkRatio}%
          </span>
        </div>
      </div>

      {/* Main Comparative Interactive Frame */}
      <div
        id="peep-viewer-sandbox"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-80 bg-black/50 border border-white/5 rounded-xl overflow-hidden cursor-ew-resize select-none"
      >
        {/* Underlay layer: Compressed Version */}
        <div id="underlay-compressed-view" className="absolute inset-0 w-full h-full flex items-center justify-center p-2">
          <img
            id="compressed-pixel-image"
            src={compressedUrl}
            alt="Compressed result"
            className="w-full h-full object-contain pointer-events-none opacity-95 transition-opacity"
          />
        </div>

        {/* Overlay sliding layer: Original version */}
        <div
          id="overlay-original-sliding-layer"
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2" style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}>
            <img
              id="original-pixel-image"
              src={originalUrl}
              alt="Original uncompressed"
              className="w-full h-full object-contain max-w-none"
              style={{ width: containerRef.current ? containerRef.current.clientWidth - 16 : '100%', height: containerRef.current ? containerRef.current.clientHeight - 16 : '100%' }}
            />
          </div>
        </div>

        {/* Scrubbing slider division line bar */}
        <div
          id="peep-scrub-division-handle"
          onMouseDown={() => setIsSliding(true)}
          onTouchStart={() => setIsSliding(true)}
          className="absolute inset-y-0 w-[2px] bg-blue-500 cursor-ew-resize shadow-[0_0_12px_rgba(59,130,246,0.9)]"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Central handle indicator button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 border border-white shadow-xl flex items-center justify-center pointer-events-none">
            <div className="flex gap-0.5">
              <span className="w-[1.5px] h-3 bg-white" />
              <span className="w-[1.5px] h-3 bg-white" />
            </div>
          </div>
        </div>

        {/* Visual floating labels indicating directions */}
        <span className="absolute bottom-2 left-2 px-2 py-0.75 rounded bg-black/70 backdrop-blur font-mono text-[10px] text-gray-300 border border-white/5 font-semibold">
          ORIGINAL ({formatSize(originalSize)})
        </span>
        <span className="absolute bottom-2 right-2 px-2 py-0.75 rounded bg-black/70 backdrop-blur font-mono text-[10px] text-blue-300 border border-blue-500/20 font-semibold">
          COMPRESSED ({formatSize(compressedSize)})
        </span>

        {/* Hover-driven Magnification Lens Bubble! */}
        {mousePos.showLens && !isSliding && containerRef.current && (
          <div
            id="peep-hover-lens-bubble"
            className="absolute w-36 h-36 rounded-full border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] overflow-hidden pointer-events-none"
            style={{
              left: `${mousePos.x - 72}px`,
              top: `${mousePos.y - 72}px`,
              background: '#020204',
            }}
          >
            {/* Split viewport inside the magnifying lens! */}
            <div className="relative w-full h-full">
              {/* If cursor is on the left of slider, magnify the Original image. On the right, magnify Compressed! */}
              {mousePos.x <= (containerRef.current.clientWidth * sliderPos) / 100 ? (
                <div
                  id="magnified-original-lens"
                  className="w-[300%] h-[300%] absolute origin-center"
                  style={{
                    backgroundImage: `url(${originalUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    transform: `scale(${zoomLevel}) translate(-${((mousePos.x / containerRef.current.clientWidth) * 100) - 50}%, -${((mousePos.y / containerRef.current.clientHeight) * 100) - 50}%)`,
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <div
                  id="magnified-compressed-lens"
                  className="w-[300%] h-[300%] absolute origin-center"
                  style={{
                    backgroundImage: `url(${compressedUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    transform: `scale(${zoomLevel}) translate(-${((mousePos.x / containerRef.current.clientWidth) * 100) - 50}%, -${((mousePos.y / containerRef.current.clientHeight) * 100) - 50}%)`,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
              
              {/* Small HUD label inside lens */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 px-1 rounded bg-blue-600 text-[8px] text-white font-mono uppercase tracking-widest font-semibold whitespace-nowrap">
                {zoomLevel}X Spot-peep
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lens controls */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <AlertCircle size={12} className="text-blue-400" />
          Hover mouse over canvas to magnify details up to 5x.
        </span>
        <div className="flex items-center gap-2">
          <span>Zoom:</span>
          {[2, 3, 5].map((z) => (
            <button
              id={`btn-peep-zoom-${z}`}
              key={z}
              onClick={() => setZoomLevel(z)}
              className={`px-2 py-0.5 rounded font-mono text-[10px] transition-all cursor-pointer ${
                zoomLevel === z
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
