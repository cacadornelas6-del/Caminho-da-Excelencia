/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { PointRecord, PointCategory, AuditLog } from '../types/index.ts';
import { filterPointsRecords, generatePointsHistoryCSV } from '../utils/scoring.ts';

interface HistoryViewProps {
  records: PointRecord[];
  auditLogs: AuditLog[];
  onOpenReversal: (record: PointRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  auditLogs,
  onOpenReversal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<PointCategory | 'todas'>('todas');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pontos' | 'auditoria'>('pontos');
  const [showReversed, setShowReversed] = useState<boolean>(true);

  const filtered = filterPointsRecords(records, {
    searchTerm,
    category: categoryFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    includeReversed: showReversed,
  });

  const handleExportCSV = () => {
    const csv = generatePointsHistoryCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `desbravapro_historico_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Histórico de Pontuações & Auditoria
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Registro contínuo e imutável de todas as aprovações e estornos oficiais
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-xl border border-[#092642] bg-[#092642]/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#092642] hover:text-white transition-all cursor-pointer"
        >
          <Download className="h-4 w-4 text-[#FFC21A]" />
          <span>Exportar Histórico (CSV)</span>
        </button>
      </div>

      {/* Tabs: Pontos vs Auditoria */}
      <div className="flex items-center gap-2 border-b border-[#092642] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('pontos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'pontos'
              ? 'bg-[#FFC21A] text-[#031426]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Lançamentos de Pontuação ({filtered.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'auditoria'
              ? 'bg-[#FFC21A] text-[#031426]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Registro de Auditoria ({auditLogs.length})
        </button>
      </div>

      {activeTab === 'pontos' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl border border-[#092642] bg-[#031426]/80 p-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por participante, atividade ou justificativa..."
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/40 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FFC21A] focus:outline-none"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/60 px-3 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              >
                <option value="todas">Todas as Categorias</option>
                <option value="Classes">Classes</option>
                <option value="Especialidades">Especialidades</option>
                <option value="Atividades">Atividades</option>
                <option value="Serviço comunitário">Serviço comunitário</option>
                <option value="Disciplina">Disciplina</option>
                <option value="Liderança">Liderança</option>
                <option value="Participação">Participação</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-[#8FA6C2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReversed}
                  onChange={(e) => setShowReversed(e.target.checked)}
                  className="rounded border-[#092642] text-[#FFC21A] focus:ring-0"
                />
                <span>Exibir Estornados</span>
              </label>
            </div>
          </div>

          {/* Records Table */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#092642] p-12 text-center text-xs text-[#8FA6C2]">
              Nenhum lançamento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-4.5 transition-all text-xs ${
                    r.isReversed
                      ? 'border-red-900/50 bg-red-950/20'
                      : 'border-[#092642] bg-[#031426]/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {r.pathfinderName}
                        </span>
                        <span className="rounded bg-[#092642] px-2 py-0.5 text-[10px] text-slate-300">
                          Unidade {r.unit}
                        </span>
                        <span className="rounded bg-[#092642]/60 border border-[#092642] px-2 py-0.5 text-[10px] text-[#FFC21A] font-semibold">
                          {r.category}
                        </span>
                        {r.isReversed ? (
                          <span className="rounded-full bg-red-900/60 border border-red-700 px-2 py-0.5 text-[10px] font-bold text-red-300">
                            Estornado
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Homologado
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-slate-200">
                        {r.activityName}
                      </div>

                      <p className="text-slate-300 italic leading-relaxed bg-[#092642]/20 p-2.5 rounded-xl border border-[#092642]/40">
                        "{r.justification}"
                      </p>

                      <div className="text-[11px] text-[#8FA6C2] flex flex-wrap items-center gap-2">
                        <span>Data do Mérito: {r.activityDate}</span>
                        <span>·</span>
                        <span>Aprovado por: <strong>{r.approvedBy}</strong></span>
                        <span>·</span>
                        <span>Registrado em: {new Date(r.createdAt).toLocaleString('pt-BR')}</span>
                      </div>

                      {/* Reversal Audit trail notes */}
                      {r.isReversed && (
                        <div className="mt-2 rounded-xl bg-red-950/60 p-3 text-[11px] text-red-200 border border-red-800/60">
                          <div className="font-bold text-red-300">
                            Estorno realizado por {r.reversedBy || 'Direção'} em {r.reversedAt ? new Date(r.reversedAt).toLocaleString('pt-BR') : 'Data não registrada'}:
                          </div>
                          <div className="mt-0.5 italic">
                            Motivo obrigatório: "{r.reversalReason}"
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Points & Action Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#092642]">
                      <div
                        className={`font-mono tabular-nums text-lg font-black ${
                          r.isReversed ? 'text-red-400 line-through' : 'text-[#FFC21A]'
                        }`}
                      >
                        {r.isReversed ? `-${r.points}` : `+${r.points}`} pts
                      </div>

                      {!r.isReversed && (
                        <button
                          type="button"
                          onClick={() => onOpenReversal(r)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                          <span>Estornar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: System Audit Trail */}
      {activeTab === 'auditoria' && (
        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#092642] bg-[#092642]/40 text-[#8FA6C2]">
                <tr>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Detalhes da Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#092642]/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#092642]/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-[#092642] px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFC21A]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
