/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, RefreshCw, Check, AlertCircle, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  onSwitchToFileUpload?: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  onSwitchToFileUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Start webcam when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setErrorMsg(null);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsLoading(true);
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso direto à câmera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLoading(false);
    } catch (err: unknown) {
      console.warn('Erro ao acessar câmera:', err);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Habilite a câmera nas configurações do navegador.'
          : 'Não foi possível inicializar a câmera do dispositivo.';
      setErrorMsg(message);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Square crop for avatar
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    // Flip horizontally if front camera for natural selfie orientation
    if (facingMode === 'user') {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto);
      onClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative max-w-md w-full rounded-2xl bg-[#092642] border border-[#0d3b66] shadow-2xl p-5 overflow-hidden flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#031426]">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#FFC21A]" />
            <h3 id="camera-modal-title" className="text-sm font-bold text-white">
              {capturedPhoto ? 'Revisar Foto' : 'Tirar Foto com a Câmera'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-[#031426] transition-colors cursor-pointer"
            aria-label="Fechar câmera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Viewport */}
        <div className="relative my-4 w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-[#FFC21A]/50 bg-[#031426] flex items-center justify-center shadow-inner">
          {errorMsg ? (
            <div className="px-4 text-center">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{errorMsg}</p>
              {onSwitchToFileUpload && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToFileUpload();
                  }}
                  className="rounded-lg bg-[#FFC21A] px-3 py-1.5 text-xs font-bold text-[#031426] hover:bg-[#FFD147] flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Carregar do Arquivo</span>
                </button>
              )}
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#031426]/90 z-10">
                  <RefreshCw className="h-7 w-7 text-[#FFC21A] animate-spin mb-2" />
                  <span className="text-xs text-slate-300">Iniciando câmera...</span>
                </div>
              )}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {/* Circular framing crosshair */}
              <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-dashed border-[#FFC21A]/30" />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-center gap-3 pt-2">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="rounded-xl border border-slate-600 bg-[#031426] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#031426]/80 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Tirar Outra</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-xl bg-[#FFC21A] px-5 py-2 text-xs font-bold text-[#031426] hover:bg-[#FFD147] flex items-center gap-1.5 shadow-lg shadow-[#FFC21A]/20 cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Usar Esta Foto</span>
              </button>
            </>
          ) : !errorMsg ? (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                className="rounded-xl border border-slate-700 bg-[#031426] p-2.5 text-slate-300 hover:text-white hover:bg-[#031426]/80 cursor-pointer"
                title="Alternar câmera frontal/traseira"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={isLoading}
                className="rounded-xl bg-[#FFC21A] px-6 py-2.5 text-xs font-bold text-[#031426] hover:bg-[#FFD147] flex items-center gap-2 shadow-lg shadow-[#FFC21A]/20 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="h-4 w-4 stroke-[2.5]" />
                <span>Capturar Foto</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
