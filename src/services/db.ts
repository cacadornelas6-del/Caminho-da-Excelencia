/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  Club,
  Pathfinder,
  PointRecord,
  AuditLog,
  PointCategory,
  UserRole,
} from '../types/index.ts';
import { supabase, isSupabaseConfigured } from './supabaseClient.ts';
import {
  applyPointsTransaction,
  applyReversalTransaction,
} from '../utils/scoring.ts';
import { ASSETS } from '../assets/assets.ts';

// Initial generated visual assets
const CREST_SHIELD = ASSETS.crestShield;
const AVATAR_DIRECTOR = ASSETS.avatarDirector;
const AVATAR_BOY = ASSETS.avatarBoy;
const AVATAR_GIRL = ASSETS.avatarGirl;

interface StoredDatabase {
  clubs: Record<string, Club>;
  users: Record<string, UserProfile & { passwordHash: string }>;
  pathfinders: Record<string, Pathfinder>;
  pointRecords: Record<string, PointRecord>;
  auditLogs: AuditLog[];
}

const STORAGE_KEY = 'desbravapro_db_v1';
const SESSION_KEY = 'desbravapro_session_v1';

// Simple salt + hash simulator using WebCrypto SHA-256 for local mode
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = 'desbravapro_secure_salt_2026';
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getSeedData(): StoredDatabase {
  const defaultClubId = 'club-pioneiros-colina';

  const defaultClub: Club = {
    id: defaultClubId,
    name: 'Clube Pioneiros da Colina',
    region: '5ª Região - Associação Central',
    district: 'Distrito Central',
    church: 'IASD Central',
    motto: 'Pela graça de Deus, serei puro, bondoso e leal!',
    logoUrl: CREST_SHIELD,
    createdAt: '2024-01-01T00:00:00.000Z',
    settings: {
      targetExcellencePoints: 1000,
      tieBreakerRule: 'classes_first',
      categoryWeights: {
        Classes: 100,
        Especialidades: 50,
        Atividades: 30,
        'Serviço comunitário': 50,
        Disciplina: 20,
        Liderança: 40,
        Participação: 15,
        Outros: 10,
      },
      unitsList: [
        'Águia Real',
        'Leões da Colina',
        'Sentinelas da Fé',
        'Estrela da Alvorada',
      ],
    },
  };

  const adminId = 'user-admin-1';
  const directorId = 'user-diretor-1';

  const adminUser = {
    id: adminId,
    email: 'admin@desbravapro.com.br',
    fullName: 'Administrador Geral',
    role: 'admin' as UserRole,
    clubId: defaultClubId,
    clubName: defaultClub.name,
    avatarUrl: AVATAR_DIRECTOR,
    createdAt: '2024-01-01T00:00:00.000Z',
    passwordHash: '',
  };

  const directorUser = {
    id: directorId,
    email: 'diretoria@desbravapro.com.br',
    fullName: 'Pr. Carlos Eduardo Silva',
    role: 'diretor' as UserRole,
    clubId: defaultClubId,
    clubName: defaultClub.name,
    avatarUrl: AVATAR_DIRECTOR,
    createdAt: '2024-01-01T00:00:00.000Z',
    passwordHash: '', // Will be initialized
  };

  const initialPathfinders: Pathfinder[] = [
    {
      id: 'pf-joao-gabriel',
      clubId: defaultClubId,
      fullName: 'João Gabriel Ribeiro',
      photoUrl: AVATAR_BOY,
      unit: 'Sentinelas da Fé',
      birthDate: '2012-05-14',
      registrationDate: '2024-01-15',
      totalPoints: 780,
      progressPercent: 78,
      status: 'destaque',
      currentClass: 'Pesquisador',
      notes: 'Capitão de unidade dedicado e pontual em todas as reuniões.',
      spotlightReason: 'Eleito Desbravador Destaque do Mês por dedicação exemplar na campanha comunitária e excelência no uniforme.',
    },
    {
      id: 'pf-beatriz-santos',
      clubId: defaultClubId,
      fullName: 'Beatriz Vasconcelos',
      photoUrl: AVATAR_GIRL,
      unit: 'Águia Real',
      birthDate: '2011-09-22',
      registrationDate: '2024-01-18',
      totalPoints: 720,
      progressPercent: 72,
      status: 'ativo',
      currentClass: 'Pioneiro',
      notes: 'Concluiu 4 especialidades no trimestre e lidera o canto da unidade.',
    },
    {
      id: 'pf-lucas-oliveira',
      clubId: defaultClubId,
      fullName: 'Lucas Oliveira Costa',
      photoUrl: AVATAR_BOY,
      unit: 'Leões da Colina',
      birthDate: '2013-03-08',
      registrationDate: '2024-02-01',
      totalPoints: 540,
      progressPercent: 54,
      status: 'ativo',
      currentClass: 'Companheiro',
    },
    {
      id: 'pf-larissa-menezes',
      clubId: defaultClubId,
      fullName: 'Larissa Menezes Lima',
      photoUrl: AVATAR_GIRL,
      unit: 'Estrela da Alvorada',
      birthDate: '2014-07-11',
      registrationDate: '2024-02-10',
      totalPoints: 490,
      progressPercent: 49,
      status: 'ativo',
      currentClass: 'Amigo',
    },
    {
      id: 'pf-mateus-rocha',
      clubId: defaultClubId,
      fullName: 'Mateus Rocha Albuquerque',
      photoUrl: AVATAR_BOY,
      unit: 'Leões da Colina',
      birthDate: '2012-11-30',
      registrationDate: '2024-02-15',
      totalPoints: 410,
      progressPercent: 41,
      status: 'ativo',
      currentClass: 'Companheiro',
    },
    {
      id: 'pf-camila-nunes',
      clubId: defaultClubId,
      fullName: 'Camila Duarte Nunes',
      photoUrl: AVATAR_GIRL,
      unit: 'Águia Real',
      birthDate: '2010-04-19',
      registrationDate: '2024-01-20',
      totalPoints: 630,
      progressPercent: 63,
      status: 'ativo',
      currentClass: 'Excursionista',
    },
  ];

  const initialPoints: PointRecord[] = [
    {
      id: 'pt-101',
      clubId: defaultClubId,
      pathfinderId: 'pf-joao-gabriel',
      pathfinderName: 'João Gabriel Ribeiro',
      unit: 'Sentinelas da Fé',
      points: 100,
      category: 'Classes',
      activityName: 'Conclusão Requisitos Classe Pesquisador',
      justification: 'Completou a seção de Descoberta Espiritual e Estudo da Natureza com excelência e apresentação ao clube.',
      activityDate: '2026-10-15',
      approvedBy: 'Pr. Carlos Eduardo Silva',
      approvedByUserId: directorId,
      createdAt: '2026-10-15T14:30:00.000Z',
      isReversed: false,
    },
    {
      id: 'pt-102',
      clubId: defaultClubId,
      pathfinderId: 'pf-joao-gabriel',
      pathfinderName: 'João Gabriel Ribeiro',
      unit: 'Sentinelas da Fé',
      points: 50,
      category: 'Serviço comunitário',
      activityName: 'Campanha de Arrecadação de Alimentos',
      justification: 'Participou ativamente da organização e execução da campanha no bairro, demonstrando espírito de equipe e dedicação no serviço ao próximo.',
      activityDate: '2026-10-20',
      approvedBy: 'Pr. Carlos Eduardo Silva',
      approvedByUserId: directorId,
      createdAt: '2026-10-20T17:00:00.000Z',
      isReversed: false,
    },
    {
      id: 'pt-103',
      clubId: defaultClubId,
      pathfinderId: 'pf-beatriz-santos',
      pathfinderName: 'Beatriz Vasconcelos',
      unit: 'Águia Real',
      points: 80,
      category: 'Especialidades',
      activityName: 'Especialidade de Primeiros Socorros - Básico',
      justification: 'Avaliação prática aprovada com nota 10, demonstrando imobilizações e técnicas de transporte com precisão.',
      activityDate: '2026-10-18',
      approvedBy: 'Pr. Carlos Eduardo Silva',
      approvedByUserId: directorId,
      createdAt: '2026-10-18T16:15:00.000Z',
      isReversed: false,
    },
    {
      id: 'pt-104',
      clubId: defaultClubId,
      pathfinderId: 'pf-lucas-oliveira',
      pathfinderName: 'Lucas Oliveira Costa',
      unit: 'Leões da Colina',
      points: 40,
      category: 'Disciplina',
      activityName: 'Inspeção de Uniforme de Gala',
      justification: 'Uniforme completo e impecável em três reuniões consecutivas, com lenço bem alinhado e emblemas corretos.',
      activityDate: '2026-10-22',
      approvedBy: 'Pr. Carlos Eduardo Silva',
      approvedByUserId: directorId,
      createdAt: '2026-10-22T11:00:00.000Z',
      isReversed: false,
    },
  ];

  const initialAudits: AuditLog[] = [
    {
      id: 'aud-01',
      clubId: defaultClubId,
      userId: directorId,
      userName: 'Pr. Carlos Eduardo Silva',
      action: 'LOGIN',
      details: 'Sessão iniciada no DesbravaPro',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'aud-02',
      clubId: defaultClubId,
      userId: directorId,
      userName: 'Pr. Carlos Eduardo Silva',
      action: 'APROVACAO_PONTOS',
      details: 'Lançamento de 50 pontos para João Gabriel Ribeiro (Serviço comunitário)',
      timestamp: '2026-10-20T17:00:00.000Z',
    },
  ];

  const db: StoredDatabase = {
    clubs: { [defaultClubId]: defaultClub },
    users: {
      [adminId]: adminUser,
      [directorId]: directorUser,
    },
    pathfinders: {},
    pointRecords: {},
    auditLogs: initialAudits,
  };

  for (const pf of initialPathfinders) {
    db.pathfinders[pf.id] = pf;
  }
  for (const pt of initialPoints) {
    db.pointRecords[pt.id] = pt;
  }

  return db;
}

