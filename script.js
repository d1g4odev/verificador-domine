class DomineVerificador {
    constructor() {
        this.officialNumbers = [
            '+55 9999-4667',
            '+55 9927-5228', 
            '+54 99632-1933',
            '+55 99686-9527',
            '+53 3030-1955'
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
🚫 Não comprem nada antes disso!`;

        this.addMessage(welcomeMessage, 'bot');
    }
    
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        await this.showTyping();
        
        const numbers = this.extractNumbers(message);
        
        if (numbers.length === 0) {
            const helpMessage = `🤔 Não consegui identificar nenhum número na sua mensagem.

📋 Por favor, envie o número no formato:
• +55 99999-9999
• 55 99999-9999  
• 99999-9999
• (99) 99999-9999

💡 Exemplo: +55 99888-1234`;

            this.addMessage(helpMessage, 'bot');
            return;
        }
        
        for (const number of numbers) {
            await this.verifyNumber(number);
        }
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
• +55 9999-4667
• +55 9927-5228  
• +54 99632-1933
• +55 99686-9527
• +53 3030-1955

⚠️ Se tiver dúvidas, entre em contato apenas pelos números oficiais acima!`;

            this.addMessage(warningMessage, 'bot');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    isOfficialNumber(number) {
        const cleanNumber = number.replace(/[\s()-]/g, '');
        return this.officialNumbers.some(official => {
            const cleanOfficial = official.replace(/[\s()-]/g, '');
            return cleanNumber.includes(cleanOfficial.substring(1)) || 
                   cleanOfficial.includes(cleanNumber) ||
                   cleanNumber === cleanOfficial;
        });
    }
    
    async showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span>Verificando</span>
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
            .replace(/\n/g, '<br>')
            .replace(/•/g, '•')
            .replace(/(✅|❌|🚨|⚠️|🔴|🔒|💡|📱|📋|📅|🚫|👋)/g, '<span style="font-size: 16px;">$1</span>');
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