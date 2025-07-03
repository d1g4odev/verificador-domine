@echo off
echo 🚀 Enviando Verificador Domine para GitHub...
echo.

rem Navegar para a pasta do projeto
cd /d "C:\Users\Rodrigo\Desktop\chatbot domine"

rem Verificar se estamos na pasta correta
if not exist "index.html" (
    echo ❌ ERRO: Pasta incorreta! 
    echo 📁 Navegue manualmente para a pasta "chatbot domine"
    echo 💡 Exemplo: cd "C:\Users\Rodrigo\Desktop\chatbot domine"
    echo.
    pause
    exit /b 1
)

echo 📍 Pasta atual: %CD%
echo ✅ Arquivos encontrados!
echo.

rem Remover git existente se houver problema
if exist .git (
    echo 🧹 Limpando configuração Git anterior...
    rmdir /s /q .git
)

echo 📁 Inicializando repositório Git...
git init
git branch -M main

rem Adicionar remote
echo 🔗 Conectando com GitHub...
git remote add origin https://github.com/d1g4odev/verificador-domine.git

echo 📦 Adicionando arquivos...
git add .

echo 💬 Fazendo commit...
git commit -m "Chatbot verificador de números oficiais da Domine"

echo 🌐 Enviando para GitHub...
git push -u origin main

echo.
echo ✅ Código enviado com sucesso!
echo 🔗 Repositório: https://github.com/d1g4odev/verificador-domine
echo.
echo 🚀 Próximo passo - Deploy na Vercel:
echo    1. Acesse https://vercel.com
echo    2. Clique em "New Project"  
echo    3. Selecione "verificador-domine"
echo    4. Deploy automático!
echo.
pause 