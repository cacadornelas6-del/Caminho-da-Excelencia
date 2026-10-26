/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { Pathfinder, PointCategory, UserProfile } from '../types/index.ts';

interface ScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathfinders: Pathfinder[];
  currentUser: UserProfile;
  initialPathfinderId?: string;
  onSubmit: (data: {
    pathfinderId: string;
    points: number;
    category: PointCategory;
    activityName: string;
    justification: string;
    activityDate: string;
    approvedBy: string;
    approvedByUserId: string;
  }) => Promise<void>;
}

const CATEGORIES: { label: PointCategory; description: string; defaultPoints: number }[] = [
  { label: 'Classes', description: 'Requisitos de Amigo a Guia e classes avançadas', defaultPoints: 100 },
  { label: 'Especialidades', description: 'Insignias de áreas práticas, natureza e técnicas', defaultPoints: 50 },
  { label: 'Atividades', description: 'Camporis, acampamentos, caminhadas e pernoites', defaultPoints: 30 },
  { label: 'Serviço comunitário', description: 'Campanhas do quilo, mutirões, visitas sociais', defaultPoints: 50 },
  { label: 'Disciplina', description: 'Uniforme de gala, pontualidade, civismo e ordem unida', defaultPoints: 20 },
  { label: 'Liderança', description: 'Capitania, instrução de classes e liderança de equipe', defaultPoints: 40 },
  { label: 'Participação', description: 'Presença exemplar nas reuniões regulares e eventos', defaultPoints: 15 },
  { label: 'Outros', description: 'Méritos e reconhecimentos específicos da diretoria', defaultPoints: 25 },
];

export const ScoringModal: React.FC<ScoringModalProps> = ({
  isOpen,
  onClose,
  pathfinders,
  currentUser,
  initialPathfinderId,
  onSubmit,
}) => {
  const [selectedPfId, setSelectedPfId] = useState<string>(
    initialPathfinderId || (pathfinders[0]?.id ?? '')
  );
  const [category, setCategory] = useState<PointCategory>('Serviço comunitário');
  const [points, setPoints] = useState<number>(50);
  const [activityName, setActivityName] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successAnimation, setSuccessAnimation] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPf = pathfinders.find((p) => p.id === selectedPfId);
  const projectedPoints = currentPf ? currentPf.totalPoints + Number(points || 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Form validations
    if (!selectedPfId) {
      setErrorMessage('Por favor, selecione um desbravador.');
      return;
    }
    if (!activityName.trim()) {
      setErrorMessage('Informe o nome da atividade ou requisito concluído.');
      return;
    }
    if (!justification.trim() || justification.trim().length < 8) {
      setErrorMessage(
        'O motivo da pontuação é obrigatório e deve ter no mínimo 8 caracteres detalhando o mérito.'
      );
      return;
    }
    if (points <= 0 || isNaN(points)) {
      setErrorMessage('A quantidade de pontos deve ser um número positivo maior que zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        pathfinderId: selectedPfId,
        points: Number(points),
        category,
        activityName: activityName.trim(),
        justification: justification.trim(),
        activityDate,
        approvedBy: currentUser.fullName,
        approvedByUserId: currentUser.id,
      });

      setSuccessAnimation(true);
      setTimeout(() => {
        setSuccessAnimation(false);
        setIsSubmitting(false);
        // Reset form
        setActivityName('');
        setJustification('');
        onClose();
      }, 900);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Erro ao registrar pontuação. Tente novamente.');
    }
  };

  const handleCategorySelect = (cat: PointCategory) => {
    setCategory(cat);
    const found = CATEGORIES.find((c) => c.label === cat);
    if (found && points === 50) {
      setPoints(found.defaultPoints);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#092642] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 id="scoring-modal-title" className="text-lg font-bold text-white">
                Lançar e Aprovar Pontuação
              </h2>
              <p className="text-xs text-[#8FA6C2]">
                Avaliação oficial de méritos para o Ranking de Excelência
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

        {/* Error message callout */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success animation overlay */}
        {successAnimation && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-[#031426]/95 backdrop-blur-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="mt-4 text-base font-bold text-white">
              Pontuação Aprovada com Sucesso!
            </div>
            <div className="text-xs text-[#8FA6C2]">
              Atualizando ranking e histórico do participante...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Pathfinder selection & projection banner */}
          <div>
            <label htmlFor="select-pathfinder" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Desbravador(a) *
            </label>
            <select
              id="select-pathfinder"
              value={selectedPfId}
              onChange={(e) => setSelectedPfId(e.target.value)}
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none transition-colors"
              required
            >
              <option value="" disabled>
                Selecione o participante...
              </option>
              {pathfinders.map((pf) => (
                <option key={pf.id} value={pf.id}>
                  {pf.fullName} — Unidade: {pf.unit} ({pf.totalPoints} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Pathfinder summary preview card */}
          {currentPf && (
            <div className="flex items-center justify-between rounded-xl border border-[#092642] bg-[#092642]/30 p-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={currentPf.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                  alt={currentPf.fullName}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full border border-[#FFC21A]/30 object-cover"
                />
                <div>
                  <div className="font-semibold text-white">{currentPf.fullName}</div>
                  <div className="text-[11px] text-[#8FA6C2]">
                    Unidade {currentPf.unit} · Classe {currentPf.currentClass}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-[#8FA6C2]">Impacto no Total:</div>
                <div className="flex items-center gap-1.5 font-mono tabular-nums text-sm font-bold text-[#FFC21A]">
                  <span>{currentPf.totalPoints} pts</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="text-emerald-400">+{points || 0}</span>
                  <span className="text-white">= {projectedPoints} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Categoria da Atividade *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleCategorySelect(cat.label)}
                    className={`rounded-lg p-2 text-left text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#FFC21A] bg-[#FFC21A]/15 text-white font-semibold shadow-xs'
                        : 'border-[#092642] bg-[#092642]/30 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="truncate">{cat.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity name and points amount */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="activity-name" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Requisito ou Atividade Realizada *
              </label>
              <input
                id="activity-name"
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Ex.: Campanha de arrecadação de alimentos, Especialidade..."
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="points-amount" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Pontos Concedidos *
              </label>
              <input
                id="points-amount"
                type="number"
                min="1"
                max="500"
                value={points}
                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 font-mono tabular-nums text-xs text-[#FFC21A] font-bold focus:border-[#FFC21A] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Detailed Justification (Mandatory by prompt) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="justification-text" className="block text-xs font-semibold text-slate-200">
                Motivo da Pontuação (Justificativa Detalhada) *
              </label>
              <span className="text-[11px] text-[#8FA6C2]">
                Mínimo 8 caracteres · Explicar mérito alcançado
              </span>
            </div>
            <textarea
              id="justification-text"
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva detalhadamente o motivo da concessão dos pontos, atitudes observadas, dedicação e liderança demonstrada pelo participante..."
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 p-3 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Date & Reviewer info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="activity-date" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Data da Realização *
              </label>
              <div className="relative">
                <input
                  id="activity-date"
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Responsável pela Aprovação
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[#092642] bg-[#092642]/30 px-3.5 py-2.5 text-xs text-slate-300">
                <UserCheck className="h-4 w-4 text-[#FFC21A]" />
                <span className="truncate">{currentUser.fullName} ({currentUser.role})</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#092642]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#092642] px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-5 py-2.5 text-xs font-bold text-[#031426] shadow-md shadow-[#FFC21A]/20 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Gravando e Validando...' : 'Confirmar e Aprovar Pontos'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
