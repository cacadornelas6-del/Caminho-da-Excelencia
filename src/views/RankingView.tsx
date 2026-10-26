/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Download,
  Filter,
  Shield,
  Info,
  Medal,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RankedPathfinder, UnitStat, Pathfinder } from '../types/index.ts';
import { generateRankingCSV } from '../utils/scoring.ts';
import { ASSETS } from '../assets/assets.ts';

interface RankingViewProps {
  ranking: RankedPathfinder[];
  unitStats: UnitStat[];
  clubUnits: string[];
  onSelectPathfinder: (pf: Pathfinder) => void;
}

export const RankingView: React.FC<RankingViewProps> = ({
  ranking,
  unitStats,
  clubUnits,
  onSelectPathfinder,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('todas');
  const [activeTab, setActiveTab] = useState<'individual' | 'unidades'>('individual');

  const filteredRanking = ranking.filter((pf) => {
    if (selectedUnit !== 'todas' && pf.unit !== selectedUnit) return false;
    return true;
  });

  const top1 = ranking[0];
  const top2 = ranking[1];
  const top3 = ranking[2];

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFC21A', '#0284C7', '#F3F7FF', '#E2E8F0'],
    });
  };

  const handleExportCSV = () => {
    const csv = generateRankingCSV(filteredRanking);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `desbravapro_ranking_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Confetti Trigger & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Ranking Oficial de Excelência
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Liderança e reconhecimento por pontuação acumulada e mérito
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCelebrate}
            className="flex items-center gap-1.5 rounded-xl border border-[#FFC21A]/40 bg-[#FFC21A]/10 px-3.5 py-2 text-xs font-bold text-[#FFC21A] hover:bg-[#FFC21A]/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Comemorar</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#092642] bg-[#092642]/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#092642] hover:text-white transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#FFC21A]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Visual Podium for Top 3 with Gold Trophy */}
      {ranking.length >= 3 && selectedUnit === 'todas' && (
        <div className="rounded-2xl border border-[#092642] bg-gradient-to-b from-[#092642]/80 via-[#031426] to-[#031426] p-6 shadow-xl relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFC21A]/10 border border-[#FFC21A]/30 px-3 py-1 text-xs font-bold text-[#FFC21A]">
              <Medal className="h-3.5 w-3.5" />
              <span>Podium dos Campeões de Excelência</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto pt-4">
            {/* 2nd Place: Silver */}
            {top2 && (
              <div
                onClick={() => onSelectPathfinder(top2)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <img
                    src={top2.photoUrl || '/src/assets/images/avatar_pathfinder_girl_1793039963028.jpg'}
                    alt={top2.fullName}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2 border-slate-300 object-cover shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 font-mono text-xs font-bold text-slate-900 shadow">
                    2º
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white truncate max-w-[100px] md:max-w-[140px]">
                    {top2.fullName}
                  </div>
                  <div className="text-[10px] text-[#8FA6C2]">
                    Unidade {top2.unit}
                  </div>
                  <div className="mt-1 font-mono text-xs font-bold text-slate-300">
                    {top2.totalPoints} pts
                  </div>
                </div>
                <div className="mt-3 w-full h-24 rounded-t-xl bg-slate-700/40 border-t border-slate-400 flex items-center justify-center font-bold text-slate-400 text-sm">
                  Prata
                </div>
              </div>
            )}

            {/* 1st Place: Gold with Golden Trophy Asset */}
            {top1 && (
              <div
                onClick={() => onSelectPathfinder(top1)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <img
                      src={ASSETS.trophyGold}
                      alt="Troféu Dourado"
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full border border-[#FFC21A] object-cover shadow-lg drop-shadow-[0_4px_10px_rgba(255,194,26,0.5)]"
                    />
                  </div>
                  <img
                    src={top1.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                    alt={top1.fullName}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-2 border-[#FFC21A] object-cover shadow-xl group-hover:scale-105 transition-transform drop-shadow-[0_8px_16px_rgba(255,194,26,0.3)]"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC21A] font-mono text-xs font-extrabold text-[#031426] shadow-lg">
                    1º
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-extrabold text-white truncate max-w-[120px] md:max-w-[160px]">
                    {top1.fullName}
                  </div>
                  <div className="text-[10px] text-[#FFC21A]">
                    Unidade {top1.unit}
                  </div>
                  <div className="mt-1 font-mono text-sm font-extrabold text-[#FFC21A]">
                    {top1.totalPoints} pts
                  </div>
                </div>
                <div className="mt-3 w-full h-32 rounded-t-xl bg-gradient-to-t from-[#FFC21A]/20 to-[#FFC21A]/40 border-t-2 border-[#FFC21A] flex items-center justify-center font-extrabold text-[#FFC21A] text-base">
                  Ouro
                </div>
              </div>
            )}

            {/* 3rd Place: Bronze */}
            {top3 && (
              <div
                onClick={() => onSelectPathfinder(top3)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <img
                    src={top3.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                    alt={top3.fullName}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2 border-amber-700 object-cover shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 font-mono text-xs font-bold text-white shadow">
                    3º
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white truncate max-w-[100px] md:max-w-[140px]">
                    {top3.fullName}
                  </div>
                  <div className="text-[10px] text-[#8FA6C2]">
                    Unidade {top3.unit}
                  </div>
                  <div className="mt-1 font-mono text-xs font-bold text-amber-500">
                    {top3.totalPoints} pts
                  </div>
                </div>
                <div className="mt-3 w-full h-18 rounded-t-xl bg-amber-950/40 border-t border-amber-700 flex items-center justify-center font-bold text-amber-600 text-sm">
                  Bronze
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documented Tie-Breaker Rule Callout Banner (Prompt requirement: "Em caso de empate, aplique uma regra consistente e documentada") */}
      <div className="rounded-xl border border-[#092642] bg-[#092642]/30 p-3.5 text-xs text-[#8FA6C2] flex items-start gap-2.5">
        <Info className="h-4 w-4 text-[#FFC21A] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Critérios Oficiais de Desempate:</strong> Caso dois ou mais participantes empatem na pontuação total acumulada, o sistema aplica automaticamente a seguinte ordem de prioridade:
          <span className="text-slate-300"> 1º Maior pontuação em Classes e Especialidades</span> →
          <span className="text-slate-300"> 2º Antiguidade na data de matrícula do clube</span> →
          <span className="text-slate-300"> 3º Ordem alfabética pelo nome completo</span>.
        </div>
      </div>

      {/* View Switcher: Individual vs Unidades & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#092642] pb-3">
        <div className="flex items-center gap-1 p-1 bg-[#092642]/50 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-[#FFC21A] text-[#031426] font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Individual ({filteredRanking.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unidades')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'unidades'
                ? 'bg-[#FFC21A] text-[#031426] font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Por Unidades ({unitStats.length})
          </button>
        </div>

        {activeTab === 'individual' && (
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="rounded-lg border border-[#092642] bg-[#092642]/60 px-3 py-1.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
            >
              <option value="todas">Todas as Unidades</option>
              {clubUnits.map((u) => (
                <option key={u} value={u}>
                  Unidade {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Individual Leaderboard Table */}
      {activeTab === 'individual' && (
        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#092642] bg-[#092642]/40 text-[#8FA6C2]">
                <tr>
                  <th className="py-3 px-4 w-16">Posição</th>
                  <th className="py-3 px-4">Desbravador</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Classe Atual</th>
                  <th className="py-3 px-4">Progresso (%)</th>
                  <th className="py-3 px-4 text-right">Pontos Totais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#092642]/50">
                {filteredRanking.map((pf) => {
                  const isTop3 = pf.rankPosition <= 3;
                  const posBg =
                    pf.rankPosition === 1
                      ? 'bg-[#FFC21A] text-[#031426]'
                      : pf.rankPosition === 2
                      ? 'bg-slate-300 text-slate-900'
                      : pf.rankPosition === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-[#092642] text-slate-300';

                  return (
                    <tr
                      key={pf.id}
                      onClick={() => onSelectPathfinder(pf)}
                      className="hover:bg-[#092642]/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono font-bold text-xs ${posBg}`}
                        >
                          {pf.rankPosition}º
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pf.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                            alt={pf.fullName}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-full border border-[#092642] object-cover"
                          />
                          <div>
                            <div className="font-semibold text-white">
                              {pf.fullName}
                            </div>
                            <div className="text-[11px] text-[#8FA6C2]">
                              Matrícula: {pf.registrationDate}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        Unidade {pf.unit}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="rounded bg-[#092642] px-2 py-0.5 text-[11px] font-medium text-slate-200">
                          {pf.currentClass}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] text-[#8FA6C2] mb-1">
                            <span>{pf.progressPercent}%</span>
                            <span>1000 pts</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#092642] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FFC21A] to-amber-500 rounded-full"
                              style={{ width: `${pf.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono tabular-nums text-sm font-bold text-[#FFC21A]">
                          {pf.totalPoints} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Unit Leaderboard */}
      {activeTab === 'unidades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unitStats.map((u, index) => (
            <div
              key={u.unitName}
              className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      index === 0
                        ? 'bg-[#FFC21A] text-[#031426]'
                        : 'bg-[#092642] text-slate-300'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Unidade {u.unitName}</h3>
                    <div className="text-[11px] text-[#8FA6C2]">
                      {u.memberCount} desbravadores cadastrados
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono tabular-nums text-base font-bold text-[#FFC21A]">
                    {u.totalPoints} pts
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Média: {u.averagePoints} pts/membro
                  </div>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-[#092642] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0284C7] to-[#FFC21A] rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((u.totalPoints / (unitStats[0]?.totalPoints || 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
