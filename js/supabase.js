// Configuração do Supabase
class SupabaseClient {
    constructor() {
        // URL e chave anônima do Supabase (carregadas do .env.local)
        this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        this.client = null;
        this.initSupabase();
    }

    async initSupabase() {
        try {
            // Carregar Supabase via CDN
            if (typeof window !== 'undefined' && !window.supabase) {
                await this.loadSupabaseScript();
            }
            
            this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseAnonKey);
        } catch (error) {
            console.error('Erro ao inicializar Supabase:', error);
        }
    }

    loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Validação de email
    isValidEmail(email) {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    }

    // Sanitização de dados
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    }

    // Registrar apoiador
    async registrarApoiador(dados) {
        try {
            if (!this.client) {
                console.error('Supabase não inicializado');
                return;
            }

            // Validações no frontend
            const nome = this.sanitizeInput(dados.nome);
            const email = this.sanitizeInput(dados.email).toLowerCase();
            const telefone = this.sanitizeInput(dados.telefone);
            const cidade = this.sanitizeInput(dados.cidade) || 'Cuiabá';
            const estado = this.sanitizeInput(dados.estado) || 'MT';
            const comoConheceu = this.sanitizeInput(dados.comoConheceu);
            const querVoluntario = dados.querVoluntario || false;
            const aceitaComunicacao = dados.aceitaComunicacao !== false;
            const dataCadastro = new Date().toISOString();
            const userAgent = dados.userAgent || navigator.userAgent;
            const ipAddress = dados.ipAddress || null; // Deve ser preenchido no frontend

            if (!nome || nome.length < 2) {
                throw new Error('Nome deve ter pelo menos 2 caracteres');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            // Inserir na tabela 'apoiadores'
            const { data, error } = await this.client.from('apoiadores').insert([
                {
                    nome,
                    email,
                    telefone,
                    cidade,
                    estado,
                    como_conheceu: comoConheceu,
                    quer_voluntario: querVoluntario,
                    aceita_comunicacao: aceitaComunicacao,
                    data_cadastro: dataCadastro,
                    ip_address: ipAddress,
                    user_agent: userAgent
                }
            ]).select();

            if (error) {
                console.error('Erro do Supabase:', error);
                throw new Error('Erro ao registrar apoio. Tente novamente.');
            }

            return { success: true, data };

        } catch (error) {
            console.error('Erro ao registrar apoiador:', error);
            return { success: false, error: error.message };
        }
    }

    // Verificar se email já existe (sem expor dados)
    async verificarEmail(email) {
        try {
            if (!this.client) {
                throw new Error('Cliente Supabase não inicializado');
            }

            const { data, error } = await this.client.rpc('verificar_email_existe', {
                p_email: this.sanitizeInput(email).toLowerCase()
            });

            if (error) {
                console.error('Erro ao verificar email:', error);
                return false;
            }

            return data;
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            return false;
        }
    }
}

// Instância global
window.SupabaseManager = new SupabaseClient();

export default SupabaseClient;
