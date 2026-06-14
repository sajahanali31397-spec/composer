export interface FileItem {
  id: string;
  name: string;
  originalSize: number;
  originalType: string;
  file: File;
  previewUrl: string;
  width?: number; // for images
  height?: number; // for images
  compressedSize?: number;
  compressedUrl?: string;
  compressedType?: string;
  isPDF: boolean;
  pdfPages?: number;
  processing: boolean;
  error?: string;
}

export type TargetFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

export interface CompressionSettings {
  targetSizeKb: number | 'auto';
  customKbValue: string; // bound to text input
  quality: number; // 0.1 to 1
  outputFormat: TargetFormat;
  preserveQR: boolean;
  removeMetadata: boolean;
  scaleMode: 'percent' | 'dimensions';
  scalePercentage: number;
  scaleWidth: number | '';
  scaleHeight: number | '';
  cropRatio: string; // 'free' | 'passport' | 'A4' | '1:1' | '16:9'
}

export interface CropArea {
  x: number; // percentage of original width (0 to 1)
  y: number; // percentage of original height (0 to 1)
  width: number; // percentage of original width
  height: number; // percentage of original height
}
