-- Schema para o banco de dados Supabase
-- Tabela para armazenar apoiadores do movimento

-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-jwt-key';

-- Criar tabela de apoiadores
CREATE TABLE IF NOT EXISTS public.apoiadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cidade VARCHAR(100) DEFAULT 'Cuiabá',
    estado VARCHAR(2) DEFAULT 'MT',
    como_conheceu TEXT,
    quer_voluntario BOOLEAN DEFAULT false,
    aceita_comunicacao BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_apoiadores_email ON public.apoiadores(email);
CREATE INDEX IF NOT EXISTS idx_apoiadores_data_cadastro ON public.apoiadores(data_cadastro);
CREATE INDEX IF NOT EXISTS idx_apoiadores_cidade ON public.apoiadores(cidade);

-- Habilitar RLS
ALTER TABLE public.apoiadores ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (apenas inserção)
CREATE POLICY "Permitir inserção pública" ON public.apoiadores
    FOR INSERT WITH CHECK (true);

-- Política para admin ler dados (será implementada posteriormente)
CREATE POLICY "Admin pode ler" ON public.apoiadores
    FOR SELECT USING (false); -- Por enquanto, ninguém pode ler

-- Função para inserir apoiador com validação
CREATE OR REPLACE FUNCTION public.inserir_apoiador(
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT DEFAULT NULL,
    p_cidade TEXT DEFAULT 'Cuiabá',
    p_estado TEXT DEFAULT 'MT',
    p_como_conheceu TEXT DEFAULT NULL,
    p_quer_voluntario BOOLEAN DEFAULT false,
    p_aceita_comunicacao BOOLEAN DEFAULT true
) RETURNS JSON AS $$
DECLARE
    resultado JSON;
    novo_id UUID;
BEGIN
    -- Validações
    IF LENGTH(TRIM(p_nome)) < 2 THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Nome deve ter pelo menos 2 caracteres');
    END IF;
    
    IF p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Email inválido');
    END IF;
    
    -- Inserir dados
    INSERT INTO public.apoiadores (
        nome, email, telefone, cidade, estado, 
        como_conheceu, quer_voluntario, aceita_comunicacao,
        ip_address, user_agent
    ) VALUES (
        TRIM(p_nome), LOWER(TRIM(p_email)), p_telefone, p_cidade, p_estado,
        p_como_conheceu, p_quer_voluntario, p_aceita_comunicacao,
        INET_CLIENT_ADDR(), current_setting('request.headers', true)::json->>'user-agent'
    ) RETURNING id INTO novo_id;
    
    RETURN JSON_BUILD_OBJECT(
        'success', true, 
        'message', 'Apoio registrado com sucesso!',
        'id', novo_id
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Este email já está cadastrado');
    WHEN OTHERS THEN
        RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Erro interno. Tente novamente.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover permissões diretas na tabela
REVOKE ALL ON public.apoiadores FROM PUBLIC;
REVOKE ALL ON public.apoiadores FROM anon;

-- Permitir apenas execução da função
GRANT EXECUTE ON FUNCTION public.inserir_apoiador TO anon;
GRANT EXECUTE ON FUNCTION public.inserir_apoiador TO authenticated;
