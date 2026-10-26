/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePathfinderProgress,
  sortRanking,
  applyPointsTransaction,
  applyReversalTransaction,
  calculateUnitStats,
  filterPointsRecords,
} from './scoring.ts';
import { Pathfinder, PointRecord } from '../types/index.ts';

const mockPathfinders: Pathfinder[] = [
  {
    id: 'pf-1',
    clubId: 'club-1',
    fullName: 'Lucas Rocha',
    photoUrl: '',
    unit: 'Águia Real',
    registrationDate: '2024-01-10',
    totalPoints: 300,
    progressPercent: 30,
    status: 'ativo',
    currentClass: 'Companheiro',
  },
  {
    id: 'pf-2',
    clubId: 'club-1',
    fullName: 'Beatriz Santos',
    photoUrl: '',
    unit: 'Águia Real',
    registrationDate: '2024-02-15',
    totalPoints: 450,
    progressPercent: 45,
    status: 'ativo',
    currentClass: 'Pesquisador',
  },
  {
    id: 'pf-3',
    clubId: 'club-1',
    fullName: 'João Gabriel',
    photoUrl: '',
    unit: 'Sentinelas',
    registrationDate: '2023-11-01',
    totalPoints: 450, // Tied with Beatriz on total points!
    progressPercent: 45,
    status: 'destaque',
    currentClass: 'Pioneiro',
  },
];

const mockRecords: PointRecord[] = [
  {
    id: 'rec-1',
    clubId: 'club-1',
    pathfinderId: 'pf-2',
    pathfinderName: 'Beatriz Santos',
    unit: 'Águia Real',
    points: 150,
    category: 'Classes',
    activityName: 'Investidura Amigo',
    justification: 'Completou classe',
    activityDate: '2024-03-01',
    approvedBy: 'Diretor Carlos',
    approvedByUserId: 'usr-1',
    createdAt: '2024-03-01T10:00:00Z',
    isReversed: false,
  },
  {
    id: 'rec-2',
    clubId: 'club-1',
    pathfinderId: 'pf-3',
    pathfinderName: 'João Gabriel',
    unit: 'Sentinelas',
    points: 200,
    category: 'Classes', // João has 200 class points vs Beatriz 150
    activityName: 'Investidura Companheiro',
    justification: 'Completou requisitos',
    activityDate: '2024-03-05',
    approvedBy: 'Diretor Carlos',
    approvedByUserId: 'usr-1',
    createdAt: '2024-03-05T10:00:00Z',
    isReversed: false,
  },
  {
    id: 'rec-3',
    clubId: 'club-1',
    pathfinderId: 'pf-3',
    pathfinderName: 'João Gabriel',
    unit: 'Sentinelas',
    points: 50,
    category: 'Serviço comunitário',
    activityName: 'Campanha do Quilo',
    justification: 'Arrecadação de alimentos com espírito de serviço',
    activityDate: '2024-03-10',
    approvedBy: 'Diretor Carlos',
    approvedByUserId: 'usr-1',
    createdAt: '2024-03-10T10:00:00Z',
    isReversed: false,
  },
];

test('calculatePathfinderProgress calculates correct percentage capped at 100', () => {
  assert.equal(calculatePathfinderProgress(0, 1000), 0);
  assert.equal(calculatePathfinderProgress(250, 1000), 25);
  assert.equal(calculatePathfinderProgress(754, 1000), 75);
  assert.equal(calculatePathfinderProgress(1200, 1000), 100);
  assert.equal(calculatePathfinderProgress(500, 500), 100);
});

test('sortRanking breaks ties using curriculum points (Classes & Especialidades)', () => {
  const ranking = sortRanking(mockPathfinders, mockRecords);

  assert.equal(ranking.length, 3);
  // João Gabriel (450 pts, 200 class pts) should be #1 over Beatriz (450 pts, 150 class pts)
  assert.equal(ranking[0].fullName, 'João Gabriel');
  assert.equal(ranking[0].rankPosition, 1);
  assert.equal(ranking[0].classPoints, 200);

  assert.equal(ranking[1].fullName, 'Beatriz Santos');
  assert.equal(ranking[1].rankPosition, 2);
  assert.equal(ranking[1].classPoints, 150);

  assert.equal(ranking[2].fullName, 'Lucas Rocha');
  assert.equal(ranking[2].rankPosition, 3);
});

test('applyPointsTransaction correctly updates total points and recalculates progress', () => {
  const updated = applyPointsTransaction(mockPathfinders[0], 100, 1000);
  assert.equal(updated.totalPoints, 400);
  assert.equal(updated.progressPercent, 40);
});

test('applyReversalTransaction correctly deducts points and prevents negative values', () => {
  const updated = applyReversalTransaction(mockPathfinders[0], 50, 1000);
  assert.equal(updated.totalPoints, 250);
  assert.equal(updated.progressPercent, 25);

  const floored = applyReversalTransaction(mockPathfinders[0], 1000, 1000);
  assert.equal(floored.totalPoints, 0);
  assert.equal(floored.progressPercent, 0);
});

test('calculateUnitStats properly aggregates members, total points, and average', () => {
  const stats = calculateUnitStats(mockPathfinders, mockRecords);
  assert.equal(stats.length, 2);

  // Águia Real has 2 members: Lucas (300) + Beatriz (450) = 750, avg = 375
  const aguia = stats.find((s) => s.unitName === 'Águia Real');
  assert.ok(aguia);
  assert.equal(aguia?.memberCount, 2);
  assert.equal(aguia?.totalPoints, 750);
  assert.equal(aguia?.averagePoints, 375);

  // Sentinelas has 1 member: João (450)
  const sentinelas = stats.find((s) => s.unitName === 'Sentinelas');
  assert.ok(sentinelas);
  assert.equal(sentinelas?.memberCount, 1);
  assert.equal(sentinelas?.totalPoints, 450);
});

test('filterPointsRecords filters by category and search term correctly', () => {
  const filtered = filterPointsRecords(mockRecords, {
    category: 'Serviço comunitário',
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].activityName, 'Campanha do Quilo');

  const searched = filterPointsRecords(mockRecords, {
    searchTerm: 'alimentos',
  });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].pathfinderName, 'João Gabriel');
});
