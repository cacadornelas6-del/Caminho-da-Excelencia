/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Users,
  Database,
  Sliders,
  CheckCircle,
  Copy,
  ExternalLink,
  Plus,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Club, UserProfile, UserRole, PointCategory } from '../types/index.ts';
import { isSupabaseConfigured } from '../services/supabaseClient.ts';

interface SettingsViewProps {
  club: Club;
  currentUser: UserProfile;
  leadership: UserProfile[];
  onUpdateClub: (updates: Partial<Club> & { settings?: Partial<Club['settings']> }) => Promise<void>;
  onAddLeadershipMember: (data: {
    fullName: string;
    email: string;
    role: UserRole;
    passwordPlain: string;
  }) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  club,
  currentUser,
  leadership,
  onUpdateClub,
  onAddLeadershipMember,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'lideranca' | 'pesos' | 'supabase'>('geral');

  // Club details state
  const [name, setName] = useState<string>(club.name);
  const [region, setRegion] = useState<string>(club.region);
  const [district, setDistrict] = useState<string>(club.district);
  const [church, setChurch] = useState<string>(club.church);
  const [motto, setMotto] = useState<string>(club.motto);
  const [targetPoints, setTargetPoints] = useState<number>(
    club.settings.targetExcellencePoints || 1000
  );
  const [unitsInput, setUnitsInput] = useState<string>(club.settings.unitsList.join(', '));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Add leadership member form
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('conselheiro');
  const [newMemberPass, setNewMemberPass] = useState<string>('desbrava123');
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setIsSaving(true);
      const unitsList = unitsInput
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      await onUpdateClub({
        name: name.trim(),
        region: region.trim(),
        district: district.trim(),
        church: church.trim(),
        motto: motto.trim(),
        settings: {
          ...club.settings,
          targetExcellencePoints: Number(targetPoints),
          unitsList: unitsList.length > 0 ? unitsList : club.settings.unitsList,
        },
      });

