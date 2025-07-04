// Gerenciador do formulário de apoio
class FormularioApoio {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.loading = false;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createForm();
            this.bindEvents();
        });
    }

    createForm() {
        const apoiarSection = document.getElementById('apoiar');
        if (!apoiarSection) return;

        const formContainer = document.createElement('div');
        formContainer.className = 'form-container';
        formContainer.innerHTML = `
            <div class="form-wrapper">
                <h3>Registre seu Apoio</h3>
                <p>Preencha os dados abaixo para demonstrar seu apoio ao movimento e receber atualizações:</p>
                
                <form id="apoio-form" class="apoio-form">
                    <div class="form-group">
                        <label for="nome">Nome Completo *</label>
                        <input type="text" id="nome" name="nome" required maxlength="100">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required maxlength="255">
                    </div>
                    
                    <div class="form-group">
                        <label for="telefone">Telefone (WhatsApp)</label>
                        <input type="tel" id="telefone" name="telefone" maxlength="20" placeholder="(65) 99999-9999">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="cidade">Cidade</label>
                            <input type="text" id="cidade" name="cidade" value="Cuiabá" maxlength="100">
                        </div>
                        
                        <div class="form-group">
                            <label for="estado">Estado</label>
                            <select id="estado" name="estado">
                                <option value="MT" selected>Mato Grosso</option>
                                <option value="AC">Acre</option>
                                <option value="AL">Alagoas</option>
                                <option value="AP">Amapá</option>
                                <option value="AM">Amazonas</option>
                                <option value="BA">Bahia</option>
                                <option value="CE">Ceará</option>
                                <option value="DF">Distrito Federal</option>
                                <option value="ES">Espírito Santo</option>
                                <option value="GO">Goiás</option>
                                <option value="MA">Maranhão</option>
                                <option value="MS">Mato Grosso do Sul</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="PA">Pará</option>
                                <option value="PB">Paraíba</option>
                                <option value="PR">Paraná</option>
                                <option value="PE">Pernambuco</option>
                                <option value="PI">Piauí</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="RN">Rio Grande do Norte</option>
                                <option value="RS">Rio Grande do Sul</option>
                                <option value="RO">Rondônia</option>
                                <option value="RR">Roraima</option>
                                <option value="SC">Santa Catarina</option>
                                <option value="SP">São Paulo</option>
                                <option value="SE">Sergipe</option>
                                <option value="TO">Tocantins</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="como-conheceu">Como conheceu o movimento?</label>
                        <select id="como-conheceu" name="como-conheceu">
                            <option value="">Selecione uma opção</option>
                            <option value="redes-sociais">Redes Sociais</option>
                            <option value="amigos-familia">Amigos/Família</option>
                            <option value="midia">Mídia (TV, rádio, jornal)</option>
                            <option value="internet">Pesquisa na Internet</option>
                            <option value="evento">Evento público</option>
                            <option value="universidade">Universidade/Escola</option>
                            <option value="trabalho">Local de trabalho</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="quer-voluntario" name="quer-voluntario">
                            <span class="checkmark"></span>
                            Tenho interesse em ser voluntário(a) do movimento
                        </label>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="aceita-comunicacao" name="aceita-comunicacao" checked>
                            <span class="checkmark"></span>
                            Aceito receber comunicações sobre o movimento (email/WhatsApp)
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn-submit" id="submit-btn">
                            <i class="fas fa-heart"></i>
                            <span class="btn-text">Registrar Apoio</span>
                            <div class="btn-loading" style="display: none;">
                                <i class="fas fa-spinner fa-spin"></i>
                                Enviando...
                            </div>
                        </button>
                    </div>
                    
                    <div class="form-info">
                        <small>
                            <i class="fas fa-shield-alt"></i>
                            Seus dados estão protegidos e serão usados apenas para comunicação sobre o movimento.
                        </small>
                    </div>
                </form>
                
                <div id="form-message" class="form-message" style="display: none;"></div>
            </div>
        `;

        // Inserir o formulário antes dos botões de CTA
        const ctaButtons = apoiarSection.querySelector('.cta-buttons');
        if (ctaButtons) {
            ctaButtons.parentNode.insertBefore(formContainer, ctaButtons);
        }
    }

    bindEvents() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'apoio-form') {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });

        // Máscara para telefone
        document.addEventListener('input', (e) => {
            if (e.target.id === 'telefone') {
                this.formatPhone(e.target);
            }
        });
    }

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            value = value.replace(/(\d{2})(\d{4})/, '($1) $2');
            value = value.replace(/(\d{2})/, '($1) ');
        }
        
        input.value = value;
    }

    async handleSubmit(e) {
        if (this.loading) return;

        this.form = e.target;
        this.submitButton = this.form.querySelector('#submit-btn');
        
        try {
            this.setLoading(true);
            
            const formData = new FormData(this.form);
            const dados = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                cidade: formData.get('cidade'),
                estado: formData.get('estado'),
                comoConheceu: formData.get('como-conheceu'),
                querVoluntario: formData.get('quer-voluntario') === 'on',
                aceitaComunicacao: formData.get('aceita-comunicacao') === 'on',
                userAgent: navigator.userAgent
            };

            // Capturar IP do usuário via API externa
            let ipAddress = null;
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipJson = await ipRes.json();
                ipAddress = ipJson.ip;
            } catch (err) {
                console.warn('Não foi possível obter o IP do usuário:', err);
            }
            dados.ipAddress = ipAddress;

            // Enviar dados para a API Flask no Render
            const response = await fetch('https://cuiaba-busao-gratis.onrender.com/api/registrar_apoio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            const resultado = await response.json();
            
            if (resultado.success) {
                this.showMessage('success', resultado.message || 'Apoio registrado com sucesso!');
                this.form.reset();
                
                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'engagement',
                        event_label: 'apoio_registrado'
                    });
                }
            } else {
                throw new Error(resultado.error || 'Erro ao registrar apoio');
            }

        } catch (error) {
            console.error('Erro no formulário:', error);
            this.showMessage('error', error.message || 'Erro ao registrar apoio. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.loading = loading;
        const btnText = this.submitButton.querySelector('.btn-text');
        const btnLoading = this.submitButton.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            this.submitButton.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            this.submitButton.disabled = false;
        }
    }

    showMessage(type, message) {
        const messageDiv = document.getElementById('form-message');
        messageDiv.className = `form-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        messageDiv.style.display = 'block';
        
        // Scroll suave até a mensagem
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Esconder após alguns segundos se for sucesso
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Inicializar formulário
new FormularioApoio();
