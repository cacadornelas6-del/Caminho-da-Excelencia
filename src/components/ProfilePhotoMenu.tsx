/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Eye, Camera, Folder, Trash2 } from 'lucide-react';
import { PhotoViewerModal } from './PhotoViewerModal.tsx';
import { CameraCaptureModal } from './CameraCaptureModal.tsx';

interface ProfilePhotoMenuProps {
  photoUrl?: string;
  defaultPhotoUrl?: string;
  userName?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
  canEdit?: boolean;
  onUpdatePhoto: (newPhotoUrl: string) => void | Promise<void>;
  onRemovePhoto?: () => void | Promise<void>;
  className?: string;
}

export const ProfilePhotoMenu: React.FC<ProfilePhotoMenuProps> = ({
  photoUrl,
  defaultPhotoUrl = '/src/assets/images/avatar_director_leader_1793039962613.jpg',
  userName = 'Usuário',
  subtitle,
  size = 'md',
  shape = 'circle',
  canEdit = true,
  onUpdatePhoto,
  onRemovePhoto,
  className = '',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPhoto = photoUrl || defaultPhotoUrl;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Size styling map
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9 sm:h-10 sm:w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20 sm:h-24 sm:w-24',
  };

  const badgeSizeMap = {
    sm: 'h-3.5 w-3.5 p-0.5',
    md: 'h-4 w-4 p-0.5',
    lg: 'h-5 w-5 p-1',
    xl: 'h-6 w-6 p-1',
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  // Client-side image compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 512;
        let width = img.width;
        let height = img.height;

        // Crop square or scale
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = Math.min(minDim, maxSize);
        canvas.height = Math.min(minDim, maxSize);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Compress to JPEG with 85% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onUpdatePhoto(compressedDataUrl);
        }
        setIsProcessing(false);
        setMenuOpen(false);
      };

      img.onerror = () => {
        setIsProcessing(false);
        setMenuOpen(false);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleOpenViewer = () => {
    setMenuOpen(false);
    setShowViewer(true);
  };

  const handleOpenCamera = () => {
    setMenuOpen(false);
    setShowCamera(true);
  };

  const handleTriggerUpload = () => {
    setMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setMenuOpen(false);
    if (onRemovePhoto) {
      onRemovePhoto();
    } else {
      onUpdatePhoto(defaultPhotoUrl);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        aria-hidden="true"
      />

      {/* Avatar Clickable Trigger */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        title={canEdit ? 'Clique para alterar a foto do perfil' : 'Visualizar foto'}
        className={`group relative flex items-center justify-center overflow-hidden border-2 border-[#FFC21A]/50 bg-[#031426] shadow-sm transition-all duration-150 hover:border-[#FFC21A] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FFC21A]/50 cursor-pointer ${shapeClass} ${sizeMap[size]}`}
      >
        <img
          src={currentPhoto}
          alt={userName}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover select-none"
        />

        {/* Hover overlay with camera icon */}
        {canEdit && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100">
            <Camera className="h-4 w-4 text-[#FFC21A] drop-shadow" />
          </div>
        )}

        {/* Loading spinner overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-10">
            <div className="h-4 w-4 border-2 border-[#FFC21A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* Small badge icon in the corner */}
      {canEdit && (
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#FFC21A] text-[#031426] shadow border border-[#031426] transition-transform hover:scale-110 cursor-pointer ${badgeSizeMap[size]}`}
          title="Opções de foto"
        >
          <Camera className="h-2.5 w-2.5 stroke-[2.5]" />
        </button>
      )}

      {/* Contextual Popover Menu matching the user's reference image */}
      {menuOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-[#18191c] p-1.5 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{ minWidth: '170px' }}
        >
          {/* Option 1: Mostrar foto */}
          <button
            type="button"
            role="menuitem"
            onClick={handleOpenViewer}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Eye className="h-4 w-4 text-slate-300 shrink-0" />
            <span>Mostrar foto</span>
          </button>

          {/* Option 2: Tirar foto */}
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={handleOpenCamera}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Camera className="h-4 w-4 text-slate-300 shrink-0" />
              <span>Tirar foto</span>
            </button>
          )}

          {/* Option 3: Carregar foto */}
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={handleTriggerUpload}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Folder className="h-4 w-4 text-slate-300 shrink-0" />
              <span>Carregar foto</span>
            </button>
          )}

          {/* Divider */}
          {canEdit && (
            <div className="my-1 border-t border-slate-700/60" />
          )}

          {/* Option 4: Remover foto */}
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={handleRemove}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 text-red-400 shrink-0" />
              <span>Remover foto</span>
            </button>
          )}
        </div>
      )}

      {/* Lightbox Photo Viewer Modal */}
      <PhotoViewerModal
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        photoUrl={currentPhoto}
        title={userName}
        subtitle={subtitle}
      />

      {/* Webcam Live Capture Modal */}
      <CameraCaptureModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoCaptured={(newPhoto) => {
          onUpdatePhoto(newPhoto);
        }}
        onSwitchToFileUpload={() => {
          if (fileInputRef.current) fileInputRef.current.click();
        }}
      />
    </div>
  );
};
