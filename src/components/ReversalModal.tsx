/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { PointRecord } from '../types/index.ts';

interface ReversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PointRecord | null;
  onConfirm: (reason: string) => Promise<void>;
}

export const ReversalModal: React.FC<ReversalModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim() || reason.trim().length < 8) {
      setError('A justificativa do estorno é obrigatória (mínimo 8 caracteres).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(reason.trim());
      setReason('');
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Erro ao processar estorno.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reversal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg rounded-2xl border border-red-900/60 bg-[#031426] p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-[#092642] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 text-red-400 border border-red-800/60">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="reversal-modal-title" className="text-base font-bold text-white">
                Estornar Lançamento de Pontuação
              </h2>
              <p className="text-xs text-[#8FA6C2]">
                Auditoria permanente de estorno com justificativa obrigatória
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
          <div className="mt-4 rounded-lg bg-red-950/70 border border-red-800 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target record summary */}
          <div className="rounded-xl border border-[#092642] bg-[#092642]/40 p-3.5 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Participante:</span>
              <span className="font-semibold text-white">{record.pathfinderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pontos a deduzir:</span>
              <span className="font-mono font-bold text-red-400">-{record.points} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Atividade original:</span>
              <span className="text-slate-200 truncate max-w-[240px]">{record.activityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Aprovado originalmente por:</span>
              <span className="text-slate-300">{record.approvedBy}</span>
            </div>
          </div>

          <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              O estorno <strong>não apaga</strong> o registro histórico. Ele marcará o lançamento como estornado, atualizará a pontuação do participante e registrará este evento na auditoria do clube.
            </span>
          </div>

          <div>
            <label htmlFor="reversal-reason" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Justificativa Obrigatória do Estorno *
            </label>
            <textarea
              id="reversal-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique o motivo do estorno (ex.: Lançamento duplicado por engano, erro na contagem de presença, requisito não homologado pela comissão)..."
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 p-3 text-xs text-white placeholder-slate-500 focus:border-red-400 focus:outline-none transition-colors"
              required
            />
          </div>

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
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-950 transition-all hover:bg-red-500 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Processando estorno...' : 'Confirmar Estorno Oficial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
