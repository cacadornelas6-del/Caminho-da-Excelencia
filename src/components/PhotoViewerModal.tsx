/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  title?: string;
  subtitle?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  title = 'Foto de Perfil',
  subtitle,
}) => {
  const [scale, setScale] = React.useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `desbravapro-foto-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-viewer-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl bg-[#092642]/90 border border-slate-700/60 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#031426]/70">
          <div>
            <h3 id="photo-viewer-title" className="text-sm font-bold text-white tracking-wide">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#8FA6C2]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-[#031426] transition-colors cursor-pointer"
            aria-label="Fechar visualização"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image viewport */}
        <div className="my-5 flex items-center justify-center w-full h-72 sm:h-80 overflow-hidden rounded-xl bg-[#031426]/80 border border-[#031426]">
          <img
            src={photoUrl}
            alt={title}
            style={{ transform: `scale(${scale})` }}
            className="max-h-full max-w-full object-contain transition-transform duration-200 ease-out select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleZoomOut}
            className="rounded-lg bg-[#031426] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#031426]/80 flex items-center gap-1 border border-slate-700/50 cursor-pointer"
            title="Reduzir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="rounded-lg bg-[#031426] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#031426]/80 border border-slate-700/50 cursor-pointer"
            title="Tamanho original"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="rounded-lg bg-[#031426] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#031426]/80 flex items-center gap-1 border border-slate-700/50 cursor-pointer"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-[#FFC21A] px-3 py-1.5 text-xs font-bold text-[#031426] hover:bg-[#FFD147] flex items-center gap-1 shadow cursor-pointer ml-2"
            title="Baixar foto"
          >
            <Download className="h-4 w-4" />
            <span>Baixar</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
