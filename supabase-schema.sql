-- ==============================================================================
-- DESBRAVAPRO — ESQUEMA COMPLETO DE BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Inclui Tabelas, Relacionamentos, Índices, Triggers e Políticas RLS (Row Level Security)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE CLUBES
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    district VARCHAR(100),
    church VARCHAR(255),
    motto VARCHAR(255),
    logo_url TEXT,
    target_excellence_points INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE PERFIS DE USUÁRIOS (DIREÇÃO DO CLUBE)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'conselheiro' CHECK (role IN ('diretor', 'diretor_associado', 'secretario', 'conselheiro', 'instrutor')),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE PARTICIPANTES (DESBRAVADORES)
CREATE TABLE IF NOT EXISTS public.pathfinders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    unit VARCHAR(100) NOT NULL,
    birth_date DATE,
    registration_date DATE DEFAULT CURRENT_DATE NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    progress_percent INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'destaque', 'observacao', 'graduado')),
    current_class VARCHAR(100) DEFAULT 'Amigo',
    notes TEXT,
    spotlight_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE LANÇAMENTOS DE PONTUAÇÃO (COM SUPORTE A ESTORNO)
CREATE TABLE IF NOT EXISTS public.point_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    pathfinder_id UUID NOT NULL REFERENCES public.pathfinders(id) ON DELETE CASCADE,
    pathfinder_name VARCHAR(255) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Classes', 'Especialidades', 'Atividades', 'Serviço comunitário',
        'Disciplina', 'Liderança', 'Participação', 'Outros'
    )),
    activity_name VARCHAR(255) NOT NULL,
    justification TEXT NOT NULL,
    activity_date DATE DEFAULT CURRENT_DATE NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    approved_by_user_id UUID REFERENCES auth.users(id),
    is_reversed BOOLEAN DEFAULT FALSE NOT NULL,
    reversed_at TIMESTAMP WITH TIME ZONE,
    reversed_by VARCHAR(255),
    reversal_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE REQUISITOS E ESPECIALIDADES
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    pathfinder_id UUID NOT NULL REFERENCES public.pathfinders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('classe', 'especialidade')),
    category VARCHAR(100),
    code_or_name VARCHAR(255) NOT NULL,
    completed_date DATE DEFAULT CURRENT_DATE NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    points_awarded INTEGER DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ÍNDICES DE DESEMPENHO
CREATE INDEX IF NOT EXISTS idx_pathfinders_club_id ON public.pathfinders(club_id);
CREATE INDEX IF NOT EXISTS idx_pathfinders_points ON public.pathfinders(club_id, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_records_club_id ON public.point_records(club_id);
CREATE INDEX IF NOT EXISTS idx_point_records_pathfinder ON public.point_records(pathfinder_id);
CREATE INDEX IF NOT EXISTS idx_point_records_category ON public.point_records(club_id, category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_club_id ON public.audit_logs(club_id);

-- 9. FUNÇÃO E TRIGGER PARA RECALCULAR PONTUAÇÃO AUTOMATICAMENTE NO BANCO
CREATE OR REPLACE FUNCTION public.recalculate_pathfinder_points()
RETURNS TRIGGER AS $$
DECLARE
    target_pts INTEGER;
    calc_total INTEGER;
    new_pct INTEGER;
BEGIN
    -- Busca a pontuação total ativa (não estornada) do participante
    SELECT COALESCE(SUM(points), 0)
    INTO calc_total
    FROM public.point_records
    WHERE pathfinder_id = COALESCE(NEW.pathfinder_id, OLD.pathfinder_id)
      AND is_reversed = FALSE;

    -- Busca meta de excelência do clube
    SELECT target_excellence_points
    INTO target_pts
    FROM public.clubs
    WHERE id = (SELECT club_id FROM public.pathfinders WHERE id = COALESCE(NEW.pathfinder_id, OLD.pathfinder_id));

    IF target_pts IS NULL OR target_pts <= 0 THEN
        target_pts := 1000;
    END IF;

    new_pct := LEAST(100, GREATEST(0, ROUND((calc_total::numeric / target_pts::numeric) * 100)));

    -- Atualiza o participante
    UPDATE public.pathfinders
    SET total_points = calc_total,
        progress_percent = new_pct,
        updated_at = timezone('utc'::text, now())
    WHERE id = COALESCE(NEW.pathfinder_id, OLD.pathfinder_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_pathfinder_points ON public.point_records;
CREATE TRIGGER trigger_update_pathfinder_points
AFTER INSERT OR UPDATE OF points, is_reversed ON public.point_records
FOR EACH ROW EXECUTE FUNCTION public.recalculate_pathfinder_points();

-- 10. SEGURANÇA E ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pathfinders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- FUNÇÃO AUXILIAR PARA RECUPERAR O CLUB_ID DO USUÁRIO ATUAL
CREATE OR REPLACE FUNCTION public.get_auth_club_id()
RETURNS UUID AS $$
    SELECT club_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- POLÍTICAS RLS PARA CLUBES
CREATE POLICY "Usuários podem ver seu próprio clube"
    ON public.clubs FOR SELECT
    USING (id = public.get_auth_club_id());

CREATE POLICY "Diretores podem atualizar seu clube"
    ON public.clubs FOR UPDATE
    USING (id = public.get_auth_club_id() AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'diretor_associado')
    ));

-- POLÍTICAS RLS PARA PERFIS
CREATE POLICY "Usuários podem ver perfis do mesmo clube"
    ON public.profiles FOR SELECT
    USING (club_id = public.get_auth_club_id());

CREATE POLICY "Usuários podem editar seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- POLÍTICAS RLS PARA DESBRAVADORES
CREATE POLICY "Membros da direção podem ver desbravadores do seu clube"
    ON public.pathfinders FOR SELECT
    USING (club_id = public.get_auth_club_id());

CREATE POLICY "Membros da direção podem gerenciar desbravadores do seu clube"
    ON public.pathfinders FOR ALL
    USING (club_id = public.get_auth_club_id())
    WITH CHECK (club_id = public.get_auth_club_id());

-- POLÍTICAS RLS PARA PONTUAÇÕES
CREATE POLICY "Membros podem ver pontuações do clube"
    ON public.point_records FOR SELECT
    USING (club_id = public.get_auth_club_id());

CREATE POLICY "Membros autorizados podem registrar pontuações"
    ON public.point_records FOR INSERT
    WITH CHECK (club_id = public.get_auth_club_id());

CREATE POLICY "Apenas diretores e secretários podem estornar pontuações"
    ON public.point_records FOR UPDATE
    USING (club_id = public.get_auth_club_id() AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'diretor_associado', 'secretario')
    ));

-- 11. BUCKET DE ARMAZENAMENTO PARA FOTOS DE PERFIL (SUPABASE STORAGE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pathfinder-photos', 'pathfinder-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Imagens de desbravadores são visíveis publicamente"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'pathfinder-photos');

CREATE POLICY "Membros autenticados podem enviar fotos para o bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'pathfinder-photos' AND auth.role() = 'authenticated');
