class DomineVerificador {
    constructor() {
        this.officialNumbers = [
            '55 99999-4667',
            '55 99927-5228', 
            '54 99632-1933',
            '55 99686-9527',
            '53 3030-1955'
        ];
        
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.inputStatus = document.getElementById('inputStatus');
        this.validIcon = this.inputStatus.querySelector('.valid-icon');
        this.invalidIcon = this.inputStatus.querySelector('.invalid-icon');
        
        this.historyToggle = document.getElementById('historyToggle');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        
        // Carregar histórico da sessão
        this.history = JSON.parse(sessionStorage.getItem('numberHistory') || '[]');
        
        // Verificar se está instalado como PWA
        this.isPWA = window.matchMedia('(display-mode: standalone)').matches;
        
        // Registrar para sincronização em background
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('syncVerifications');
            });
        }
        
        // Solicitar permissão para notificações
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        this.init();
    }
    
    init() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });
        
        // Proteção contra colagem de conteúdo malicioso
        this.messageInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const sanitizedText = this.sanitizeInput(pastedText);
            
            // Validar antes de colar
            const securityCheck = this.validateInput(sanitizedText);
            if (securityCheck.isValid) {
                this.messageInput.value = sanitizedText;
            } else {
                this.showInputStatus(false);
                this.addMessage('🚨 **Conteúdo colado rejeitado por segurança!**\n\n⚠️ Cole apenas números de telefone para verificação.', 'bot');
            }
        });
        
        // Filtrar input em tempo real
        this.messageInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const filtered = value.replace(/[<>{}[\]"'`\\|]/g, '');
            if (value !== filtered) {
                e.target.value = filtered;
            }
            
            // Limpar status quando input está vazio
            if (!e.target.value.trim()) {
                this.hideInputStatus();
            }
        });
        
        // Limpar status ao focar no input
        this.messageInput.addEventListener('focus', () => {
            this.hideInputStatus();
        });
        
        // Toggle do histórico
        this.historyToggle.addEventListener('click', () => {
            this.toggleHistory();
        });
        
        // Fechar histórico ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.historyPanel.contains(e.target) && 
                !this.historyToggle.contains(e.target)) {
                this.historyPanel.classList.remove('show');
            }
        });
        
        // Renderizar histórico inicial
        this.renderHistory();
        
        setTimeout(() => {
            this.sendInitialMessage();
        }, 1000);
    }
    
    showInputStatus(isValid) {
        this.inputStatus.className = 'input-status show ' + (isValid ? 'valid' : 'invalid');
        this.validIcon.style.display = isValid ? 'block' : 'none';
        this.invalidIcon.style.display = isValid ? 'none' : 'block';
        
        // Atualizar ARIA para leitores de tela
        const message = isValid ? 
            'Número verificado: oficial da Domine' : 
            'Número verificado: não é oficial da Domine';
            
        this.inputStatus.setAttribute('aria-label', message);
        this.announceToScreenReader(message);
        
        // Adicionar feedback tátil se disponível
        if ('vibrate' in navigator) {
            navigator.vibrate(isValid ? [100] : [100, 100, 100]);
        }
    }
    
    hideInputStatus() {
        this.inputStatus.className = 'input-status';
        this.validIcon.style.display = 'none';
        this.invalidIcon.style.display = 'none';
        this.inputStatus.removeAttribute('aria-label');
    }
    
    toggleHistory() {
        const isExpanded = this.historyPanel.classList.contains('show');
        this.historyPanel.classList.toggle('show');
        this.historyToggle.setAttribute('aria-expanded', !isExpanded);
        
        if (!isExpanded) {
            this.renderHistory();
            // Anunciar para leitores de tela
            this.announceToScreenReader('Histórico de verificações aberto');
        } else {
            this.announceToScreenReader('Histórico de verificações fechado');
        }
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Remover após a leitura
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    addToHistory(number, isOfficial) {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Adicionar no início do array (mais recente primeiro)
        this.history.unshift({
            number,
            isOfficial,
            timestamp,
            date: now.toLocaleDateString('pt-BR')
        });
        
        // Manter apenas últimas 50 verificações
        if (this.history.length > 50) {
            this.history.pop();
        }
        
        // Salvar na sessão
        sessionStorage.setItem('numberHistory', JSON.stringify(this.history));
        
        // Atualizar visualização se painel estiver aberto
        if (this.historyPanel.classList.contains('show')) {
            this.renderHistory();
        }
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">Nenhuma verificação realizada ainda.</div>';
            return;
        }
        
        const html = this.history.map(item => `
            <div class="history-item ${item.isOfficial ? 'official' : 'unofficial'}" 
                 role="button" 
                 tabindex="0"
                 onclick="this.messageInput.value='${item.number}';this.handleSendMessage();">
                <div class="history-item-icon">
                    ${item.isOfficial ? 
                        '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' :
                        '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    }
                </div>
                <span>${item.number}</span>
                <small style="margin-left: auto; opacity: 0.7;">${item.timestamp}</small>
            </div>
        `).join('');
        
        this.historyList.innerHTML = html;
    }
    
    async sendInitialMessage() {
        await this.showTyping();
        
        const welcomeMessage = `👋 Olá! Somos o verificador de números oficiais da Domine a Consultoria de Alimentos.

📱 Envie o número abaixo que você acha suspeito para verificarmos se faz parte da nossa equipe oficial.

⚠️ **ATENÇÃO IMPORTANTE:**
❌ NÃO façam nenhum tipo de compra agora, pois ainda não abrimos os carrinhos!
📅 Só iremos abrir os carrinhos na **segunda-feira, dia 7**.
🚫 Não comprem nada antes disso!

💬 Para falar com nosso suporte oficial: **[CLIQUE AQUI](https://wa.me/+555596869527)**`;

        this.addMessage(welcomeMessage, 'bot');
    }
    
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Validação de segurança
        const securityCheck = this.validateInput(message);
        if (!securityCheck.isValid) {
            this.showInputStatus(false);
            this.addMessage(securityCheck.message, 'bot');
            this.messageInput.value = '';
            return;
        }
        
        // Sanitizar a mensagem
        const sanitizedMessage = this.sanitizeInput(message);
        
        this.addMessage(sanitizedMessage, 'user');
        this.messageInput.value = '';
        
        await this.showTyping();
        
        const numbers = this.extractNumbers(sanitizedMessage);
        
        if (numbers.length === 0) {
            this.showInputStatus(false);
            const helpMessage = `⚠️ Aqui apenas verificamos os números para ver se você está seguro ou não.

📱 **Envie somente o número** e iremos te responder!

📋 Formatos aceitos:
• 55 99999-9999 (DDD + número)
• +55 99999-9999 (também aceito)
• 99999-9999
• (55) 99999-9999

💡 Exemplo: 55 99999-4667`;

            this.addMessage(helpMessage, 'bot');
            return;
        }
        
        let allValid = true;
        for (const number of numbers) {
            const isValid = this.isOfficialNumber(number);
            if (!isValid) allValid = false;
            await this.verifyNumber(number);
        }
        
        this.showInputStatus(allValid);
    }
    
    validateInput(input) {
        // Verificar tamanho máximo
        if (input.length > 100) {
            return {
                isValid: false,
                message: '🚨 **Mensagem muito longa!**\n\n⚠️ Por segurança, envie apenas números de telefone para verificação.'
            };
        }

        // Detectar HTML/scripts maliciosos
        const dangerousPatterns = [
            /<script/i,
            /<\/script>/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /onclick=/i,
            /onmouseover=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /<link/i,
            /<meta/i,
            /data:text\/html/i,
            /eval\(/i,
            /alert\(/i,
            /confirm\(/i,
            /prompt\(/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(input)) {
                return {
                    isValid: false,
                    message: '🚨 **Conteúdo suspeito detectado!**\n\n⚠️ Por segurança, envie apenas números de telefone para verificação.\n\n🔒 Não são permitidos scripts, links ou códigos.'
                };
            }
        }

        // Detectar URLs suspeitas
        const urlPattern = /(https?:\/\/|www\.|\.com|\.br|\.org|\.net|bit\.ly|tinyurl|t\.co)/i;
        if (urlPattern.test(input)) {
            return {
                isValid: false,
                message: '🚨 **Links não são permitidos!**\n\n⚠️ Por segurança, envie apenas números de telefone para verificação.\n\n📱 Para contato oficial use: **[CLIQUE AQUI](https://wa.me/+555596869527)**'
            };
        }

        // Detectar códigos de país não brasileiros
        const foreignCountryPattern = /\+(?!55)[1-9]\d{1,3}/;
        if (foreignCountryPattern.test(input)) {
            return {
                isValid: false,
                message: '🚨 **Código de país não brasileiro detectado!**\n\n⚠️ Este verificador é apenas para números brasileiros.\n\n📱 Envie números do Brasil (DDD + número) para verificação.'
            };
        }

        // Verificar caracteres suspeitos em excesso
        const suspiciousChars = /[<>{}[\]"'`\\|&;$%@]/g;
        const suspiciousCount = (input.match(suspiciousChars) || []).length;
        if (suspiciousCount > 3) {
            return {
                isValid: false,
                message: '🚨 **Caracteres suspeitos detectados!**\n\n⚠️ Por segurança, envie apenas números de telefone para verificação.'
            };
        }

        return { isValid: true };
    }

    sanitizeInput(input) {
        // Remover tags HTML
        let sanitized = input.replace(/<[^>]*>/g, '');
        
        // Escapar caracteres especiais
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        // Remover caracteres de controle
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Limitar tamanho
        sanitized = sanitized.substring(0, 100);
        
        return sanitized.trim();
    }

    extractNumbers(text) {
        const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?\d{2,5}\)?[\s-]?\d{4,5}[\s-]?\d{4}/g;
        const matches = text.match(phoneRegex);
        return matches ? matches.map(num => this.normalizeNumber(num)) : [];
    }
    
    normalizeNumber(number) {
        return number.replace(/[\s()-]/g, '').replace(/^(\+?55)/, '+55 ').replace(/(\d{4})(\d{4})$/, '$1-$2');
    }
    
    async verifyNumber(number) {
        const isOfficial = this.isOfficialNumber(number);
        const displayNumber = this.formatNumberForDisplay(number);
        
        // Adicionar ao histórico
        this.addToHistory(displayNumber, isOfficial);
        
        if (isOfficial) {
            const officialMessage = `✅ O número **${displayNumber}** faz parte da equipe oficial da Domine a Consultoria de Alimentos.

⚠️ **Mesmo assim, só confie em:**
• Mensagens enviadas nos grupos oficiais
• Links enviados por administradores verificados
• Comunicações através dos canais oficiais

🔒 Sempre mantenha a segurança em primeiro lugar!`;

            await this.addMessage(officialMessage, 'bot', true);
            
            // Mensagem extra de segurança após delay
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const securityReminder = `🛡️ **DICAS DE SEGURANÇA:**

❌ Nunca compartilhe:
• Dados pessoais
• Senhas ou códigos
• Fotos de documentos
• Comprovantes bancários

💳 **PAGAMENTOS:**
• SOMENTE pela plataforma HOTMART
• NUNCA faça PIX direto
• NUNCA pague por outros meios
• IGNORE links de checkout externos
• DESCONFIE de outras plataformas

✅ **Boas práticas:**
• Verifique sempre o número antes de interagir
• Não clique em links suspeitos
• Desconfie de promoções muito vantajosas
• Salve os números oficiais na sua agenda

⚠️ **ATENÇÃO:** A Domine solicita pagamentos APENAS pelos números oficiais via WhatsApp, mas SEMPRE pela plataforma HOTMART!`;

            this.addMessage(securityReminder, 'bot');
            
        } else {
            // Limpar número para exibição (remover +55 se existir)
            const displayNumber = this.formatNumberForDisplay(number);
            
            const warningMessage = `🚨 O número **${displayNumber}** NÃO é da equipe oficial da Domine.

❌ **NÃO faça:**
• Não clique em links enviados por este número
• Não faça compras ou pagamentos
• Não mantenha contato com esse número
• Não forneça dados pessoais

🔴 **Só confiem nesses números oficiais:**
• 55 99999-4667
• 55 99927-5228  
• 54 99632-1933
• 55 99686-9527
• 53 3030-1955

⚠️ Se tiver dúvidas, entre em contato apenas pelos números oficiais acima!

💬 Falar com suporte oficial: **[CLIQUE AQUI](https://wa.me/+555596869527)**`;

            await this.addMessage(warningMessage, 'bot');
            
            // Mensagem extra de segurança após delay
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const fraudAlert = `🚨 **ALERTA DE GOLPES:**

⚠️ Fique atento a tentativas comuns de fraude:

❌ **Sinais de golpe:**
• Promoções muito abaixo do mercado
• Pressão para decisão rápida
• Pedidos de PIX ou pagamento direto
• Histórias emotivas ou urgentes
• Links para sites de pagamento

💳 **IMPORTANTE:**
• A Domine usa APENAS a HOTMART
• NÃO aceitamos PIX direto
• NÃO usamos outras plataformas
• NÃO enviamos links de pagamento
• TODOS os pagamentos são pela HOTMART

✅ **Como se proteger:**
• Sempre verifique a fonte
• Não tome decisões por impulso
• Consulte os canais oficiais
• Reporte números suspeitos
• Pague SOMENTE pela HOTMART

🔒 **Proteja-se:** Se recebeu pedido de pagamento fora da HOTMART, é golpe! Denuncie o número.`



            this.addMessage(fraudAlert, 'bot');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    isOfficialNumber(number) {
        const cleanNumber = number.replace(/[\s()-+]/g, '');
        
        return this.officialNumbers.some(official => {
            const cleanOfficial = official.replace(/[\s()-+]/g, '');
            
            // Verificação exata
            if (cleanNumber === cleanOfficial) {
                return true;
            }
            
            // Para números brasileiros (55), verificar com e sem o 9 adicional
            if (cleanOfficial.startsWith('55') && cleanNumber.startsWith('55')) {
                const officialWithout9 = this.removeNinthDigit(cleanOfficial);
                const numberWithout9 = this.removeNinthDigit(cleanNumber);
                const officialWith9 = this.addNinthDigit(cleanOfficial);
                const numberWith9 = this.addNinthDigit(cleanNumber);
                
                return officialWithout9 === numberWithout9 || 
                       cleanOfficial === numberWith9 ||
                       officialWith9 === cleanNumber ||
                       officialWith9 === numberWith9;
            }
            
            // Para outros países, verificação normal
            return cleanNumber.includes(cleanOfficial) || 
                   cleanOfficial.includes(cleanNumber);
        });
    }
    
    removeNinthDigit(number) {
        // Remove o 9 adicional de números brasileiros: 5599999xxxx -> 559999xxxx
        if (number.startsWith('55') && number.length >= 11 && number[2] === '9') {
            return '55' + number.substring(3);
        }
        return number;
    }
    
    addNinthDigit(number) {
        // Adiciona o 9 se não existe: 559999xxxx -> 5599999xxxx  
        if (number.startsWith('55') && number.length >= 10 && number[2] !== '9') {
            return '55' + '9' + number.substring(2);
        }
        return number;
    }
    
    formatNumberForDisplay(number) {
        // Remove +55 para exibição (todos são números brasileiros)
        let cleaned = number.replace(/[\s()-]/g, '');
        
        // Se começar com +55, remover (só aceitar Brasil)
        if (cleaned.startsWith('+55')) {
            cleaned = cleaned.substring(3);
        }
        
        // Garantir que é número brasileiro válido
        if (!cleaned.startsWith('55') && cleaned.length >= 10) {
            cleaned = '55' + cleaned;
        }
        
        // Remover 55 do início para exibição limpa
        if (cleaned.startsWith('55')) {
            cleaned = cleaned.substring(2);
        }
        
        // Formatar para exibição: 99999-4667
        if (cleaned.length === 9) {
            return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
        } else if (cleaned.length === 8) {
            return `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
        }
        
        return cleaned;
    }
    
    async showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span>Digitando</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        typingDiv.remove();
    }
    
    addMessage(text, sender, isVerified = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${isVerified ? 'verified' : ''} ${text.includes('NÃO é da equipe oficial') ? 'warning' : ''}`;
        
        const time = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const formattedText = this.formatMessage(text);
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${formattedText}
                <div class="message-time">${time}</div>
            </div>
        `;
        
        // Adicionar emoji flutuante para números verificados
        if (isVerified) {
            const emojis = ['✅', '🔒', '💫', '🌟'];
            const floatingEmoji = document.createElement('div');
            floatingEmoji.className = 'floating-emoji';
            floatingEmoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            messageDiv.appendChild(floatingEmoji);
            
            // Remover emoji após a animação
            setTimeout(() => floatingEmoji.remove(), 1000);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\*\[(.*?)\]\((.*?)\)\*\*/g, '<a href="$2" target="_blank" style="color: #128C7E; font-weight: bold; text-decoration: underline;">$1</a>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #128C7E; text-decoration: underline;">$1</a>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '•')
            .replace(/(✅|❌|🚨|⚠️|🔴|🔒|💡|📱|📋|📅|🚫|👋|💬)/g, '<span style="font-size: 16px;">$1</span>');
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DomineVerificador();
}); 