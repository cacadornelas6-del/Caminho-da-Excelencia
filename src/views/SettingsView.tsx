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
  CheckCircle,
  Copy,
  Plus,
  Save,
  AlertCircle,
  Edit2,
  Trash2,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { Club, UserProfile, UserRole } from '../types/index.ts';
import { isSupabaseConfigured } from '../services/supabaseClient.ts';
import { UserEditModal } from '../components/UserEditModal.tsx';
import { ASSETS } from '../assets/assets.ts';
import { ProfilePhotoMenu } from '../components/ProfilePhotoMenu.tsx';

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
  onEditLeadershipMember: (
    userId: string,
    data: {
      fullName: string;
      email: string;
      role: UserRole;
      passwordPlain?: string;
      avatarUrl?: string;
    }
  ) => Promise<void>;
  onDeleteLeadershipMember: (userId: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  club,
  currentUser,
  leadership,
  onUpdateClub,
  onAddLeadershipMember,
  onEditLeadershipMember,
  onDeleteLeadershipMember,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'lideranca' | 'supabase'>('lideranca');

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

  // Edit user modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const isAdminOrDirector = currentUser.role === 'admin' || currentUser.role === 'diretor';

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

    if (!newMemberName.trim()) {
      setErrorMsg('Informe o nome completo do usuário.');
      return;
    }
    if (!newMemberEmail.trim() || !newMemberEmail.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }
    if (!newMemberPass || newMemberPass.length < 6) {
      setErrorMsg('A senha inicial deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsAddingMember(true);
      await onAddLeadershipMember({
        fullName: newMemberName.trim(),
        email: newMemberEmail.trim().toLowerCase(),
        role: newMemberRole,
        passwordPlain: newMemberPass,
      });
      setIsAddingMember(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPass('desbrava123');
      setSuccessMsg('Usuário criado e autorizado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setIsAddingMember(false);
      setErrorMsg(err.message || 'Erro ao adicionar usuário.');
    }
  };

  const handleDeleteUser = async (userToDelete: UserProfile) => {
    if (userToDelete.id === currentUser.id) {
      alert('Você não pode excluir a sua própria conta logada.');
      return;
    }

    const confirm = window.confirm(
      `Confirma a remoção definitiva do usuário "${userToDelete.fullName}" (${userToDelete.email})?`
    );
    if (!confirm) return;

    try {
      setErrorMsg('');
      await onDeleteLeadershipMember(userToDelete.id);
      setSuccessMsg(`Usuário ${userToDelete.fullName} removido com sucesso.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao remover usuário.');
    }
  };

  const copySqlToClipboard = () => {
    const sqlText = `-- Executar no SQL Editor do Supabase para criar as tabelas e políticas RLS de produção
-- Arquivo completo em /supabase-schema.sql`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="rounded-full bg-purple-950/80 border border-purple-500/50 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
            Administrador Geral
          </span>
        );
      case 'diretor':
        return (
          <span className="rounded-full bg-[#FFC21A]/20 border border-[#FFC21A]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#FFC21A]">
            Diretor do Clube
          </span>
        );
      case 'diretor_associado':
        return (
          <span className="rounded-full bg-blue-950/80 border border-blue-500/40 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">
            Diretor Associado
          </span>
        );
      case 'secretario':
        return (
          <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
            Secretário
          </span>
        );
      case 'conselheiro':
        return (
          <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
            Conselheiro de Unidade
          </span>
        );
      case 'instrutor':
        return (
          <span className="rounded-full bg-amber-950/80 border border-amber-600/40 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
            Instrutor
          </span>
        );
      default:
        return null;
    }
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
              Configurações & Gestão de Usuários
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Controle de acesso, criação e edição de membros da liderança
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#092642]/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('lideranca')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'lideranca' ? 'bg-[#FFC21A] text-[#031426]' : 'text-slate-300 hover:text-white'
            }`}
          >
            Gestão de Usuários ({leadership.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'geral' ? 'bg-[#FFC21A] text-[#031426]' : 'text-slate-300 hover:text-white'
            }`}
          >
            Dados do Clube
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'supabase' ? 'bg-[#FFC21A] text-[#031426]' : 'text-slate-300 hover:text-white'
            }`}
          >
            Supabase & Deploy
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

      {/* Tab: Gestão de Usuários (Criação, Edição, Alteração de Cargo e Exclusão) */}
      {activeTab === 'lideranca' && (
        <div className="space-y-6">
          {/* Admin Banner */}
          <div className="rounded-xl border border-purple-900/40 bg-gradient-to-r from-purple-950/40 via-[#031426] to-[#092642]/40 p-4 text-xs text-slate-200 flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">Painel Administrativo de Usuários:</strong> Como{' '}
              <span className="capitalize text-[#FFC21A] font-bold">{currentUser.role}</span>, você tem
              permissão total para <strong>criar novos usuários</strong>, <strong>alterar nomes e cargos</strong>,{' '}
              <strong>redefinir senhas</strong> e <strong>remover contas</strong> de acesso ao clube.
            </div>
          </div>

          {/* Form to create a new user */}
          <form
            onSubmit={handleAddMember}
            className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#092642] pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#FFC21A]" />
                <span>Criar Novo Usuário no Sistema</span>
              </h2>
              <span className="text-[11px] text-[#8FA6C2]">
                Conceda acesso a diretores, secretários e conselheiros
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="new-user-name" className="block text-xs font-semibold text-slate-200 mb-1">
                  Nome Completo *
                </label>
                <input
                  id="new-user-name"
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nome do usuário"
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-user-email" className="block text-xs font-semibold text-slate-200 mb-1">
                  E-mail de Login *
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="usuario@desbravadores.org"
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-user-role" className="block text-xs font-semibold text-slate-200 mb-1">
                  Cargo / Função *
                </label>
                <select
                  id="new-user-role"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
                >
                  <option value="admin">Administrador Geral</option>
                  <option value="diretor">Diretor(a) do Clube</option>
                  <option value="diretor_associado">Diretor(a) Associado(a)</option>
                  <option value="secretario">Secretário(a)</option>
                  <option value="conselheiro">Conselheiro(a) de Unidade</option>
                  <option value="instrutor">Instrutor(a)</option>
                </select>
              </div>

              <div>
                <label htmlFor="new-user-pass" className="block text-xs font-semibold text-slate-200 mb-1">
                  Senha Inicial *
                </label>
                <input
                  id="new-user-pass"
                  type="text"
                  value={newMemberPass}
                  onChange={(e) => setNewMemberPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2 text-xs text-white focus:border-[#FFC21A] focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isAddingMember}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-5 py-2 text-xs font-bold text-[#031426] shadow-md hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>{isAddingMember ? 'Criando Usuário...' : 'Criar e Cadastrar Usuário'}</span>
              </button>
            </div>
          </form>

          {/* User List with Edit and Delete options */}
          <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#092642] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FFC21A]" />
                <span>Usuários Cadastrados ({leadership.length})</span>
              </h3>
              <span className="text-xs text-[#8FA6C2]">
                Controle individual de permissões e credenciais
              </span>
            </div>

            <div className="divide-y divide-[#092642]">
              {leadership.map((l) => {
                const isSelf = l.id === currentUser.id;

                return (
                  <div
                    key={l.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#092642]/30 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ProfilePhotoMenu
                        photoUrl={l.avatarUrl}
                        defaultPhotoUrl={ASSETS.avatarDirector}
                        userName={l.fullName}
                        subtitle={l.role}
                        size="md"
                        canEdit={isAdminOrDirector || isSelf}
                        onUpdatePhoto={async (newPhoto) => {
                          await onEditLeadershipMember(l.id, {
                            fullName: l.fullName,
                            email: l.email,
                            role: l.role,
                            avatarUrl: newPhoto,
                          });
                        }}
                        onRemovePhoto={async () => {
                          await onEditLeadershipMember(l.id, {
                            fullName: l.fullName,
                            email: l.email,
                            role: l.role,
                            avatarUrl: '',
                          });
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{l.fullName}</span>
                          {isSelf && (
                            <span className="rounded bg-emerald-950/80 border border-emerald-600 px-1.5 py-0.2 text-[10px] text-emerald-300 font-bold">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8FA6C2]">{l.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>{getRoleBadge(l.role)}</div>

                      {/* Action buttons: Edit and Remove */}
                      <div className="flex items-center gap-1.5 border-l border-[#092642] pl-3">
                        <button
                          type="button"
                          onClick={() => setEditingUser(l)}
                          title="Editar nome, cargo ou senha"
                          className="flex items-center gap-1 rounded-lg border border-[#092642] bg-[#092642]/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:border-[#FFC21A] hover:text-[#FFC21A] transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(l)}
                          disabled={isSelf}
                          title={isSelf ? 'Você não pode remover sua própria conta' : 'Remover usuário'}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                            isSelf
                              ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                              : 'border-red-900/60 bg-red-950/30 text-red-300 hover:bg-red-900/60 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Dados Gerais do Clube */}
      {activeTab === 'geral' && (
        <form
          onSubmit={handleSaveGeneral}
          className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-4"
        >
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

      {/* Tab: Supabase & Deploy */}
      {activeTab === 'supabase' && (
        <div className="rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#092642] pb-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-[#FFC21A]" />
              <div>
                <h2 className="text-base font-bold text-white">
                  Integração Supabase & Deploy
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
              O <strong>DesbravaPro</strong> está pronto para execução no GitHub Pages, Vercel ou qualquer hospedagem moderna:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#8FA6C2]">
              <li>
                <strong className="text-white">GitHub Pages:</strong> Workflow de deploy automático já configurado em <code className="text-white">.github/workflows/deploy.yml</code>.
              </li>
              <li>
                <strong className="text-white">Supabase:</strong> Execute o arquivo <code className="text-white">supabase-schema.sql</code> no SQL Editor para criar as tabelas com RLS e triggers.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#8FA6C2]">
              Esquema SQL: <code className="text-white">/supabase-schema.sql</code>
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
      )}

      {/* Modal for editing existing user */}
      <UserEditModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={async (userId, data) => {
          await onEditLeadershipMember(userId, data);
          setSuccessMsg(`Usuário ${data.fullName} atualizado com sucesso!`);
          setTimeout(() => setSuccessMsg(''), 4000);
        }}
      />
    </div>
  );
};
