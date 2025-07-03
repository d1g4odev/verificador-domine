# 🔒 Segurança do Verificador de Números Domine

Este documento descreve todas as medidas de segurança implementadas para proteger o chatbot contra ataques maliciosos.

## 🛡️ Proteções Implementadas

### **1. Validação de Input**
- ✅ **Limite de caracteres:** Máximo 100 caracteres por mensagem
- ✅ **Detecção de scripts:** Bloqueia JavaScript, VBScript e código malicioso
- ✅ **Filtro de HTML:** Remove todas as tags HTML perigosas
- ✅ **Bloqueio de URLs:** Impede envio de links suspeitos
- ✅ **Caracteres suspeitos:** Limita símbolos que podem ser usados em ataques

### **2. Sanitização de Dados**
- ✅ **Escape HTML:** Converte caracteres especiais em entidades seguras
- ✅ **Remoção de tags:** Elimina qualquer código HTML/XML
- ✅ **Caracteres de controle:** Remove caracteres invisíveis perigosos
- ✅ **Normalização:** Padroniza formato de dados antes do processamento

### **3. Proteções no Frontend**
- ✅ **Filtro em tempo real:** Bloqueia caracteres perigosos durante digitação
- ✅ **Proteção contra colagem:** Valida conteúdo colado antes de aceitar
- ✅ **Desabilitação de recursos:** Autocomplete e spellcheck desativados
- ✅ **Limite de input:** Campo limitado a 100 caracteres

### **4. Headers de Segurança HTTP**
- ✅ **X-Content-Type-Options:** Previne MIME sniffing
- ✅ **X-Frame-Options:** Bloqueia incorporação em iframes
- ✅ **X-XSS-Protection:** Ativa proteção contra XSS no browser
- ✅ **Content-Security-Policy:** Política rigorosa de conteúdo
- ✅ **Strict-Transport-Security:** Força HTTPS
- ✅ **Referrer-Policy:** Controla informações de referência
- ✅ **Permissions-Policy:** Bloqueia APIs perigosas

### **5. Content Security Policy (CSP)**
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://wa.me;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

## 🚨 Tipos de Ataques Bloqueados

### **Cross-Site Scripting (XSS)**
- ❌ `<script>alert('xss')</script>`
- ❌ `javascript:alert('xss')`
- ❌ `<img src=x onerror=alert('xss')>`

### **HTML Injection**
- ❌ `<iframe src="malicious.com">`
- ❌ `<object data="malware.swf">`
- ❌ `<embed src="virus.exe">`

### **URLs Maliciosas**
- ❌ `https://malicious-site.com`
- ❌ `bit.ly/suspicious`
- ❌ `www.phishing.com`

### **Code Injection**
- ❌ `eval('malicious code')`
- ❌ `document.cookie`
- ❌ `window.location`

## 🔍 Mensagens de Segurança

O sistema exibe mensagens específicas quando detecta conteúdo suspeito:

- **Scripts/HTML:** "Conteúdo suspeito detectado!"
- **Links:** "Links não são permitidos!"
- **Caracteres suspeitos:** "Caracteres suspeitos detectados!"
- **Colagem maliciosa:** "Conteúdo colado rejeitado por segurança!"
- **Mensagem longa:** "Mensagem muito longa!"

## ✅ Conteúdo Permitido

O sistema aceita apenas:
- 📱 **Números de telefone** em formatos válidos
- 🔢 **Dígitos, espaços, hífens, parênteses**
- ➕ **Códigos de país** (+55, +54, +53)
- 📝 **Mensagens curtas** (até 100 caracteres)

## 🔄 Processo de Validação

1. **Input** → Usuário digita/cola conteúdo
2. **Filtro** → Remove caracteres perigosos em tempo real
3. **Validação** → Verifica padrões maliciosos
4. **Sanitização** → Limpa e normaliza dados
5. **Processamento** → Extrai e verifica números
6. **Resposta** → Retorna resultado seguro

## 🛠️ Monitoramento

O sistema monitora e bloqueia:
- 🚫 Tentativas de injeção de código
- 🚫 Envio de URLs suspeitas
- 🚫 Caracteres de escape maliciosos
- 🚫 Conteúdo muito longo
- 🚫 Colagem de scripts

## 📞 Contato de Segurança

Para reportar vulnerabilidades de segurança:
- 📱 **WhatsApp oficial:** [wa.me/+555596869527](https://wa.me/+555596869527)
- 🔐 **Política:** Reporte responsável de vulnerabilidades

---

**🔒 Este sistema foi desenvolvido com foco em segurança máxima para proteger os usuários da Domine a Consultoria de Alimentos.** 