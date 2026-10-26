/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Pathfinder,
  PointRecord,
  RankedPathfinder,
  UnitStat,
  PointCategory,
} from '../types/index.ts';

/**
 * Calculates progress percentage towards the club's excellence target (0 - 100%).
 */
export function calculatePathfinderProgress(
  points: number,
  targetExcellencePoints: number = 1000
): number {
  if (targetExcellencePoints <= 0) return 0;
  if (points <= 0) return 0;
  const pct = Math.round((points / targetExcellencePoints) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * Calculates total points earned in 'Classes' and 'Especialidades' for tie-breaking.
 */
export function getCurriculumPoints(
  pathfinderId: string,
  records: PointRecord[]
): number {
  return records
    .filter(
      (r) =>
        r.pathfinderId === pathfinderId &&
        !r.isReversed &&
        (r.category === 'Classes' || r.category === 'Especialidades')
    )
    .reduce((sum, r) => sum + r.points, 0);
}

/**
 * Sorts pathfinders into an official ranking with documented tie-breakers:
 * 1. Total points (descending)
 * 2. Curriculum points ('Classes' + 'Especialidades') (descending)
 * 3. Registration date (seniority: earliest date first)
 * 4. Alphabetical by full name
 */
export function sortRanking(
  pathfinders: Pathfinder[],
  records: PointRecord[] = []
): RankedPathfinder[] {
  // Precompute curriculum points
  const curriculumMap = new Map<string, number>();
  for (const pf of pathfinders) {
    curriculumMap.set(pf.id, getCurriculumPoints(pf.id, records));
  }

  const sorted = [...pathfinders].sort((a, b) => {
    // 1. Total points
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    // 2. Curriculum points (Classes + Especialidades)
    const currA = curriculumMap.get(a.id) || 0;
    const currB = curriculumMap.get(b.id) || 0;
    if (currB !== currA) {
      return currB - currA;
    }

    // 3. Seniority (registrationDate)
    const dateA = new Date(a.registrationDate).getTime() || 0;
    const dateB = new Date(b.registrationDate).getTime() || 0;
    if (dateA !== dateB) {
      return dateA - dateB; // earlier registration gets priority in tie
    }

    // 4. Alphabetical
    return a.fullName.localeCompare(b.fullName, 'pt-BR');
  });

  return sorted.map((pf, index) => ({
    ...pf,
    rankPosition: index + 1,
    classPoints: curriculumMap.get(pf.id) || 0,
  }));
}

/**
 * Applies points transaction to a pathfinder's total score and updates progress.
 */
export function applyPointsTransaction(
  pathfinder: Pathfinder,
  pointsAwarded: number,
  targetExcellencePoints: number = 1000
): Pathfinder {
  const newTotal = Math.max(0, pathfinder.totalPoints + pointsAwarded);
  return {
    ...pathfinder,
    totalPoints: newTotal,
    progressPercent: calculatePathfinderProgress(newTotal, targetExcellencePoints),
  };
}

/**
 * Applies points reversal transaction (estorno) to a pathfinder's score.
 */
export function applyReversalTransaction(
  pathfinder: Pathfinder,
  pointsToDeduct: number,
  targetExcellencePoints: number = 1000
): Pathfinder {
  const newTotal = Math.max(0, pathfinder.totalPoints - pointsToDeduct);
  return {
    ...pathfinder,
    totalPoints: newTotal,
    progressPercent: calculatePathfinderProgress(newTotal, targetExcellencePoints),
  };
}

/**
 * Computes aggregated statistics grouped by Unidade.
 */
export function calculateUnitStats(
  pathfinders: Pathfinder[],
  records: PointRecord[] = []
): UnitStat[] {
  const unitMap = new Map<string, { members: number; points: number }>();

  for (const pf of pathfinders) {
    if (pf.status === 'graduado') continue;
    const current = unitMap.get(pf.unit) || { members: 0, points: 0 };
    unitMap.set(pf.unit, {
      members: current.members + 1,
      points: current.points + pf.totalPoints,
    });
  }

  const result: UnitStat[] = [];
  unitMap.forEach((val, unitName) => {
    result.push({
      unitName,
      memberCount: val.members,
      totalPoints: val.points,
      averagePoints: val.members > 0 ? Math.round(val.points / val.members) : 0,
    });
  });

  return result.sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Filters point records with full search across participant name, activity, and reviewer.
 */
export function filterPointsRecords(
  records: PointRecord[],
  options: {
    searchTerm?: string;
    pathfinderId?: string;
    category?: PointCategory | 'todas';
    unit?: string | 'todas';
    startDate?: string;
    endDate?: string;
    includeReversed?: boolean;
  }
): PointRecord[] {
  return records.filter((r) => {
    if (!options.includeReversed && r.isReversed) return false;
    if (options.pathfinderId && r.pathfinderId !== options.pathfinderId) return false;
    if (options.category && options.category !== 'todas' && r.category !== options.category) {
      return false;
    }
    if (options.unit && options.unit !== 'todas' && r.unit !== options.unit) {
      return false;
    }
    if (options.startDate && r.activityDate < options.startDate) return false;
    if (options.endDate && r.activityDate > options.endDate) return false;

    if (options.searchTerm && options.searchTerm.trim()) {
      const term = options.searchTerm.toLowerCase().trim();
      const matchName = r.pathfinderName.toLowerCase().includes(term);
      const matchAct = r.activityName.toLowerCase().includes(term);
      const matchJust = r.justification.toLowerCase().includes(term);
      const matchAppr = r.approvedBy.toLowerCase().includes(term);
      if (!matchName && !matchAct && !matchJust && !matchAppr) return false;
    }

    return true;
  });
}

/**
 * Export helpers: format data to clean UTF-8 CSV with BOM for Excel compatibility in pt-BR.
 */
export function generateRankingCSV(ranking: RankedPathfinder[]): string {
  const headers = [
    'Posição',
    'Nome Completo',
    'Unidade',
    'Classe Atual',
    'Pontuação Total',
    'Progresso (%)',
    'Pontos em Classes/Espec.',
    'Situação',
    'Data de Cadastro',
  ];

  const rows = ranking.map((pf) => [
    pf.rankPosition,
    `"${pf.fullName.replace(/"/g, '""')}"`,
    `"${pf.unit.replace(/"/g, '""')}"`,
    `"${pf.currentClass.replace(/"/g, '""')}"`,
    pf.totalPoints,
    `${pf.progressPercent}%`,
    pf.classPoints,
    pf.status,
    pf.registrationDate,
  ]);

  return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
}

export function generatePointsHistoryCSV(records: PointRecord[]): string {
  const headers = [
    'ID',
    'Desbravador',
    'Unidade',
    'Pontos',
    'Categoria',
    'Atividade/Requisito',
    'Justificativa/Motivo',
    'Data da Atividade',
    'Aprovado Por',
    'Data de Aprovação',
    'Status',
    'Motivo do Estorno',
  ];

  const rows = records.map((r) => [
    r.id,
    `"${r.pathfinderName.replace(/"/g, '""')}"`,
    `"${r.unit.replace(/"/g, '""')}"`,
    r.points,
    `"${r.category}"`,
    `"${r.activityName.replace(/"/g, '""')}"`,
    `"${r.justification.replace(/"/g, '""')}"`,
    r.activityDate,
    `"${r.approvedBy.replace(/"/g, '""')}"`,
    r.createdAt.split('T')[0],
    r.isReversed ? 'Estornado' : 'Aprovado',
    r.reversalReason ? `"${r.reversalReason.replace(/"/g, '""')}"` : '',
  ]);

  return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
}
