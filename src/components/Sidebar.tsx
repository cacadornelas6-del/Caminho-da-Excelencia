/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  PlusCircle,
  History,
  BookOpen,
  FileSpreadsheet,
  Settings,
  Database,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'ranking'
  | 'pathfinders'
  | 'history'
  | 'curriculum'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenScoring: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenScoring,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'ranking' as TabId, label: 'Ranking de Excelência', icon: Trophy },
    { id: 'pathfinders' as TabId, label: 'Desbravadores', icon: Users },
    { id: 'history' as TabId, label: 'Histórico & Estornos', icon: History },
    { id: 'curriculum' as TabId, label: 'Classes & Especialidades', icon: BookOpen },
    { id: 'reports' as TabId, label: 'Relatórios & Exportação', icon: FileSpreadsheet },
    { id: 'settings' as TabId, label: 'Configurações do Clube', icon: Settings },
  ];

  const handleNav = (tab: TabId) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[#092642] bg-[#031426] pt-16 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Quick Action Button in Sidebar */}
            <button
              type="button"
              onClick={() => {
                onOpenScoring();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFC21A] to-[#F59E0B] p-3 text-xs font-bold text-[#031426] shadow-lg shadow-[#FFC21A]/10 transition-transform active:scale-98 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Registrar Pontuação</span>
            </button>

            {/* Navigation links */}
            <nav className="space-y-1">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8FA6C2]">
                Menu Principal
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#092642] text-[#FFC21A] shadow-inner font-semibold border-l-2 border-[#FFC21A]'
                        : 'text-slate-300 hover:bg-[#092642]/60 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? 'text-[#FFC21A]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card: Supabase Status Indicator */}
          <div className="rounded-xl border border-[#092642] bg-[#092642]/40 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Database className="h-3.5 w-3.5 text-[#FFC21A]" />
              <span>Armazenamento & RLS</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#8FA6C2]">
              Isolamento por clube e suporte integrado ao Supabase.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
