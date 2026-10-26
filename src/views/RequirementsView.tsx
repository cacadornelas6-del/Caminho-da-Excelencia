/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Compass,
  Star,
  Plus,
  Search,
} from 'lucide-react';
import { PATHFINDER_CLASSES, SPECIALTY_CATEGORIES, SpecialtyItem } from '../data/curriculum.ts';
import { Pathfinder } from '../types/index.ts';

interface RequirementsViewProps {
  pathfinders: Pathfinder[];
  onQuickScoreRequirement: (
    title: string,
    category: 'Classes' | 'Especialidades',
    defaultPts: number
  ) => void;
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({
  pathfinders,
  onQuickScoreRequirement,
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'especialidades'>('classes');
  const [selectedClassIndex, setSelectedClassIndex] = useState<number>(0);
  const [specialtySearch, setSpecialtySearch] = useState<string>('');

  const currentClass = PATHFINDER_CLASSES[selectedClassIndex];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#092642] bg-[#031426] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC21A]/10 text-[#FFC21A] border border-[#FFC21A]/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">
              Classes & Especialidades Oficiais
            </h1>
            <p className="text-xs text-[#8FA6C2]">
              Currículo formativo, requisitos de investidura e pontuação configurável
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#092642]/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-[#FFC21A] text-[#031426] shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Classes Regulares (6)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('especialidades')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'especialidades'
                ? 'bg-[#FFC21A] text-[#031426] shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Catálogo de Especialidades
          </button>
        </div>
      </div>

      {/* Tab 1: Classes Regulares */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Classes Selector */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8FA6C2] px-2 mb-2">
              Classes Regulares e Avançadas
            </div>
            {PATHFINDER_CLASSES.map((cls, idx) => {
              const isSelected = selectedClassIndex === idx;
              const memberCount = pathfinders.filter((p) => p.currentClass === cls.name).length;
              return (
                <button
                  key={cls.name}
                  type="button"
                  onClick={() => setSelectedClassIndex(idx)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#FFC21A] bg-[#092642] shadow-lg'
                      : 'border-[#092642] bg-[#031426]/70 hover:bg-[#092642]/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{cls.name}</div>
                      <div className="text-[10px] text-[#8FA6C2]">{cls.age} anos · {cls.advancedName}</div>
                    </div>
                  </div>
                  <span className="rounded bg-[#031426] px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFC21A]">
                    {memberCount} inscritos
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Requirements of the active class */}
          <div className="lg:col-span-3 rounded-2xl border border-[#092642] bg-[#031426]/90 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#092642] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: currentClass.color }}
                  />
                  <h2 className="text-lg font-bold text-white">
                    Classe de {currentClass.name} ({currentClass.age} anos)
                  </h2>
                </div>
                <div className="text-xs text-[#8FA6C2] mt-0.5">
                  Classe avançada: <strong className="text-slate-300">{currentClass.advancedName}</strong> · Peso recomendado: 100 pontos
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onQuickScoreRequirement(
                    `Conclusão de Requisito: Classe ${currentClass.name}`,
                    'Classes',
                    100
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-[#FFC21A] px-3.5 py-2 text-xs font-bold text-[#031426] shadow-sm hover:brightness-105 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Lançar Requisito Concluído</span>
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Requisitos Básicos da Ficha Oficial
              </h3>
              {currentClass.requirements.map((req, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#092642] bg-[#092642]/30 p-3.5 text-xs text-slate-200"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#FFC21A] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onQuickScoreRequirement(
                        `Requisito ${currentClass.name}: ${req.substring(0, 45)}...`,
                        'Classes',
                        25
                      )
                    }
                    className="rounded border border-[#092642] bg-[#031426] px-2 py-1 text-[10px] font-semibold text-[#FFC21A] hover:border-[#FFC21A] transition-colors shrink-0 cursor-pointer"
                  >
                    Aprovar (+25 pts)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Especialidades */}
      {activeTab === 'especialidades' && (
        <div className="space-y-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
              placeholder="Buscar especialidade por nome ou área..."
              className="w-full rounded-xl border border-[#092642] bg-[#092642]/40 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FFC21A] focus:outline-none"
            />
          </div>

          <div className="space-y-6">
            {SPECIALTY_CATEGORIES.map((catGroup) => {
              const matched = catGroup.specialties.filter((s) => {
                if (!specialtySearch.trim()) return true;
                const term = specialtySearch.toLowerCase();
                return s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term);
              });

              if (matched.length === 0) return null;

              return (
                <div key={catGroup.category} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#092642] pb-2 text-xs font-bold uppercase tracking-wider text-[#8FA6C2]">
                    <Award className="h-4 w-4 text-[#FFC21A]" />
                    <span>Área: {catGroup.category} ({matched.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matched.map((spec) => (
                      <div
                        key={spec.name}
                        className="rounded-xl border border-[#092642] bg-[#031426]/80 p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#FFC21A]/50 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{spec.name}</div>
                          <div className="text-[10px] text-[#8FA6C2] mt-0.5">
                            {spec.category} · {spec.defaultPoints} pontos sugeridos
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onQuickScoreRequirement(
                              `Especialidade: ${spec.name}`,
                              'Especialidades',
                              spec.defaultPoints
                            )
                          }
                          className="flex items-center gap-1 rounded-lg bg-[#FFC21A]/10 border border-[#FFC21A]/30 px-2.5 py-1 text-[11px] font-bold text-[#FFC21A] hover:bg-[#FFC21A]/20 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Lançar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
