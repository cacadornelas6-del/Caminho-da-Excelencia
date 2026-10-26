/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Pathfinder, PathfinderStatus } from '../types/index.ts';
import { PATHFINDER_CLASSES } from '../data/curriculum.ts';
import { compressImage } from '../utils/imageCompressor.ts';
import { ASSETS } from '../assets/assets.ts';
import { ProfilePhotoMenu } from './ProfilePhotoMenu.tsx';

interface PathfinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubUnits: string[];
  editingPf: Pathfinder | null;
  onSave: (data: {
    fullName: string;
    photoUrl: string;
    unit: string;
    currentClass: string;
    birthDate?: string;
    status?: PathfinderStatus;
    notes?: string;
  }) => Promise<void>;
}

const PRESET_AVATARS = [
  { label: 'Desbravador 1', url: ASSETS.avatarBoy },
  { label: 'Desbravadora 1', url: ASSETS.avatarGirl },
  { label: 'Líder / Diretor', url: ASSETS.avatarDirector },
];

export const PathfinderModal: React.FC<PathfinderModalProps> = ({
  isOpen,
  onClose,
  clubUnits,
  editingPf,
  onSave,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [unit, setUnit] = useState<string>(clubUnits[0] || 'Águia Real');
  const [currentClass, setCurrentClass] = useState<string>('Amigo');
  const [birthDate, setBirthDate] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_AVATARS[0].url);
  const [status, setStatus] = useState<PathfinderStatus>('ativo');
  const [notes, setNotes] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [compressionFeedback, setCompressionFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingPf) {
      setFullName(editingPf.fullName);
      setUnit(editingPf.unit);
      setCurrentClass(editingPf.currentClass);
      setBirthDate(editingPf.birthDate || '');
      setPhotoUrl(editingPf.photoUrl);
      setStatus(editingPf.status);
      setNotes(editingPf.notes || '');
    } else {
      setFullName('');
      setUnit(clubUnits[0] || 'Águia Real');
      setCurrentClass('Amigo');
      setBirthDate('');
      setPhotoUrl(PRESET_AVATARS[0].url);
      setStatus('ativo');
      setNotes('');
    }
    setError('');
    setCompressionFeedback('');
  }, [editingPf, isOpen, clubUnits]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setError('');
      const compressed = await compressImage(file, 500, 500, 0.82);
      setPhotoUrl(compressed.dataUrl);
      const originalKb = Math.round(compressed.originalSizeBytes / 1024);
      const compressedKb = Math.round(compressed.sizeBytes / 1024);
      setCompressionFeedback(
        `Foto comprimida com sucesso: de ${originalKb} KB para ${compressedKb} KB!`
      );
    } catch (err: any) {
      setError('Falha ao processar a fotografia selecionada.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('O nome completo do desbravador é obrigatório (mínimo 3 caracteres).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        fullName: fullName.trim(),
        photoUrl,
        unit,
        currentClass,
        birthDate: birthDate || undefined,
        status,
        notes: notes.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Erro ao salvar desbravador.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pf-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-[#092642] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pf-modal-title" className="text-base font-bold text-white">
                {editingPf ? 'Editar Cadastro do Desbravador' : 'Novo Desbravador'}
              </h2>
              <p className="text-xs text-[#8FA6C2]">
                Registro individual de membro e matrícula no clube
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Photo Section with Upload & Compression */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Fotografia do Perfil (Comprimida para Supabase Storage)
            </label>
            <div className="flex items-center gap-4">
              <ProfilePhotoMenu
                photoUrl={photoUrl || PRESET_AVATARS[0].url}
                defaultPhotoUrl={PRESET_AVATARS[0].url}
                userName={fullName || 'Desbravador'}
                subtitle={currentClass}
                size="lg"
                onUpdatePhoto={(newPhoto) => {
                  setPhotoUrl(newPhoto);
                  setCompressionFeedback('Foto atualizada com sucesso!');
                }}
                onRemovePhoto={() => {
                  setPhotoUrl(PRESET_AVATARS[0].url);
                  setCompressionFeedback('Foto redefinida para o avatar padrão.');
                }}
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="photo-upload-input"
                    className="flex items-center gap-1.5 rounded-lg border border-[#092642] bg-[#092642]/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#092642] hover:text-white cursor-pointer transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#FFC21A]" />
                    <span>{isCompressing ? 'Comprimindo...' : 'Fazer Upload de Foto'}</span>
                  </label>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isCompressing}
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#8FA6C2]">
                  <span>Ou selecione um avatar rápido:</span>
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(av.url)}
                      className="rounded border border-[#092642] px-1.5 py-0.5 text-[10px] hover:border-[#FFC21A] transition-colors"
                    >
                      {av.label}
                    </button>
                  ))}
                </div>

                {compressionFeedback && (
                  <div className="text-[11px] font-medium text-emerald-400">
                    {compressionFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="pf-fullname" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Nome Completo do Desbravador *
            </label>
            <input
              id="pf-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex.: Lucas Gabriel da Silva"
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Unit & Class selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-unit" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Unidade *
              </label>
              <select
                id="pf-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none transition-colors"
                required
              >
                {clubUnits.map((u) => (
                  <option key={u} value={u}>
                    Unidade {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pf-class" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Classe Regular Atual *
              </label>
              <select
                id="pf-class"
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none transition-colors"
                required
              >
                {PATHFINDER_CLASSES.map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name} ({cls.age} anos)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Birth Date and Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-birthdate" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Data de Nascimento
              </label>
              <input
                id="pf-birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="pf-status" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Situação no Programa
              </label>
              <select
                id="pf-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PathfinderStatus)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none transition-colors"
              >
                <option value="ativo">Ativo</option>
                <option value="destaque">Destaque do Mês</option>
                <option value="observacao">Em Observação</option>
                <option value="graduado">Graduado / Líder</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="pf-notes" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Observações Médicas ou Especiais
            </label>
            <textarea
              id="pf-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, autorizações especiais, histórico ou menções honrosas..."
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 p-3 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#092642]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#092642] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-5 py-2 text-xs font-bold text-[#031426] shadow-md shadow-[#FFC21A]/20 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? 'Salvando...' : editingPf ? 'Salvar Alterações' : 'Cadastrar Desbravador'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
