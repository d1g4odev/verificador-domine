@echo off
echo 🔧 Atualizando vercel.json corrigido...
echo.

rem Navegar para a pasta do projeto
cd /d "C:\Users\Rodrigo\Desktop\chatbot domine"

rem Verificar se estamos na pasta correta
if not exist "vercel.json" (
    echo ❌ ERRO: arquivo vercel.json não encontrado!
    pause
    exit /b 1
)

echo ✅ Arquivo vercel.json encontrado
echo 📍 Pasta: %CD%
echo.

rem Configurar safe directory
git config --global --add safe.directory "C:/Users/Rodrigo/Desktop/chatbot domine"

echo 📦 Adicionando apenas vercel.json...
git add vercel.json

echo 💬 Fazendo commit da correção...
git commit -m "Fix: corrigir vercel.json - remover headers problemáticos"

echo 🌐 Enviando para GitHub...
git push origin main

echo.
echo ✅ vercel.json atualizado com sucesso!
echo 🔗 Repositório: https://github.com/d1g4odev/verificador-domine
echo.
echo 🚀 Agora volte na Vercel e clique Deploy novamente!
echo.
pause 