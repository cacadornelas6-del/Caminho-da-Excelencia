/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, UserCheck, ShieldCheck, KeyRound, AlertCircle, Save } from 'lucide-react';
import { UserProfile, UserRole } from '../types/index.ts';
import { ASSETS } from '../assets/assets.ts';
import { ProfilePhotoMenu } from './ProfilePhotoMenu.tsx';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSave: (
    userId: string,
    data: {
      fullName: string;
      email: string;
      role: UserRole;
      passwordPlain?: string;
      avatarUrl?: string;
    }
  ) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole>('conselheiro');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setRole(user.role);
      setAvatarUrl(user.avatarUrl || '');
      setNewPassword('');
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('O nome completo deve ter pelo menos 3 caracteres.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(user.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        passwordPlain: newPassword.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Erro ao atualizar dados do usuário.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-edit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-[#092642] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="user-edit-modal-title" className="text-base font-bold text-white">
                Editar Usuário da Liderança
              </h2>
              <p className="text-xs text-[#8FA6C2]">
                Altere nome, cargo/função ou redefina a senha de acesso
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
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile photo edit preview block */}
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-[#092642] bg-[#092642]/30 p-3.5">
          <ProfilePhotoMenu
            photoUrl={avatarUrl || user.avatarUrl}
            defaultPhotoUrl={ASSETS.avatarDirector}
            userName={fullName || user.fullName}
            subtitle={role}
            size="lg"
            onUpdatePhoto={(newPhoto) => setAvatarUrl(newPhoto)}
            onRemovePhoto={() => setAvatarUrl('')}
          />
          <div>
            <div className="text-xs font-bold text-white">Foto de Perfil</div>
            <p className="text-[11px] text-[#8FA6C2] leading-relaxed">
              Clique na foto para ver opções: <strong>mostrar</strong>, <strong>tirar foto</strong> com a câmera, <strong>carregar</strong> ou <strong>remover</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-user-name" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Nome Completo *
            </label>
            <input
              id="edit-user-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-user-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
              E-mail de Acesso *
            </label>
            <input
              id="edit-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-user-role" className="block text-xs font-semibold text-slate-200 mb-1.5">
              Cargo / Função no Clube *
            </label>
            <select
              id="edit-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white focus:border-[#FFC21A] focus:outline-none"
            >
              <option value="admin">Administrador(a) Geral (Acesso Total)</option>
              <option value="diretor">Diretor(a) do Clube</option>
              <option value="diretor_associado">Diretor(a) Associado(a)</option>
              <option value="secretario">Secretário(a)</option>
              <option value="conselheiro">Conselheiro(a) de Unidade</option>
              <option value="instrutor">Instrutor(a) de Classes/Especialidades</option>
            </select>
            <p className="mt-1 text-[11px] text-[#8FA6C2]">
              Administradores e Diretores têm permissão para criar, editar e excluir contas de usuários.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="edit-user-password" className="block text-xs font-semibold text-slate-200">
                Redefinir Senha de Acesso (Opcional)
              </label>
              <span className="text-[11px] text-[#8FA6C2]">Deixe em branco para manter a atual</span>
            </div>
            <div className="relative">
              <input
                id="edit-user-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (mínimo 6 caracteres)"
                className="w-full rounded-xl border border-[#092642] bg-[#092642]/50 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FFC21A] focus:outline-none"
              />
            </div>
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] px-5 py-2 text-xs font-bold text-[#031426] shadow-md shadow-[#FFC21A]/20 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
