/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Shield,
  Trophy,
  PlusCircle,
  FileText,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Club,
  Pathfinder,
  PointRecord,
  RankedPathfinder,
  UnitStat,
} from '../types/index.ts';

interface DashboardViewProps {
  club: Club | null;
  pathfinders: Pathfinder[];
  pointRecords: PointRecord[];
  ranking: RankedPathfinder[];
  unitStats: UnitStat[];
  onOpenScoring: () => void;
  onOpenNewPathfinder: () => void;
  onNavigateToTab: (tab: any) => void;
  onSelectPathfinder: (pf: Pathfinder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  club,
  pathfinders,
  pointRecords,
  ranking,
  unitStats,
  onOpenScoring,
  onOpenNewPathfinder,
  onNavigateToTab,
  onSelectPathfinder,
}) => {
  const totalApprovedPoints = pointRecords
    .filter((r) => !r.isReversed)
    .reduce((sum, r) => sum + r.points, 0);

  const averageProgress =
    pathfinders.length > 0
      ? Math.round(
          pathfinders.reduce((sum, p) => sum + p.progressPercent, 0) /
            pathfinders.length
        )
      : 0;

  const leadingUnit = unitStats[0];

  // Desbravador em destaque: either explicitly marked or the #1 ranked
  const spotlightPathfinder =
    pathfinders.find((p) => p.status === 'destaque') || ranking[0] || null;

  const recentPoints = pointRecords.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Club Hero Banner with 3D Crest */}
      <div className="relative overflow-hidden rounded-2xl border border-[#092642] bg-gradient-to-r from-[#031426] via-[#092642] to-[#031426] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={club?.logoUrl || '/src/assets/images/desbravapro_crest_shield_1793039959775.jpg'}
              alt="Brasão DesbravaPro"
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-2xl border-2 border-[#FFC21A]/50 object-cover shadow-2xl drop-shadow-[0_10px_20px_rgba(255,194,26,0.2)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#FFC21A]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#FFC21A]">
                  {club?.region || '5ª Região'}
                </span>
                <span className="text-xs text-[#8FA6C2]">
                  {club?.church || 'Igreja Adventista do Sétimo Dia'}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
                {club?.name || 'Clube de Desbravadores'}
              </h1>
              <p className="mt-1 text-xs italic text-[#8FA6C2]">
                "{club?.motto || 'Pela graça de Deus, serei puro, bondoso e leal!'}"
              </p>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenScoring}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#031426] shadow-lg shadow-[#FFC21A]/20 transition-all hover:brightness-110 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Lançar Pontos</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewPathfinder}
              className="flex items-center gap-2 rounded-xl border border-[#092642] bg-[#092642]/80 px-4 py-2.5 text-xs font-semibold text-slate-100 transition-all hover:bg-[#092642] hover:text-white cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="h-4 w-4 text-[#FFC21A]" />
              <span>Novo Desbravador</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#092642] bg-[#031426]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Participantes Ativos</span>
            <Users className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2 font-mono tabular-nums text-2xl font-bold text-white">
            {pathfinders.length}
          </div>
          <div className="mt-1 text-[11px] text-[#8FA6C2]">
            Distribuídos em {unitStats.length} unidades
          </div>
        </div>

        <div className="rounded-2xl border border-[#092642] bg-[#031426]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pontos Homologados</span>
            <Award className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2 font-mono tabular-nums text-2xl font-bold text-[#FFC21A]">
            {totalApprovedPoints.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400">
            {pointRecords.filter((r) => !r.isReversed).length} lançamentos válidos
          </div>
        </div>

        <div className="rounded-2xl border border-[#092642] bg-[#031426]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Média de Progresso</span>
            <TrendingUp className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2 font-mono tabular-nums text-2xl font-bold text-white">
            {averageProgress}%
          </div>
          <div className="mt-1 text-[11px] text-[#8FA6C2]">
            Meta de {club?.settings.targetExcellencePoints || 1000} pts anuais
          </div>
        </div>

        <div className="rounded-2xl border border-[#092642] bg-[#031426]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Unidade Líder</span>
            <Shield className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2 truncate font-mono text-xl font-bold text-white">
            {leadingUnit ? leadingUnit.unitName : 'N/A'}
          </div>
          <div className="mt-1 text-[11px] text-[#FFC21A]">
            {leadingUnit ? `${leadingUnit.totalPoints} pts acumulados` : 'Sem dados'}
          </div>
        </div>
      </div>

      {/* Main Grid: Spotlight Pathfinder + Top 5 Ranking Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Desbravador em Destaque (Spotlight) Card */}
        {spotlightPathfinder && (
          <div className="lg:col-span-1 rounded-2xl border border-[#FFC21A]/40 bg-gradient-to-b from-[#092642] via-[#031426] to-[#031426] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FFC21A]/20 to-transparent p-6 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFC21A]">
                  <Sparkles className="h-4 w-4" />
                  <span>Desbravador em Destaque</span>
                </div>
                <span className="rounded-full bg-[#FFC21A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#FFC21A] border border-[#FFC21A]/40">
                  1º Lugar Geral
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={spotlightPathfinder.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                    alt={spotlightPathfinder.fullName}
                    referrerPolicy="no-referrer"
                    className="h-28 w-28 rounded-2xl border-2 border-[#FFC21A] object-cover shadow-2xl shadow-[#FFC21A]/20"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC21A] font-bold text-[#031426] shadow-lg">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-bold text-white">
                  {spotlightPathfinder.fullName}
                </h3>
                <div className="text-xs text-[#8FA6C2]">
                  Unidade {spotlightPathfinder.unit} · Classe {spotlightPathfinder.currentClass}
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#031426] border border-[#092642] px-3.5 py-1.5 font-mono text-sm font-bold text-[#FFC21A]">
                  <span>{spotlightPathfinder.totalPoints} pontos</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400">{spotlightPathfinder.progressPercent}% da meta</span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-300 italic">
                  "{spotlightPathfinder.spotlightReason ||
                    'Reconhecido pela liderança pela pontualidade impecável, dedicação ao estudo da Bíblia e espírito de cooperação na unidade.'}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPathfinder(spotlightPathfinder)}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-[#092642] bg-[#092642]/60 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver Perfil e Ficha Completa</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Top Ranking Preview */}
        <div className={`rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm ${spotlightPathfinder ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between border-b border-[#092642] pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-5 w-5 text-[#FFC21A]" />
              <h2 className="text-base font-bold text-white">
                Ranking de Excelência (Top 5)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('ranking')}
              className="flex items-center gap-1 text-xs font-semibold text-[#FFC21A] hover:underline cursor-pointer"
            >
              <span>Ver Ranking Completo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#092642]">
            {ranking.slice(0, 5).map((pf) => {
              const isTop3 = pf.rankPosition <= 3;
              const medalColor =
                pf.rankPosition === 1
                  ? 'bg-[#FFC21A] text-[#031426]'
                  : pf.rankPosition === 2
                  ? 'bg-slate-300 text-slate-900'
                  : pf.rankPosition === 3
                  ? 'bg-amber-700 text-white'
                  : 'bg-[#092642] text-slate-300';

              return (
                <div
                  key={pf.id}
                  onClick={() => onSelectPathfinder(pf)}
                  className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-[#092642]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold shrink-0 ${medalColor}`}
                    >
                      {pf.rankPosition}º
                    </div>
                    <img
                      src={pf.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                      alt={pf.fullName}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full border border-[#092642] object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {pf.fullName}
                      </div>
                      <div className="text-[11px] text-[#8FA6C2]">
                        Unidade {pf.unit} · Classe {pf.currentClass}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums text-sm font-bold text-[#FFC21A]">
                      {pf.totalPoints} pts
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {pf.progressPercent}% da meta
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Approved Points Section */}
      <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#092642] pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-[#FFC21A]" />
            <h2 className="text-base font-bold text-white">
              Últimas Pontuações Concedidas
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('history')}
            className="flex items-center gap-1 text-xs font-semibold text-[#FFC21A] hover:underline cursor-pointer"
          >
            <span>Ver Histórico & Auditoria</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {recentPoints.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8FA6C2]">
              Nenhum ponto registrado ainda. Clique em "Lançar Pontos" para registrar a primeira pontuação!
            </div>
          ) : (
            recentPoints.map((r) => (
              <div
                key={r.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3.5 text-xs transition-all ${
                  r.isReversed
                    ? 'border-red-900/40 bg-red-950/20 opacity-60'
                    : 'border-[#092642] bg-[#092642]/30 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{r.pathfinderName}</span>
                    <span className="rounded bg-[#031426] border border-[#092642] px-2 py-0.5 text-[10px] text-[#8FA6C2]">
                      {r.category}
                    </span>
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {r.activityName}
                    </span>
                    {r.isReversed && (
                      <span className="rounded bg-red-900/50 text-red-300 px-1.5 py-0.5 text-[10px] font-bold">
                        Estornado
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 italic line-clamp-1">
                    "{r.justification}"
                  </p>
                  <div className="text-[11px] text-[#8FA6C2]">
                    {r.activityDate} · Aprovado por {r.approvedBy}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono tabular-nums text-sm font-bold ${
                      r.isReversed ? 'text-red-400 line-through' : 'text-[#FFC21A]'
                    }`}
                  >
                    {r.isReversed ? `-${r.points}` : `+${r.points}`} pts
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
