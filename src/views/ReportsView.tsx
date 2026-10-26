/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Shield,
  Award,
  Users,
  CheckCircle,
} from 'lucide-react';
import {
  Club,
  Pathfinder,
  PointRecord,
  RankedPathfinder,
  UnitStat,
} from '../types/index.ts';
import {
  generateRankingCSV,
  generatePointsHistoryCSV,
} from '../utils/scoring.ts';

interface ReportsViewProps {
  club: Club | null;
  pathfinders: Pathfinder[];
  records: PointRecord[];
  ranking: RankedPathfinder[];
  unitStats: UnitStat[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  club,
  pathfinders,
  records,
  ranking,
  unitStats,
}) => {
  const [printType, setPrintType] = useState<'ranking' | 'boletim' | 'unidades'>('ranking');

  const nowFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const exportRankingCSV = () => {
    const csv = generateRankingCSV(ranking);
    downloadFile(csv, `ranking_desbravadores_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportHistoryCSV = () => {
    const csv = generatePointsHistoryCSV(records);
    downloadFile(csv, `historico_pontuacoes_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportPathfindersCSV = () => {
    const headers = ['ID', 'Nome', 'Unidade', 'Classe', 'Data Cadastro', 'Pontos', 'Progresso', 'Status'];
    const rows = pathfinders.map((p) => [
      p.id,
      `"${p.fullName}"`,
      `"${p.unit}"`,
      `"${p.currentClass}"`,
      p.registrationDate,
      p.totalPoints,
      `${p.progressPercent}%`,
      p.status,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    downloadFile(csv, `participantes_clube_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-xl no-print">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Relatórios Oficiais & Exportação
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Geração de relatórios com validade oficial para comissões e reuniões de pais
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-4 py-2.5 text-xs font-bold text-[#031426] shadow-md shadow-[#FFC21A]/20 transition-all hover:brightness-105 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir / Salvar em PDF</span>
        </button>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">Ranking Oficial Completo</h3>
            <Award className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <p className="text-[11px] text-[#8FA6C2] leading-relaxed">
            Exporta tabela com colocação de todos os {ranking.length} desbravadores, pontos por categoria e desempates.
          </p>
          <button
            type="button"
            onClick={exportRankingCSV}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#092642] bg-[#092642]/60 py-2 text-xs font-semibold text-slate-200 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#FFC21A]" />
            <span>Baixar Ranking (.CSV)</span>
          </button>
        </div>

        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">Histórico Completo de Pontos</h3>
            <FileSpreadsheet className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <p className="text-[11px] text-[#8FA6C2] leading-relaxed">
            Livro de registros detalhado com justificativas, datas, aprovadores e histórico de estornos.
          </p>
          <button
            type="button"
            onClick={exportHistoryCSV}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#092642] bg-[#092642]/60 py-2 text-xs font-semibold text-slate-200 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#FFC21A]" />
            <span>Baixar Livro de Pontos (.CSV)</span>
          </button>
        </div>

        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">Ficha Geral de Participantes</h3>
            <Users className="h-4 w-4 text-[#FFC21A]" />
          </div>
          <p className="text-[11px] text-[#8FA6C2] leading-relaxed">
            Lista com os {pathfinders.length} desbravadores, unidades correspondentes, classes atuais e datas.
          </p>
          <button
            type="button"
            onClick={exportPathfindersCSV}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#092642] bg-[#092642]/60 py-2 text-xs font-semibold text-slate-200 hover:bg-[#092642] hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#FFC21A]" />
            <span>Baixar Relação de Membros (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Preview Container */}
      <div className="rounded-2xl border border-[#092642] bg-white text-slate-900 p-8 shadow-2xl">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={club?.logoUrl || '/src/assets/images/desbravapro_crest_shield_1793039959775.jpg'}
              alt="Brasão"
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-xl border border-slate-400 object-cover"
            />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Igreja Adventista do Sétimo Dia · {club?.region || '5ª Região'}
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {club?.name || 'Clube de Desbravadores'}
              </h2>
              <div className="text-xs text-slate-600 italic">
                "{club?.motto || 'Pela graça de Deus, serei puro, bondoso e leal!'}"
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900">BOLETIM OFICIAL DE EXCELÊNCIA</div>
            <div>Emitido em: {nowFormatted}</div>
            <div>Distrito: {club?.district || 'Central'}</div>
          </div>
        </div>

        {/* Printable Summary KPI bar */}
        <div className="grid grid-cols-4 gap-4 my-6 p-4 bg-slate-100 rounded-xl text-center text-xs">
          <div>
            <div className="text-slate-500">Membros Ativos</div>
            <div className="font-bold text-slate-900 text-base">{pathfinders.length}</div>
          </div>
          <div>
            <div className="text-slate-500">Total de Pontos</div>
            <div className="font-bold text-slate-900 text-base">
              {records.filter((r) => !r.isReversed).reduce((sum, r) => sum + r.points, 0)}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Unidades</div>
            <div className="font-bold text-slate-900 text-base">{unitStats.length}</div>
          </div>
          <div>
            <div className="text-slate-500">Meta Anual</div>
            <div className="font-bold text-slate-900 text-base">
              {club?.settings.targetExcellencePoints || 1000} pts
            </div>
          </div>
        </div>

        {/* Printable Ranking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2.5 px-3 w-14">Pos.</th>
                <th className="py-2.5 px-3">Nome Completo</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3">Classe</th>
                <th className="py-2.5 px-3">Data Matrícula</th>
                <th className="py-2.5 px-3 text-right">Progresso</th>
                <th className="py-2.5 px-3 text-right">Pontuação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ranking.map((pf) => (
                <tr key={pf.id} className="text-slate-800">
                  <td className="py-2 px-3 font-bold font-mono">
                    {pf.rankPosition}º
                  </td>
                  <td className="py-2 px-3 font-semibold">
                    {pf.fullName}
                  </td>
                  <td className="py-2 px-3">
                    Unidade {pf.unit}
                  </td>
                  <td className="py-2 px-3">
                    {pf.currentClass}
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-mono">
                    {pf.registrationDate}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {pf.progressPercent}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    {pf.totalPoints} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures Footer */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div>
            <div className="h-10 border-b border-slate-400 mx-auto max-w-[240px]" />
            <div className="mt-2 font-semibold text-slate-800">Diretor(a) do Clube</div>
            <div>{club?.name}</div>
          </div>

          <div>
            <div className="h-10 border-b border-slate-400 mx-auto max-w-[240px]" />
            <div className="mt-2 font-semibold text-slate-800">Secretário(a) do Clube</div>
            <div>Assinatura e Carimbo Oficial</div>
          </div>
        </div>
      </div>
    </div>
  );
};