class DatabaseService {
  private cache: StoredDatabase | null = null;

  private async loadDb(): Promise<StoredDatabase> {
    if (this.cache) return this.cache;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getSeedData();
      initial.users['user-admin-1'].passwordHash = await hashPassword('admin123');
      initial.users['user-diretor-1'].passwordHash = await hashPassword('desbrava123');
      this.saveDb(initial);
      this.cache = initial;
      return initial;
    }

    try {
      this.cache = JSON.parse(raw);
      // Ensure admin exists even if database was initialized in previous version
      if (this.cache && !this.cache.users['user-admin-1']) {
        const hashedAdmin = await hashPassword('admin123');
        this.cache.users['user-admin-1'] = {
          id: 'user-admin-1',
          email: 'admin@desbravapro.com.br',
          fullName: 'Administrador Geral',
          role: 'admin' as UserRole,
          clubId: 'club-pioneiros-colina',
          clubName: 'Clube Pioneiros da Colina',
          avatarUrl: AVATAR_DIRECTOR,
          createdAt: '2024-01-01T00:00:00.000Z',
          passwordHash: hashedAdmin,
        };
        this.saveDb(this.cache);
      }
      return this.cache!;
    } catch {
      const initial = getSeedData();
      initial.users['user-admin-1'].passwordHash = await hashPassword('admin123');
      initial.users['user-diretor-1'].passwordHash = await hashPassword('desbrava123');
      this.saveDb(initial);
      this.cache = initial;
      return initial;
    }
  }

  private saveDb(db: StoredDatabase) {
    this.cache = db;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  // Session management
  getSession(): UserProfile | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setSession(user: UserProfile | null) {
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  }

  // Authentication: Login
  async login(email: string, passwordPlain: string): Promise<UserProfile> {
    const db = await this.loadDb();
    const cleanEmail = email.toLowerCase().trim();

    // Check Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: passwordPlain,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            clubId: profile.club_id,
            clubName: profile.club_name || 'Clube de Desbravadores',
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
          };
          this.setSession(userProfile);
          return userProfile;
        }
      }
    }

    // Local authentication fallback
    const expectedHash = await hashPassword(passwordPlain);
    const userEntry = Object.values(db.users).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!userEntry || userEntry.passwordHash !== expectedHash) {
      throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
    }

    const club = db.clubs[userEntry.clubId];
    const sessionUser: UserProfile = {
      id: userEntry.id,
      email: userEntry.email,
      fullName: userEntry.fullName,
      role: userEntry.role,
      clubId: userEntry.clubId,
      clubName: club?.name || 'Clube de Desbravadores',
      avatarUrl: userEntry.avatarUrl,
      createdAt: userEntry.createdAt,
    };

    this.setSession(sessionUser);

    // Audit login
    await this.addAuditLog(sessionUser.clubId, {
      userId: sessionUser.id,
      userName: sessionUser.fullName,
      action: 'LOGIN',
      details: 'Sessão iniciada com sucesso.',
    });

    return sessionUser;
  }

  // Authentication: Register new Club & Director
  async registerClub(data: {
    clubName: string;
    region: string;
    district: string;
    church: string;
    motto?: string;
    directorName: string;
    directorEmail: string;
    passwordPlain: string;
  }): Promise<UserProfile> {
    const db = await this.loadDb();
    const cleanEmail = data.directorEmail.toLowerCase().trim();

    // Check duplicate email
    const exists = Object.values(db.users).some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    const clubId = 'club-' + Date.now();
    const userId = 'usr-' + Date.now();

    const newClub: Club = {
      id: clubId,
      name: data.clubName.trim(),
      region: data.region.trim(),
      district: data.district.trim(),
      church: data.church.trim(),
      motto: data.motto?.trim() || 'O amor de Cristo me motiva!',
      logoUrl: CREST_SHIELD,
      createdAt: new Date().toISOString(),
      settings: {
        targetExcellencePoints: 1000,
        tieBreakerRule: 'classes_first',
        categoryWeights: {
          Classes: 100,
          Especialidades: 50,
          Atividades: 30,
          'Serviço comunitário': 50,
          Disciplina: 20,
          Liderança: 40,
          Participação: 15,
          Outros: 10,
        },
        unitsList: ['Águia Real', 'Guerreiros da Fé', 'Sentinelas'],
      },
    };

    const passwordHash = await hashPassword(data.passwordPlain);

    const newUser = {
      id: userId,
      email: cleanEmail,
      fullName: data.directorName.trim(),
      role: 'diretor' as UserRole,
      clubId: clubId,
      clubName: newClub.name,
      avatarUrl: AVATAR_DIRECTOR,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.clubs[clubId] = newClub;
    db.users[userId] = newUser;
    this.saveDb(db);

    const sessionUser: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      clubId: newUser.clubId,
      clubName: newUser.clubName,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
    };

    this.setSession(sessionUser);

    await this.addAuditLog(clubId, {
      userId,
      userName: sessionUser.fullName,
      action: 'CADASTRO_CLUBE',
      details: `Novo clube "${newClub.name}" registrado por ${sessionUser.fullName}.`,
    });

    return sessionUser;
  }

  // Password Recovery Simulator
  async recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
    const db = await this.loadDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = Object.values(db.users).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      // Security best practice: don't reveal if email exists
      return {
        success: true,
        message: 'Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas.',
      };
    }

    return {
      success: true,
      message: 'Instruções de redefinição de senha enviadas com sucesso para ' + cleanEmail + '.',
    };
  }

  // Club Information
  async getClub(clubId: string): Promise<Club | null> {
    const db = await this.loadDb();
    return db.clubs[clubId] || null;
  }

  async updateClub(
    clubId: string,
    updates: Partial<Club> & { settings?: Partial<Club['settings']> }
  ): Promise<Club> {
    const db = await this.loadDb();
    const current = db.clubs[clubId];
    if (!current) throw new Error('Clube não encontrado.');

    const updated: Club = {
      ...current,
      ...updates,
      settings: {
        ...current.settings,
        ...(updates.settings || {}),
      },
    };

    db.clubs[clubId] = updated;
    this.saveDb(db);
    return updated;
  }

  // Pathfinders (Desbravadores)
  async getPathfinders(clubId: string): Promise<Pathfinder[]> {
    const db = await this.loadDb();
    return Object.values(db.pathfinders).filter((p) => p.clubId === clubId);
  }

  async addPathfinder(
    clubId: string,
    data: {
      fullName: string;
      photoUrl?: string;
      unit: string;
      birthDate?: string;
      currentClass: string;
      notes?: string;
    }
  ): Promise<Pathfinder> {
    const db = await this.loadDb();
    const id = 'pf-' + Date.now();

    const newPf: Pathfinder = {
      id,
      clubId,
      fullName: data.fullName.trim(),
      photoUrl: data.photoUrl || AVATAR_BOY,
      unit: data.unit,
      birthDate: data.birthDate,
      registrationDate: new Date().toISOString().split('T')[0],
      totalPoints: 0,
      progressPercent: 0,
      status: 'ativo',
      currentClass: data.currentClass || 'Amigo',
      notes: data.notes?.trim(),
    };

    db.pathfinders[id] = newPf;
    this.saveDb(db);

    const session = this.getSession();
    await this.addAuditLog(clubId, {
      userId: session?.id || 'system',
      userName: session?.fullName || 'Direção',
      action: 'NOVO_DESBRAVADOR',
      details: `Desbravador ${newPf.fullName} cadastrado na unidade ${newPf.unit}.`,
    });

    return newPf;
  }

  async updatePathfinder(
    clubId: string,
    id: string,
    updates: Partial<Pathfinder>
  ): Promise<Pathfinder> {
    const db = await this.loadDb();
    const current = db.pathfinders[id];
    if (!current || current.clubId !== clubId) {
      throw new Error('Desbravador não encontrado.');
    }

    const updated: Pathfinder = {
      ...current,
      ...updates,
    };

    db.pathfinders[id] = updated;
    this.saveDb(db);
    return updated;
  }

  async deletePathfinder(clubId: string, id: string): Promise<void> {
    const db = await this.loadDb();
    const current = db.pathfinders[id];
    if (!current || current.clubId !== clubId) {
      throw new Error('Desbravador não encontrado.');
    }

    delete db.pathfinders[id];
    this.saveDb(db);

    const session = this.getSession();
    await this.addAuditLog(clubId, {
      userId: session?.id || 'system',
      userName: session?.fullName || 'Direção',
      action: 'EXCLUSAO_DESBRAVADOR',
      details: `Desbravador ${current.fullName} removido do sistema.`,
    });
  }

  // Points Records
  async getPointRecords(clubId: string): Promise<PointRecord[]> {
    const db = await this.loadDb();
    return Object.values(db.pointRecords)
      .filter((r) => r.clubId === clubId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  // Atomically record and approve points
  async recordPoints(
    clubId: string,
    input: {
      pathfinderId: string;
      points: number;
      category: PointCategory;
      activityName: string;
      justification: string;
      activityDate: string;
      approvedBy: string;
      approvedByUserId: string;
    }
  ): Promise<{ record: PointRecord; pathfinder: Pathfinder }> {
    if (input.points <= 0) {
      throw new Error('A quantidade de pontos deve ser maior que zero.');
    }
    if (!input.justification || input.justification.trim().length < 5) {
      throw new Error('Por favor, forneça uma justificativa detalhada para a pontuação.');
    }

    const db = await this.loadDb();
    const pf = db.pathfinders[input.pathfinderId];
    if (!pf || pf.clubId !== clubId) {
      throw new Error('Participante não encontrado neste clube.');
    }

    const club = db.clubs[clubId];
    const targetPoints = club?.settings?.targetExcellencePoints || 1000;

    const id = 'pt-' + Date.now();
    const newRecord: PointRecord = {
      id,
      clubId,
      pathfinderId: pf.id,
      pathfinderName: pf.fullName,
      unit: pf.unit,
      points: Number(input.points),
      category: input.category,
      activityName: input.activityName.trim(),
      justification: input.justification.trim(),
      activityDate: input.activityDate || new Date().toISOString().split('T')[0],
      approvedBy: input.approvedBy,
      approvedByUserId: input.approvedByUserId,
      createdAt: new Date().toISOString(),
      isReversed: false,
    };

    // Update pathfinder atomically
    const updatedPf = applyPointsTransaction(pf, newRecord.points, targetPoints);

    db.pointRecords[id] = newRecord;
    db.pathfinders[pf.id] = updatedPf;
    this.saveDb(db);

    // Audit log
    await this.addAuditLog(clubId, {
      userId: input.approvedByUserId,
      userName: input.approvedBy,
      action: 'APROVACAO_PONTOS',
      details: `Lançados ${newRecord.points} pts para ${pf.fullName} (${newRecord.category}: ${newRecord.activityName}).`,
    });

    return { record: newRecord, pathfinder: updatedPf };
  }

  // Reverse / Estornar Pontuação with mandatory justification
  async reversePoints(
    clubId: string,
    recordId: string,
    reversalReason: string,
    reversedBy: string,
    reversedByUserId: string
  ): Promise<{ record: PointRecord; pathfinder: Pathfinder }> {
    if (!reversalReason || reversalReason.trim().length < 8) {
      throw new Error('A justificativa do estorno é obrigatória e deve ter no mínimo 8 caracteres.');
    }

    const db = await this.loadDb();
    const record = db.pointRecords[recordId];
    if (!record || record.clubId !== clubId) {
      throw new Error('Registro de pontuação não encontrado.');
    }

    if (record.isReversed) {
      throw new Error('Esta pontuação já foi estornada anteriormente.');
    }

    const pf = db.pathfinders[record.pathfinderId];
    if (!pf || pf.clubId !== clubId) {
      throw new Error('Participante associado não encontrado.');
    }

    const club = db.clubs[clubId];
    const targetPoints = club?.settings?.targetExcellencePoints || 1000;

    // Mark as reversed
    const updatedRecord: PointRecord = {
      ...record,
      isReversed: true,
      reversedAt: new Date().toISOString(),
      reversedBy,
      reversalReason: reversalReason.trim(),
    };

    // Deduct points atomically
    const updatedPf = applyReversalTransaction(pf, record.points, targetPoints);

    db.pointRecords[recordId] = updatedRecord;
    db.pathfinders[pf.id] = updatedPf;
    this.saveDb(db);

    await this.addAuditLog(clubId, {
      userId: reversedByUserId,
      userName: reversedBy,
      action: 'ESTORNO_PONTUACAO',
      details: `Estornados ${record.points} pts de ${pf.fullName} (Ref: ${record.activityName}). Motivo: "${reversalReason.trim()}"`,
    });

    return { record: updatedRecord, pathfinder: updatedPf };
  }

  // Audit Logs
  async getAuditLogs(clubId: string): Promise<AuditLog[]> {
    const db = await this.loadDb();
    return db.auditLogs
      .filter((a) => a.clubId === clubId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  async addAuditLog(
    clubId: string,
    data: {
      userId: string;
      userName: string;
      action: string;
      details: string;
    }
  ): Promise<AuditLog> {
    const db = await this.loadDb();
    const entry: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      clubId,
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      details: data.details,
      timestamp: new Date().toISOString(),
    };

    db.auditLogs.unshift(entry);
    // Keep max 200 logs
    if (db.auditLogs.length > 200) {
      db.auditLogs = db.auditLogs.slice(0, 200);
    }
    this.saveDb(db);
    return entry;
  }

  // Leadership Team Members
  async getLeadershipMembers(clubId: string): Promise<UserProfile[]> {
    const db = await this.loadDb();
    return Object.values(db.users)
      .filter((u) => u.clubId === clubId)
      .map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        clubId: u.clubId,
        clubName: u.clubName,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
      }));
  }

  async addLeadershipMember(
    clubId: string,
    data: {
      fullName: string;
      email: string;
      role: UserRole;
      passwordPlain: string;
    }
  ): Promise<UserProfile> {
    const db = await this.loadDb();
    const cleanEmail = data.email.toLowerCase().trim();

    if (Object.values(db.users).some((u) => u.email === cleanEmail)) {
      throw new Error('E-mail já cadastrado no sistema.');
    }

    const club = db.clubs[clubId];
    const id = 'usr-' + Date.now();
    const passwordHash = await hashPassword(data.passwordPlain);

    const newUser = {
      id,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      role: data.role,
      clubId,
      clubName: club?.name || 'Clube de Desbravadores',
      avatarUrl: AVATAR_DIRECTOR,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.users[id] = newUser;
    this.saveDb(db);

    const session = this.getSession();
    await this.addAuditLog(clubId, {
      userId: session?.id || 'system',
      userName: session?.fullName || 'Direção',
      action: 'NOVO_MEMBRO_DIRECAO',
      details: `${newUser.fullName} adicionado à liderança como ${newUser.role}.`,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      clubId: newUser.clubId,
      clubName: newUser.clubName,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
    };
  }

  async updateLeadershipMember(
    clubId: string,
    userId: string,
    updates: {
      fullName?: string;
      email?: string;
      role?: UserRole;
      passwordPlain?: string;
      avatarUrl?: string;
    }
  ): Promise<UserProfile> {
    const db = await this.loadDb();
    const user = db.users[userId];
    if (!user || user.clubId !== clubId) {
      throw new Error('Usuário não encontrado neste clube.');
    }

    if (updates.email && updates.email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const cleanEmail = updates.email.toLowerCase().trim();
      const emailExists = Object.values(db.users).some(
        (u) => u.id !== userId && u.email.toLowerCase() === cleanEmail
      );
      if (emailExists) {
        throw new Error('Já existe outro usuário cadastrado com este e-mail.');
      }
      user.email = cleanEmail;
    }

    if (updates.fullName && updates.fullName.trim()) {
      user.fullName = updates.fullName.trim();
    }

    if (updates.role) {
      user.role = updates.role;
    }

    if (updates.avatarUrl !== undefined) {
      user.avatarUrl = updates.avatarUrl;
    }

    if (updates.passwordPlain && updates.passwordPlain.trim()) {
      if (updates.passwordPlain.trim().length < 6) {
        throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
      }
      user.passwordHash = await hashPassword(updates.passwordPlain.trim());
    }

    db.users[userId] = user;
    this.saveDb(db);

    // If active session belongs to this user, update session object
    const session = this.getSession();
    if (session && session.id === userId) {
      session.fullName = user.fullName;
      session.email = user.email;
      session.role = user.role;
      if (user.avatarUrl !== undefined) {
        session.avatarUrl = user.avatarUrl;
      }
      this.setSession(session);
    }

    await this.addAuditLog(clubId, {
      userId: session?.id || 'system',
      userName: session?.fullName || 'Admin',
      action: 'EDICAO_USUARIO',
      details: `Usuário ${user.fullName} (${user.email}) atualizado.`,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      clubId: user.clubId,
      clubName: user.clubName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  async updateUserAvatar(
    clubId: string,
    userId: string,
    avatarUrl: string
  ): Promise<UserProfile> {
    return this.updateLeadershipMember(clubId, userId, { avatarUrl });
  }

  async deleteLeadershipMember(
    clubId: string,
    userId: string,
    currentUserId: string
  ): Promise<void> {
    const db = await this.loadDb();
    const user = db.users[userId];
    if (!user || user.clubId !== clubId) {
      throw new Error('Usuário não encontrado neste clube.');
    }

    if (userId === currentUserId) {
      throw new Error('Não é permitido remover a sua própria conta de acesso.');
    }

    const totalAdminsOrDirectors = Object.values(db.users).filter(
      (u) => u.clubId === clubId && (u.role === 'admin' || u.role === 'diretor')
    ).length;

    if ((user.role === 'admin' || user.role === 'diretor') && totalAdminsOrDirectors <= 1) {
      throw new Error('O clube precisa manter pelo menos um Administrador ou Diretor ativo.');
    }

    const deletedName = user.fullName;
    const deletedRole = user.role;
    delete db.users[userId];
    this.saveDb(db);

    const session = this.getSession();
    await this.addAuditLog(clubId, {
      userId: currentUserId,
      userName: session?.fullName || 'Admin',
      action: 'EXCLUSAO_USUARIO',
      details: `Usuário ${deletedName} (cargo: ${deletedRole}) removido do sistema.`,
    });
  }
}

export const dbService = new DatabaseService();
