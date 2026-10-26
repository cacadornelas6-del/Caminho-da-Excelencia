/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'admin'
  | 'diretor'
  | 'diretor_associado'
  | 'secretario'
  | 'conselheiro'
  | 'instrutor';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  clubId: string;
  clubName: string;
  avatarUrl?: string;
  createdAt: string;
}

export type PointCategory =
  | 'Classes'
  | 'Especialidades'
  | 'Atividades'
  | 'Serviço comunitário'
  | 'Disciplina'
  | 'Liderança'
  | 'Participação'
  | 'Outros';

export interface ClubSettings {
  targetExcellencePoints: number; // e.g. 1000 points for annual excellence badge
  tieBreakerRule: 'classes_first' | 'seniority_first';
  categoryWeights: Record<PointCategory, number>;
  unitsList: string[];
}

export interface Club {
  id: string;
  name: string;
  region: string;
  district: string;
  church: string;
  motto: string;
  logoUrl?: string;
  createdAt: string;
  settings: ClubSettings;
}

export type PathfinderStatus = 'ativo' | 'destaque' | 'observacao' | 'graduado';

export interface Pathfinder {
  id: string;
  clubId: string;
  fullName: string;
  photoUrl: string;
  unit: string;
  birthDate?: string;
  registrationDate: string;
  totalPoints: number;
  progressPercent: number;
  status: PathfinderStatus;
  currentClass: string;
  notes?: string;
  spotlightReason?: string;
}

export interface PointRecord {
  id: string;
  clubId: string;
  pathfinderId: string;
  pathfinderName: string;
  unit: string;
  points: number;
  category: PointCategory;
  activityName: string;
  justification: string;
  activityDate: string;
  approvedBy: string;
  approvedByUserId: string;
  createdAt: string;
  isReversed: boolean;
  reversedAt?: string;
  reversedBy?: string;
  reversalReason?: string;
}

export interface RequirementRecord {
  id: string;
  clubId: string;
  pathfinderId: string;
  type: 'classe' | 'especialidade';
  category: string;
  codeOrName: string;
  completedDate: string;
  approvedBy: string;
  pointsAwarded: number;
  notes?: string;
}

export interface AuditLog {
  id: string;
  clubId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface RankedPathfinder extends Pathfinder {
  rankPosition: number;
  classPoints: number;
}

export interface UnitStat {
  unitName: string;
  memberCount: number;
  totalPoints: number;
  averagePoints: number;
}