      setIsSaving(false);
      setSuccessMsg('Configurações do clube atualizadas com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Erro ao salvar configurações.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setIsAddingMember(true);
      await onAddLeadershipMember({
        fullName: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
        passwordPlain: newMemberPass,
      });
      setIsAddingMember(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setSuccessMsg('Membro da liderança adicionado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setIsAddingMember(false);
      setErrorMsg(err.message || 'Erro ao adicionar membro da liderança.');
    }
  };

  const copySqlToClipboard = () => {
    const sqlText = `-- Executar no SQL Editor do Supabase para criar as tabelas e políticas RLS de produção
-- Veja o arquivo completo em /supabase-schema.sql
-- Inclui tabelas: clubs, profiles, pathfinders, point_records, requirements, audit_logs e triggers`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Configurações & Administração
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Identidade do clube, controle de acesso da liderança e infraestrutura
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#092642]/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'geral' ? 'bg-[#FFC21A] text-[#031426]' : 'text-slate-300 hover:text-white'
            }`}
          >
            Dados do Clube
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lideranca')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'lideranca' ? 'bg-[#FFC21A] text-[#031426]' : 'text-slate-300 hover:text-white'
            }`}
          >
            Liderança ({leadership.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'supabase' ? 'bg-[#FFC21A] text-[#031426]' : 'text-slate-300 hover:text-white'
            }`}
          >
            Supabase & Vercel
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/70 border border-emerald-800 p-3.5 text-xs text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/70 border border-red-800 p-3.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Dados Gerais do Clube */}
      {activeTab === 'geral' && (
        <form onSubmit={handleSaveGeneral} className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-[#092642] pb-3">
            Informações do Clube de Desbravadores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="club-name" className="block text-xs font-semibold text-slate-200 mb-1">
                Nome do Clube *
              </label>
              <input
                id="club-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="club-motto" className="block text-xs font-semibold text-slate-200 mb-1">
                Lema Oficial do Clube
              </label>
              <input
                id="club-motto"
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="club-region" className="block text-xs font-semibold text-slate-200 mb-1">
                Região e Associação
              </label>
              <input
                id="club-region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="club-church" className="block text-xs font-semibold text-slate-200 mb-1">
                Igreja Local Vinculada
              </label>
              <input
                id="club-church"
                type="text"
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="club-target-points" className="block text-xs font-semibold text-slate-200 mb-1">
                Meta Anual para Distintivo de Excelência (Pontos)
              </label>
              <input
                id="club-target-points"
                type="number"
                min="100"
                max="10000"
                value={targetPoints}
                onChange={(e) => setTargetPoints(parseInt(e.target.value, 10) || 1000)}
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 font-mono tabular-nums text-xs text-[#FFC21A] font-bold focus:border-[#FFC21A] focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="club-units" className="block text-xs font-semibold text-slate-200 mb-1">
                Unidades do Clube (separadas por vírgula)
              </label>
              <input
                id="club-units"
                type="text"
                value={unitsInput}
                onChange={(e) => setUnitsInput(e.target.value)}
                placeholder="Ex.: Águia Real, Sentinelas, Guerreiros"
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#092642]">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-5 py-2.5 text-xs font-bold text-[#031426] shadow-md hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Salvando Alterações...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Liderança & Membros Autorizados */}
      {activeTab === 'lideranca' && (
        <div className="space-y-6">
          {/* Add member form */}
          <form onSubmit={handleAddMember} className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-[#092642] pb-3">
              Autorizar Novo Membro da Direção / Conselheiro
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nome do líder"
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="email@desbravadores.org"
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Função no Clube *
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                >
                  <option value="diretor_associado">Diretor(a) Associado(a)</option>
                  <option value="secretario">Secretário(a)</option>
                  <option value="conselheiro">Conselheiro(a) de Unidade</option>
                  <option value="instrutor">Instrutor(a) de Classes</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#FFC21A] py-2 px-3 text-xs font-bold text-[#031426] hover:bg-[#FFD147] transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAddingMember ? 'Adicionando...' : 'Adicionar Membro'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Leadership roster list */}
          <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white">
              Membros Autorizados do Clube ({leadership.length})
            </h3>

            <div className="divide-y divide-[#092642]">
              {leadership.map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={l.avatarUrl || '/src/assets/images/avatar_director_leader_1793039962613.jpg'}
                      alt={l.fullName}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full border border-[#FFC21A]/30 object-cover"
                    />
                    <div>
                      <div className="font-bold text-white">{l.fullName}</div>
                      <div className="text-[11px] text-[#8FA6C2]">{l.email}</div>
                    </div>
                  </div>

                  <span className="rounded bg-[#092642] px-2.5 py-1 text-[11px] font-semibold text-[#FFC21A] capitalize">
                    {l.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Supabase & Vercel Deployment Guide */}
      {activeTab === 'supabase' && (
        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#092642] pb-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-[#FFC21A]" />
              <div>
                <h2 className="text-base font-bold text-white">
                  Integração Supabase & Deploy na Vercel
                </h2>
                <p className="text-xs text-[#8FA6C2]">
                  Status da infraestrutura e instruções para publicação em produção
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Persistente Local Ativo'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#092642] bg-[#092642]/30 p-4 text-xs space-y-3 leading-relaxed text-slate-300">
            <p>
              O <strong>DesbravaPro</strong> foi desenvolvido com arquitetura híbrida pronta para publicação:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#8FA6C2]">
              <li>
                <strong className="text-white">Em Desenvolvimento / AI Studio:</strong> Os dados e autenticações são mantidos no armazenamento persistente isolado com senhas criptografadas por SHA-256 e suporte offline total.
              </li>
              <li>
                <strong className="text-white">Em Produção (Vercel + Supabase):</strong> Conecta-se diretamente ao Supabase Auth, PostgreSQL e Supabase Storage com Row Level Security (RLS) habilitado.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Passos para Publicação Oficial:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-[#092642] bg-[#092642]/20 p-4 space-y-2">
                <div className="font-bold text-[#FFC21A]">1. Crie seu Projeto Supabase</div>
                <p className="text-[#8FA6C2] text-[11px]">
                  Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-white underline">supabase.com</a> e crie um projeto gratuito para o seu clube.
                </p>
              </div>

              <div className="rounded-xl border border-[#092642] bg-[#092642]/20 p-4 space-y-2">
                <div className="font-bold text-[#FFC21A]">2. Execute o Script SQL</div>
                <p className="text-[#8FA6C2] text-[11px]">
                  Copie o arquivo <code className="text-white">supabase-schema.sql</code> incluído na raiz do projeto e execute no SQL Editor do Supabase.
                </p>
              </div>

              <div className="rounded-xl border border-[#092642] bg-[#092642]/20 p-4 space-y-2">
                <div className="font-bold text-[#FFC21A]">3. Configure na Vercel</div>
                <p className="text-[#8FA6C2] text-[11px]">
                  Adicione as variáveis de ambiente <code className="text-white">VITE_SUPABASE_URL</code> e <code className="text-white">VITE_SUPABASE_ANON_KEY</code> no painel da Vercel.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#8FA6C2]">
                Esquema SQL completo: <code className="text-white">/supabase-schema.sql</code>
              </span>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="flex items-center gap-1.5 rounded-lg border border-[#092642] bg-[#092642]/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-[#FFC21A]" />
                <span>{copiedSql ? 'Copiado!' : 'Copiar Comentário SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
