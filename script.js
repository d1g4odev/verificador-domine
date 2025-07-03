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
        });
        
        setTimeout(() => {
            this.sendInitialMessage();
        }, 1000);
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
            const helpMessage = `⚠️ Aqui apenas verificamos os números para ver se você está seguro ou não.

📱 **Envie somente o número** e iremos te responder!

📋 Formatos aceitos:
• 55 99999-9999
• +55 99999-9999  
• 99999-9999
• (99) 99999-9999

💡 Exemplo: 55 99999-4667`;

            this.addMessage(helpMessage, 'bot');
            return;
        }
        
        for (const number of numbers) {
            await this.verifyNumber(number);
        }
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
        
        if (isOfficial) {
            const officialMessage = `✅ O número **${number}** faz parte da equipe oficial da Domine a Consultoria de Alimentos.

⚠️ **Mesmo assim, só confie em:**
• Mensagens enviadas nos grupos oficiais
• Links enviados por administradores verificados
• Comunicações através dos canais oficiais

🔒 Sempre mantenha a segurança em primeiro lugar!`;

            this.addMessage(officialMessage, 'bot');
            
        } else {
            const warningMessage = `🚨 O número **${number}** NÃO é da equipe oficial da Domine.

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

            this.addMessage(warningMessage, 'bot');
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
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
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