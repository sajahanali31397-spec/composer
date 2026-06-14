import React, { useState, useEffect, useRef } from 'react';
import { CropArea } from '../types';
import { Crop, Move, Maximize, RefreshCw, Landmark } from 'lucide-react';

interface DocCropperProps {
  imageUrl: string;
  cropArea: CropArea;
  onChange: (area: CropArea) => void;
  aspectRatio: string; // 'free' | 'passport' | 'A4' | '1:1' | '16:9'
}

export const DocCropper: React.FC<DocCropperProps> = ({
  imageUrl,
  cropArea,
  onChange,
  aspectRatio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  // Update crop area when aspect ratio changes
  useEffect(() => {
    if (aspectRatio === 'free') return;

    let targetRatio = 1.0;
    if (aspectRatio === 'passport') {
      targetRatio = 3.5 / 4.5; // Passport size: 35mm x 45mm
    } else if (aspectRatio === 'A4') {
      targetRatio = 210 / 297; // A4 standard ratio
    } else if (aspectRatio === '16:9') {
      targetRatio = 16 / 9;
    } else if (aspectRatio === '1:1') {
      targetRatio = 1.0;
    }

    // Adjust cropArea height to match aspect ratio
    const currentW = cropArea.width;
    let newH = currentW / targetRatio;

    // Adjust if height overflow
    if (newH > 1.0) {
      newH = 1.0;
      const newW = newH * targetRatio;
      onChange({
        x: Math.max(0, 0.5 - newW / 2),
        y: 0,
        width: Math.min(1.0, newW),
        height: 1.0,
      });
    } else {
      onChange({
        ...cropArea,
        height: newH,
        y: Math.max(0, 0.5 - newH / 2),
      });
    }
  }, [aspectRatio]);

  // Adjust crop manually from range sliders
  const handleSliderChange = (field: keyof CropArea, val: number) => {
    const updated = { ...cropArea, [field]: val };

    // Prevent boundaries crossing
    if (field === 'x') {
      if (updated.x + updated.width > 1.0) {
        updated.width = 1.0 - updated.x;
      }
    }
    if (field === 'y') {
      if (updated.y + updated.height > 1.0) {
        updated.height = 1.0 - updated.y;
      }
    }
    if (field === 'width') {
      if (updated.x + updated.width > 1.0) {
        updated.x = 1.0 - updated.width;
      }
    }
    if (field === 'height') {
      if (updated.y + updated.height > 1.0) {
        updated.y = 1.0 - updated.height;
      }
    }

    onChange(updated);
  };

  const resetCrop = () => {
    onChange({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  };

  const handleMouseDown = (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveHandle(handle);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropW: cropArea.width,
      cropH: cropArea.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeHandle || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.current.x) / rect.width;
      const deltaY = (e.clientY - dragStart.current.y) / rect.height;

      let nextX = dragStart.current.cropX;
      let nextY = dragStart.current.cropY;
      let nextW = dragStart.current.cropW;
      let nextH = dragStart.current.cropH;

      if (activeHandle === 'move') {
        nextX = Math.max(0, Math.min(1.0 - nextW, dragStart.current.cropX + deltaX));
        nextY = Math.max(0, Math.min(1.0 - nextH, dragStart.current.cropY + deltaY));
      } else if (activeHandle === 'se') {
        nextW = Math.max(0.1, Math.min(1.0 - nextX, dragStart.current.cropW + deltaX));
        nextH = Math.max(0.1, Math.min(1.0 - nextY, dragStart.current.cropH + deltaY));
        
        // Lock aspect ratio
        if (aspectRatio !== 'free') {
          let ratio = 1.0;
          if (aspectRatio === 'passport') ratio = 3.5 / 4.5;
          if (aspectRatio === 'A4') ratio = 210 / 297;
          if (aspectRatio === '16:9') ratio = 16 / 9;
          if (aspectRatio === '1:1') ratio = 1.0;
          
          nextH = nextW / ratio;
          if (nextY + nextH > 1.0) {
            nextH = 1.0 - nextY;
            nextW = nextH * ratio;
          }
        }
      }

      onChange({
        x: Number(nextX.toFixed(4)),
        y: Number(nextY.toFixed(4)),
        width: Number(nextW.toFixed(4)),
        height: Number(nextH.toFixed(4)),
      });
    };

    const handleMouseUp = () => {
      setActiveHandle(null);
    };

    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeHandle, cropArea, onChange, aspectRatio]);

  return (
    <div id="crop-workspace-wrapper" className="glass-panel p-5 rounded-2xl glow-border-blue text-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display font-medium text-blue-400 flex items-center gap-2">
          <Crop size={16} id="crop-icon-indicator" /> High-Accuracy Document Cropping
        </span>
        <button
          id="btn-recrop-reset"
          onClick={resetCrop}
          className="text-xs flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <RefreshCw size={12} /> Reset Boundaries
        </button>
      </div>

      {/* Visually Draggable Workspace Box */}
      <div
        id="crop-live-canvas-container"
        ref={containerRef}
        className="relative overflow-hidden w-full h-64 sm:h-80 bg-black/40 rounded-xl flex items-center justify-center border border-white/5"
      >
        <img
          id="crop-underlay-image"
          src={imageUrl}
          alt="Cropping viewport"
          className="max-w-full max-h-full object-contain pointer-events-none select-none"
          onLoad={(e) => {
            const el = e.currentTarget;
            setImageSize({ width: el.clientWidth, height: el.clientHeight });
          }}
        />

        {/* Shrouded Overlay for off-bounds area */}
        <div
          id="cropping-area-overlay"
          className="absolute inset-0 cursor-crosshair"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Active Crop Highlighting Bounding Box */}
          <div
            id="crop-active-box"
            className="absolute border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            style={{
              left: `${cropArea.x * 100}%`,
              top: `${cropArea.y * 100}%`,
              width: `${cropArea.width * 100}%`,
              height: `${cropArea.height * 100}%`,
              backgroundImage: 'radial-gradient(circle, transparent 20%, rgba(59,130,246,0.1) 80%)',
            }}
          >
            {/* Aspect Ratio Guideline stamp */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-blue-600/90 text-[10px] text-white font-mono uppercase tracking-widest flex items-center gap-1 font-semibold">
              {aspectRatio === 'passport' && <Landmark size={10} />}
              {aspectRatio} Window
            </div>

            {/* Draggable Area - Center Handler */}
            <div
              id="crop-drag-helper-center"
              onMouseDown={(e) => handleMouseDown('move', e)}
              className="absolute inset-0 cursor-move flex items-center justify-center bg-transparent active:bg-white/5 transition-all"
              title="Drag here to move the cropping frame"
            >
              <Move size={20} className="text-white/40 drop-shadow" />
            </div>

            {/* Handle - Bottom-Right / South-East Anchor */}
            <div
              id="crop-corner-se"
              onMouseDown={(e) => handleMouseDown('se', e)}
              className="absolute bottom-[-6px] right-[-6px] w-4 h-4 bg-white border-2 border-blue-650 rounded-full cursor-se-resize shadow-md hover:scale-125 transition-transform"
              title="Drag to resize crop area"
            />
          </div>
        </div>
      </div>

      {/* Manual Coordinates Control Rails */}
      <div id="manual-crop-sliders-section" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-white/5 p-4 rounded-xl">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Horizontal Location (x): {Math.round(cropArea.x * 100)}%</label>
          <input
            id="slider-crop-x"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={cropArea.x}
            onChange={(e) => handleSliderChange('x', parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Vertical Location (y): {Math.round(cropArea.y * 100)}%</label>
          <input
            id="slider-crop-y"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={cropArea.y}
            onChange={(e) => handleSliderChange('y', parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Crop Width (w): {Math.round(cropArea.width * 100)}%</label>
          <input
            id="slider-crop-w"
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={cropArea.width}
            onChange={(e) => handleSliderChange('width', parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Crop Height (h): {Math.round(cropArea.height * 100)}%</label>
          <input
            id="slider-crop-h"
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={cropArea.height}
            disabled={aspectRatio !== 'free'}
            onChange={(e) => handleSliderChange('height', parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
          />
          {aspectRatio !== 'free' && (
            <p className="text-[10px] text-blue-400 mt-1">Height is locked under aspect ratio: {aspectRatio}</p>
          )}
        </div>
      </div>
    </div>
  );
};
