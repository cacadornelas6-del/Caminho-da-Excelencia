/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  Club,
  Pathfinder,
  PointRecord,
  AuditLog,
  PointCategory,
  UserRole,
} from './types/index.ts';
import { dbService } from './services/db.ts';
import { sortRanking, calculateUnitStats } from './utils/scoring.ts';

import { Navbar } from './components/Navbar.tsx';
import { Sidebar, TabId } from './components/Sidebar.tsx';
import { ScoringModal } from './components/ScoringModal.tsx';
import { PathfinderModal } from './components/PathfinderModal.tsx';
import { PathfinderProfileDrawer } from './components/PathfinderProfileDrawer.tsx';
import { ReversalModal } from './components/ReversalModal.tsx';

import { DashboardView } from './views/DashboardView.tsx';
import { RankingView } from './views/RankingView.tsx';
import { PathfindersView } from './views/PathfindersView.tsx';
import { HistoryView } from './views/HistoryView.tsx';
import { RequirementsView } from './views/RequirementsView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { AuthView } from './views/AuthView.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [pathfinders, setPathfinders] = useState<Pathfinder[]>([]);
  const [pointRecords, setPointRecords] = useState<PointRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [leadership, setLeadership] = useState<UserProfile[]>([]);

  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Modals state
  const [isScoringModalOpen, setIsScoringModalOpen] = useState<boolean>(false);
  const [scoringPreselectedPfId, setScoringPreselectedPfId] = useState<string | undefined>(undefined);

  const [isPfModalOpen, setIsPfModalOpen] = useState<boolean>(false);
  const [editingPf, setEditingPf] = useState<Pathfinder | null>(null);

  const [selectedDrawerPf, setSelectedDrawerPf] = useState<Pathfinder | null>(null);
  const [reversalTargetRecord, setReversalTargetRecord] = useState<PointRecord | null>(null);

  // Load session on startup
  useEffect(() => {
    async function init() {
      try {
        const session = dbService.getSession();
        if (session) {
          setCurrentUser(session);
          await loadClubData(session.clubId);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  const loadClubData = async (clubId: string) => {
    try {
      const [clubData, pfData, pointsData, logsData, leadData] = await Promise.all([
        dbService.getClub(clubId),
        dbService.getPathfinders(clubId),
        dbService.getPointRecords(clubId),
        dbService.getAuditLogs(clubId),
        dbService.getLeadershipMembers(clubId),
      ]);

      setClub(clubData);
      setPathfinders(pfData);
      setPointRecords(pointsData);
      setAuditLogs(logsData);
      setLeadership(leadData);
    } catch (err) {
      console.error('Error loading club data:', err);
    }
  };

  // Ranking & Unit Stats
  const ranking = useMemo(() => {
    return sortRanking(pathfinders, pointRecords);
  }, [pathfinders, pointRecords]);

  const unitStats = useMemo(() => {
    return calculateUnitStats(pathfinders, pointRecords);
  }, [pathfinders, pointRecords]);

  // Auth Handlers
  const handleLogin = async (email: string, pass: string): Promise<UserProfile> => {
    const user = await dbService.login(email, pass);
    setCurrentUser(user);
    await loadClubData(user.clubId);
    return user;
  };

  const handleRegisterClub = async (data: any): Promise<UserProfile> => {
    const user = await dbService.registerClub(data);
    setCurrentUser(user);
    await loadClubData(user.clubId);
    return user;
  };

  const handleRecoverPassword = async (email: string) => {
    return dbService.recoverPassword(email);
  };

  const handleLogout = () => {
    dbService.setSession(null);
    setCurrentUser(null);
    setClub(null);
    setPathfinders([]);
    setPointRecords([]);
    setAuditLogs([]);
    setLeadership([]);
    setCurrentTab('dashboard');
  };

  // Scoring Handler
  const handleScoreSubmit = async (data: {
    pathfinderId: string;
    points: number;
    category: PointCategory;
    activityName: string;
    justification: string;
    activityDate: string;
    approvedBy: string;
    approvedByUserId: string;
  }) => {
    if (!currentUser || !club) return;
    const { record, pathfinder: updatedPf } = await dbService.recordPoints(
      currentUser.clubId,
      data
    );

    // Refresh state
    setPointRecords((prev) => [record, ...prev]);
    setPathfinders((prev) =>
      prev.map((p) => (p.id === updatedPf.id ? updatedPf : p))
    );

    // Update active drawer if open
    if (selectedDrawerPf && selectedDrawerPf.id === updatedPf.id) {
      setSelectedDrawerPf(updatedPf);
    }

    const logs = await dbService.getAuditLogs(currentUser.clubId);
    setAuditLogs(logs);
  };

  // Reversal Handler
  const handleConfirmReversal = async (reason: string) => {
    if (!currentUser || !club || !reversalTargetRecord) return;
    const { record: updatedRecord, pathfinder: updatedPf } =
      await dbService.reversePoints(
        currentUser.clubId,
        reversalTargetRecord.id,
        reason,
        currentUser.fullName,
        currentUser.id
      );

    setPointRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    setPathfinders((prev) =>
      prev.map((p) => (p.id === updatedPf.id ? updatedPf : p))
    );

    if (selectedDrawerPf && selectedDrawerPf.id === updatedPf.id) {
      setSelectedDrawerPf(updatedPf);
    }

    const logs = await dbService.getAuditLogs(currentUser.clubId);
    setAuditLogs(logs);
  };

  // Pathfinder Management Handlers
  const handleSavePathfinder = async (data: {
    fullName: string;
    photoUrl: string;
    unit: string;
    currentClass: string;
    birthDate?: string;
    status?: any;
    notes?: string;
  }) => {
    if (!currentUser || !club) return;

    if (editingPf) {
      const updated = await dbService.updatePathfinder(
        currentUser.clubId,
        editingPf.id,
        data
      );
      setPathfinders((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      if (selectedDrawerPf?.id === updated.id) {
        setSelectedDrawerPf(updated);
      }
    } else {
      const created = await dbService.addPathfinder(currentUser.clubId, data);
      setPathfinders((prev) => [...prev, created]);
    }
  };

  const handleDeletePathfinder = async (id: string, name: string) => {
    if (!currentUser || !club) return;
    const confirm = window.confirm(
      `Deseja realmente remover o desbravador "${name}" do cadastro oficial do clube?`
    );
    if (!confirm) return;

    await dbService.deletePathfinder(currentUser.clubId, id);
    setPathfinders((prev) => prev.filter((p) => p.id !== id));
    if (selectedDrawerPf?.id === id) {
      setSelectedDrawerPf(null);
    }
    const logs = await dbService.getAuditLogs(currentUser.clubId);
    setAuditLogs(logs);
  };

  // Club & Leadership Handlers
  const handleUpdateClub = async (
    updates: Partial<Club> & { settings?: Partial<Club['settings']> }
  ) => {
    if (!currentUser || !club) return;
    const updated = await dbService.updateClub(currentUser.clubId, updates);
    setClub(updated);
  };

  const handleAddLeadershipMember = async (data: {
    fullName: string;
    email: string;
    role: UserRole;
    passwordPlain: string;
  }) => {
    if (!currentUser || !club) return;
    const member = await dbService.addLeadershipMember(currentUser.clubId, data);
    setLeadership((prev) => [...prev, member]);
    const logs = await dbService.getAuditLogs(currentUser.clubId);
    setAuditLogs(logs);
  };

  const handleEditLeadershipMember = async (
    userId: string,
    data: {
      fullName: string;
      email: string;
      role: UserRole;
      passwordPlain?: string;
      avatarUrl?: string;
    }
  ) => {
    if (!currentUser || !club) return;
    const updated = await dbService.updateLeadershipMember(
      currentUser.clubId,
      userId,
      data
    );
    setLeadership((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
    const logs = await dbService.getAuditLogs(currentUser.clubId);
    setAuditLogs(logs);
  };

  const handleDeleteLeadershipMember = async (userId: string) => {
    if (!currentUser || !club) return;
    await dbService.deleteLeadershipMember(
      currentUser.clubId,
      userId,
      currentUser.id
    );
    setLeadership((prev) => prev.filter((m) => m.id !== userId));
    const logs = await dbService.getAuditLogs(currentUser.clubId);
    setAuditLogs(logs);
  };

  const handleUpdateCurrentUserPhoto = async (newPhotoUrl: string) => {
    if (!currentUser || !club) return;
    try {
      const updated = await dbService.updateUserAvatar(
        currentUser.clubId,
        currentUser.id,
        newPhotoUrl
      );
      setCurrentUser(updated);
      setLeadership((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      const logs = await dbService.getAuditLogs(currentUser.clubId);
      setAuditLogs(logs);
    } catch (err: unknown) {
      console.error('Erro ao atualizar foto de perfil:', err);
    }
  };

  const handleRemoveCurrentUserPhoto = async () => {
    if (!currentUser || !club) return;
    try {
      const updated = await dbService.updateUserAvatar(
        currentUser.clubId,
        currentUser.id,
        ''
      );
      setCurrentUser(updated);
      setLeadership((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      const logs = await dbService.getAuditLogs(currentUser.clubId);
      setAuditLogs(logs);
    } catch (err: unknown) {
      console.error('Erro ao remover foto de perfil:', err);
    }
  };

  const handleOpenScoringForMember = (pfId: string) => {
    setScoringPreselectedPfId(pfId);
    setIsScoringModalOpen(true);
  };

  const handleQuickScoreRequirement = (
    title: string,
    category: 'Classes' | 'Especialidades',
    defaultPts: number
  ) => {
    setScoringPreselectedPfId(undefined);
    setIsScoringModalOpen(true);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#031426] flex items-center justify-center text-[#FFC21A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#092642] border-t-[#FFC21A]" />
          <span className="text-xs font-semibold tracking-wider text-slate-300">
            Carregando DesbravaPro...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthView
        onLogin={handleLogin}
        onRegisterClub={handleRegisterClub}
        onRecoverPassword={handleRecoverPassword}
      />
    );
  }

  const clubUnits = club?.settings.unitsList || [
    'Águia Real',
    'Sentinelas',
    'Leões da Colina',
  ];

  return (
    <div className="min-h-screen bg-[#031426] text-[#F3F7FF] flex flex-col font-sans selection:bg-[#FFC21A]/30 selection:text-[#FFC21A]">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        club={club}
        onOpenScoring={() => {
          setScoringPreselectedPfId(undefined);
          setIsScoringModalOpen(true);
        }}
        onLogout={handleLogout}
        onUpdateUserPhoto={handleUpdateCurrentUserPhoto}
        onRemoveUserPhoto={handleRemoveCurrentUserPhoto}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-1">
        {/* Main Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenScoring={() => {
            setScoringPreselectedPfId(undefined);
            setIsScoringModalOpen(true);
          }}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              club={club}
              pathfinders={pathfinders}
              pointRecords={pointRecords}
              ranking={ranking}
              unitStats={unitStats}
              onOpenScoring={() => {
                setScoringPreselectedPfId(undefined);
                setIsScoringModalOpen(true);
              }}
              onOpenNewPathfinder={() => {
                setEditingPf(null);
                setIsPfModalOpen(true);
              }}
              onNavigateToTab={setCurrentTab}
              onSelectPathfinder={(pf) => setSelectedDrawerPf(pf)}
            />
          )}

          {currentTab === 'ranking' && (
            <RankingView
              ranking={ranking}
              unitStats={unitStats}
              clubUnits={clubUnits}
              onSelectPathfinder={(pf) => setSelectedDrawerPf(pf)}
            />
          )}

          {currentTab === 'pathfinders' && (
            <PathfindersView
              pathfinders={pathfinders}
              clubUnits={clubUnits}
              onOpenNew={() => {
                setEditingPf(null);
                setIsPfModalOpen(true);
              }}
              onEdit={(pf) => {
                setEditingPf(pf);
                setIsPfModalOpen(true);
              }}
              onDelete={handleDeletePathfinder}
              onSelect={(pf) => setSelectedDrawerPf(pf)}
              onOpenScoringForMember={handleOpenScoringForMember}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              records={pointRecords}
              auditLogs={auditLogs}
              onOpenReversal={(record) => setReversalTargetRecord(record)}
            />
          )}

          {currentTab === 'curriculum' && (
            <RequirementsView
              pathfinders={pathfinders}
              onQuickScoreRequirement={handleQuickScoreRequirement}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              club={club}
              pathfinders={pathfinders}
              records={pointRecords}
              ranking={ranking}
              unitStats={unitStats}
            />
          )}

          {currentTab === 'settings' && club && (
            <SettingsView
              club={club}
              currentUser={currentUser}
              leadership={leadership}
              onUpdateClub={handleUpdateClub}
              onAddLeadershipMember={handleAddLeadershipMember}
              onEditLeadershipMember={handleEditLeadershipMember}
              onDeleteLeadershipMember={handleDeleteLeadershipMember}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ScoringModal
        isOpen={isScoringModalOpen}
        onClose={() => setIsScoringModalOpen(false)}
        pathfinders={pathfinders}
        currentUser={currentUser}
        initialPathfinderId={scoringPreselectedPfId}
        onSubmit={handleScoreSubmit}
      />

      <PathfinderModal
        isOpen={isPfModalOpen}
        onClose={() => {
          setIsPfModalOpen(false);
          setEditingPf(null);
        }}
        clubUnits={clubUnits}
        editingPf={editingPf}
        onSave={handleSavePathfinder}
      />

      <PathfinderProfileDrawer
        isOpen={Boolean(selectedDrawerPf)}
        onClose={() => setSelectedDrawerPf(null)}
        pathfinder={selectedDrawerPf}
        records={pointRecords}
        rankPosition={
          selectedDrawerPf
            ? ranking.find((r) => r.id === selectedDrawerPf.id)?.rankPosition
            : undefined
        }
        onOpenScoringForMember={handleOpenScoringForMember}
        onUpdatePhoto={async (newPhoto) => {
          if (selectedDrawerPf && club) {
            const updated = await dbService.updatePathfinder(
              club.id,
              selectedDrawerPf.id,
              { photoUrl: newPhoto }
            );
            setPathfinders((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            setSelectedDrawerPf(updated);
          }
        }}
      />

      <ReversalModal
        isOpen={Boolean(reversalTargetRecord)}
        onClose={() => setReversalTargetRecord(null)}
        record={reversalTargetRecord}
        onConfirm={handleConfirmReversal}
      />
    </div>
  );
}
