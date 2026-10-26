/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  PlusCircle,
  Shield,
  Award,
} from 'lucide-react';
import { Pathfinder, PathfinderStatus } from '../types/index.ts';

interface PathfindersViewProps {
  pathfinders: Pathfinder[];
  clubUnits: string[];
  onOpenNew: () => void;
  onEdit: (pf: Pathfinder) => void;
  onDelete: (id: string, name: string) => void;
  onSelect: (pf: Pathfinder) => void;
  onOpenScoringForMember: (pfId: string) => void;
}

export const PathfindersView: React.FC<PathfindersViewProps> = ({
  pathfinders,
  clubUnits,
  onOpenNew,
  onEdit,
  onDelete,
  onSelect,
  onOpenScoringForMember,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  const filtered = pathfinders.filter((pf) => {
    if (selectedUnit !== 'todas' && pf.unit !== selectedUnit) return false;
    if (selectedStatus !== 'todos' && pf.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchName = pf.fullName.toLowerCase().includes(term);
      const matchClass = pf.currentClass.toLowerCase().includes(term);
      if (!matchName && !matchClass) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Desbravadores do Clube
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Cadastro oficial, controle de unidades e progresso individual
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#031426] shadow-lg shadow-[#FFC21A]/20 transition-all hover:brightness-110 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4 stroke-[2.5]" />
          <span>Novo Desbravador</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-[#092642] bg-[#031426]/80 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou classe regular..."
            className="w-full rounded-xl border border-[#092642] bg-[#092642]/40 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FFC21A] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="rounded-xl border border-[#092642] bg-[#092642]/60 px-3 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
            >
              <option value="todas">Todas as Unidades</option>
              {clubUnits.map((u) => (
                <option key={u} value={u}>
                  Unidade {u}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-[#092642] bg-[#092642]/60 px-3 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="destaque">Destaques</option>
            <option value="observacao">Em Observação</option>
            <option value="graduado">Graduados</option>
          </select>
        </div>
      </div>

      {/* Participants Cards Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#092642] p-12 text-center text-xs text-[#8FA6C2]">
          Nenhum desbravador encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pf) => (
            <div
              key={pf.id}
              className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-5 shadow-sm hover:border-[#FFC21A]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={pf.photoUrl || '/src/assets/images/avatar_pathfinder_boy_1793039962110.jpg'}
                      alt={pf.fullName}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-2xl border border-[#092642] object-cover shadow"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">
                        {pf.fullName}
                      </h3>
                      <div className="text-[11px] text-[#8FA6C2] mt-0.5">
                        Unidade {pf.unit}
                      </div>
                      <span className="inline-block mt-1 rounded bg-[#092642] px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        {pf.currentClass}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                      pf.status === 'destaque'
                        ? 'bg-[#FFC21A]/20 text-[#FFC21A] border border-[#FFC21A]/40'
                        : pf.status === 'ativo'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {pf.status}
                  </span>
                </div>

                {/* Score & Progress */}
                <div className="mt-4 pt-3 border-t border-[#092642]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#8FA6C2]">Pontuação Acumulada:</span>
                    <span className="font-mono font-bold text-[#FFC21A] text-sm">
                      {pf.totalPoints} pts
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#092642] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FFC21A] to-amber-500 rounded-full"
                      style={{ width: `${pf.progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 text-right">
                    {pf.progressPercent}% de 1000 pts
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#092642] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(pf)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#FFC21A] hover:underline cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver Ficha</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenScoringForMember(pf.id)}
                    title="Lançar pontos para este participante"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-[#092642] hover:text-[#FFC21A] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(pf)}
                    title="Editar informações"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(pf.id, pf.fullName)}
                    title="Remover participante"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
