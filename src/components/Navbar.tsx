/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Plus, LogOut, Shield, Menu, X } from 'lucide-react';
import { UserProfile, Club } from '../types/index.ts';
import { ASSETS } from '../assets/assets.ts';
import { ProfilePhotoMenu } from './ProfilePhotoMenu.tsx';

interface NavbarProps {
  user: UserProfile;
  club: Club | null;
  onOpenScoring: () => void;
  onLogout: () => void;
  onUpdateUserPhoto?: (photoUrl: string) => void;
  onRemoveUserPhoto?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  club,
  onOpenScoring,
  onLogout,
  onUpdateUserPhoto,
  onRemoveUserPhoto,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#092642] bg-[#031426]/95 px-4 backdrop-blur md:px-8">
      {/* Zone 1: Single text element wordmark + club badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#092642] hover:text-white md:hidden"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFC21A] to-[#D99B00] shadow-md shadow-[#FFC21A]/20">
            <Award className="h-6 w-6 text-[#031426]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              DesbravaPro
            </span>
            <div className="hidden text-xs text-[#8FA6C2] sm:block">
              {club?.name || 'Sistema de Excelência'}
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Contextual Club / Session Info */}
      <div className="hidden items-center gap-2 lg:flex text-xs text-[#8FA6C2]">
        <Shield className="h-4 w-4 text-[#FFC21A]" />
        <span>{club?.region || 'Clube de Desbravadores'}</span>
        <span aria-hidden="true">·</span>
        <span className="capitalize">{user.role}</span>
      </div>

      {/* Zone 3: Primary Action + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenScoring}
          className="flex items-center gap-1.5 rounded-lg bg-[#FFC21A] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-[#031426] shadow-md shadow-[#FFC21A]/20 transition-all hover:bg-[#FFD147] active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span className="hidden sm:inline">Lançar Pontos</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[#092642]">
          <ProfilePhotoMenu
            photoUrl={user.avatarUrl}
            defaultPhotoUrl={ASSETS.avatarDirector}
            userName={user.fullName}
            subtitle={user.role}
            size="sm"
            onUpdatePhoto={(newPhoto) => {
              if (onUpdateUserPhoto) onUpdateUserPhoto(newPhoto);
            }}
            onRemovePhoto={() => {
              if (onRemoveUserPhoto) onRemoveUserPhoto();
            }}
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
              {user.fullName}
            </div>
            <div className="text-[10px] text-[#8FA6C2] capitalize">
              {user.role}
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Encerrar sessão"
            className="rounded-lg p-1 text-slate-400 hover:bg-[#092642] hover:text-red-400 transition-colors cursor-pointer"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
