/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Trophy,
  Award,
  Calendar,
  Shield,
  Printer,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Pathfinder, PointRecord } from '../types/index.ts';
import { ASSETS } from '../assets/assets.ts';
import { ProfilePhotoMenu } from './ProfilePhotoMenu.tsx';

interface PathfinderProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathfinder: Pathfinder | null;
  records: PointRecord[];
  rankPosition?: number;
  onOpenScoringForMember: (pfId: string) => void;
  onUpdatePhoto?: (newPhoto: string) => void;
}

export const PathfinderProfileDrawer: React.FC<PathfinderProfileDrawerProps> = ({
  isOpen,
  onClose,
  pathfinder,
  records,
  rankPosition,
  onOpenScoringForMember,
  onUpdatePhoto,
}) => {
  if (!isOpen || !pathfinder) return null;

  const memberRecords = records
    .filter((r) => r.pathfinderId === pathfinder.id)
    .sort(
      (a, b) =>
        new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
    );

  const activeRecords = memberRecords.filter((r) => !r.isReversed);
  const totalApprovedPoints = activeRecords.reduce((sum, r) => sum + r.points, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pf-drawer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-2xl text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#092642] pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFC21A]">
            <Shield className="h-4 w-4" />
            <span>Ficha Individual do Desbravador</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-[#092642] bg-[#092642]/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#FFC21A]" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Member Hero Card */}
        <div className="mt-5 rounded-2xl border border-[#092642] bg-gradient-to-r from-[#092642]/80 via-[#031426] to-[#092642]/50 p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative">
              <ProfilePhotoMenu
                photoUrl={pathfinder.photoUrl}
                defaultPhotoUrl={ASSETS.avatarBoy}
                userName={pathfinder.fullName}
                subtitle={`${pathfinder.unit} · ${pathfinder.currentClass}`}
                size="xl"
                shape="rounded"
                canEdit={!!onUpdatePhoto}
                onUpdatePhoto={(newPhoto) => {
                  if (onUpdatePhoto) onUpdatePhoto(newPhoto);
                }}
                onRemovePhoto={() => {
                  if (onUpdatePhoto) onUpdatePhoto(ASSETS.avatarBoy);
                }}
              />
              {rankPosition && rankPosition <= 3 && (
                <div
                  className={`absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs shadow-md ${
                    rankPosition === 1
                      ? 'bg-[#FFC21A] text-[#031426]'
                      : rankPosition === 2
                      ? 'bg-slate-300 text-slate-900'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  #{rankPosition}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 id="pf-drawer-title" className="text-xl font-bold text-white">
                  {pathfinder.fullName}
                </h2>
                <span className="rounded-md bg-[#FFC21A]/15 border border-[#FFC21A]/30 px-2 py-0.5 text-[11px] font-semibold text-[#FFC21A]">
                  Unidade {pathfinder.unit}
                </span>
              </div>

              <div className="text-xs text-[#8FA6C2] flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span>Classe: <strong className="text-white">{pathfinder.currentClass}</strong></span>
                <span>·</span>
                <span>Matrícula: {pathfinder.registrationDate}</span>
                <span>·</span>
                <span className="capitalize text-emerald-400 font-medium">{pathfinder.status}</span>
              </div>

              {/* Progress bar towards excellence badge */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8FA6C2]">Progresso para Distintivo de Excelência</span>
                  <span className="font-mono font-bold text-[#FFC21A]">
                    {pathfinder.totalPoints} / 1000 pts ({pathfinder.progressPercent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#031426] border border-[#092642] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFC21A] to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pathfinder.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScoringForMember(pathfinder.id);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#FFC21A] px-3.5 py-2 text-xs font-bold text-[#031426] shadow-md shadow-[#FFC21A]/20 transition-all hover:bg-[#FFD147] active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Lançar Pontos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Individual Points Timeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FFC21A]" />
              <span>Histórico Cronológico de Méritos ({memberRecords.length})</span>
            </h3>
            <span className="text-xs text-[#8FA6C2]">
              Total Aprovado: <strong className="font-mono text-[#FFC21A]">{totalApprovedPoints} pts</strong>
            </span>
          </div>

          {memberRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#092642] p-8 text-center text-xs text-[#8FA6C2]">
              Nenhum lançamento de pontuação registrado para este desbravador ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {memberRecords.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-xl border p-3.5 transition-all text-xs ${
                    r.isReversed
                      ? 'border-red-900/40 bg-red-950/20 opacity-70'
                      : 'border-[#092642] bg-[#092642]/30 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{r.activityName}</span>
                        <span className="rounded bg-[#031426] border border-[#092642] px-2 py-0.5 text-[10px] text-[#8FA6C2]">
                          {r.category}
                        </span>
                        {r.isReversed && (
                          <span className="rounded bg-red-900/50 border border-red-700 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                            Estornado
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed italic">
                        "{r.justification}"
                      </p>
                      <div className="text-[11px] text-[#8FA6C2] pt-1">
                        Realizado em {r.activityDate} · Aprovado por {r.approvedBy}
                      </div>

                      {r.isReversed && r.reversalReason && (
                        <div className="mt-2 rounded bg-red-950/50 p-2 text-[11px] text-red-300 border border-red-800/40">
                          <strong>Motivo do estorno:</strong> {r.reversalReason}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono tabular-nums text-base font-bold ${
                          r.isReversed ? 'text-red-400 line-through' : 'text-[#FFC21A]'
                        }`}
                      >
                        {r.isReversed ? `-${r.points}` : `+${r.points}`} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
