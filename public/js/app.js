class DomineVerificador {
    constructor() {
        this.officialNumbers = [
            '55 9999-4667',
            '55 9927-5228', 
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
❌ NÃO façam nenhum tipo de compra agora, pois não abrimos as inscrições!
📅 Só iremos abrir na **segunda-feira, dia 7**.

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
        
        // Extrai os números
        const numbers = this.extractNumbers(sanitizedMessage);
        
        // Verifica se tem número e se tem DDD válido
        if (numbers.length === 0) {
            this.showInputStatus(false);
            const helpMessage = `⚠️ Por favor, envie o número completo com DDD.

📱 **Exemplos de formato correto:**
• (11) 99999-9999
• (21) 99999-9999
• (51) 99999-9999

❌ **Formatos incorretos:**
• 99999-9999 (sem DDD)
• 999994667 (sem DDD)

⚠️ O DDD é obrigatório para evitar confusão com números iguais de diferentes estados.`;

            this.addMessage(helpMessage, 'bot');
            return;
        }

        // Adiciona a mensagem do usuário com o número formatado
        const formattedNumber = this.formatNumberForDisplay(numbers[0]);
        this.addMessage(formattedNumber, 'user');
        this.messageInput.value = '';
        
        await this.showTyping();
        
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
        // Remove todos os espaços e caracteres especiais, exceto números
        const cleanText = text.replace(/[^\d]/g, '');
        
        // Verifica se tem pelo menos 10 dígitos (DDD + número)
        if (cleanText.length < 10) return [];
        
        return [cleanText];
    }
    
    formatNumberForDisplay(number) {
        // Remove tudo que não for número
        let cleaned = number.replace(/[^\d]/g, '');
        
        // Pega DDD (2 primeiros dígitos) e número
        const ddd = cleaned.substring(0, 2);
        const phoneNumber = cleaned.substring(2);
        
        // Formata como (xx) xxxxx-xxxx
        return `(${ddd}) ${phoneNumber.substring(0, 5)}-${phoneNumber.substring(5)}`;
    }
    
    async verifyNumber(number) {
        const isOfficial = this.isOfficialNumber(number);
        const displayNumber = this.formatNumberForDisplay(number);
        
        // Adicionar ao histórico
        this.addToHistory(displayNumber, isOfficial);
        
        if (isOfficial) {
            const officialMessage = `✅ O número **${displayNumber}** faz parte da equipe oficial da Domine a Consultoria de Alimentos.

⚠️ A Domine solicita pagamentos APENAS pelos números oficiais via WhatsApp, mas SEMPRE pela plataforma HOTMART!`;

            await this.addMessage(officialMessage, 'bot', true);
            
        } else {
            const warningMessage = `🚨 O número **${displayNumber}** NÃO é da equipe oficial da Domine.

🔴 **Só confiem nesses números oficiais:**
• (55) 9999-4667
• (55) 9927-5228
• (54) 9963-1933
• (55) 9968-9527
• (53) 3030-1955

💬 Falar com suporte oficial: **[CLIQUE AQUI](https://wa.me/+555596869527)**

🔒 **Proteja-se:** Se você recebeu pedido de pagamento por um número diferente dos oficiais ou link fora da HOTMART, é golpe! Denuncie e bloqueie o número.`;

            await this.addMessage(warningMessage, 'bot');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    isOfficialNumber(number) {
        // Lista de números oficiais em formato limpo (só números)
        const officialCleanNumbers = [
            '559999-4667',  // 55 9999-4667
            '559927-5228',  // 55 9927-5228
            '549963-1933',  // 54 9963-1933
            '559968-9527',  // 55 9968-9527
            '533030-1955'   // 53 3030-1955
        ].map(num => num.replace(/[^\d]/g, ''));
        
        // Limpa o número recebido
        const cleanNumber = number.replace(/[^\d]/g, '');
        
        // Verifica se é um dos números oficiais
        return officialCleanNumbers.some(official => cleanNumber === official);
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

    hasValidDDD(number) {
        // Remove tudo que não for número
        const cleanNumber = number.replace(/[^\d]/g, '');
        
        // Precisa ter pelo menos 10 dígitos (DDD + número)
        if (cleanNumber.length < 10) return false;
        
        // Pega o DDD (2 primeiros dígitos)
        const ddd = cleanNumber.substring(0, 2);
        
        // DDD precisa ser entre 11 e 99
        const dddNum = parseInt(ddd);
        return dddNum >= 11 && dddNum <= 99;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DomineVerificador();
}); 