@echo off
echo 🚀 Enviando Verificador Domine para GitHub...
echo.

rem Inicializar Git se necessário
if not exist .git (
    echo 📁 Inicializando repositório Git...
    git init
    git branch -M main
)

rem Adicionar remote se não existir
git remote remove origin 2>nul
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
echo 🚀 Agora você pode fazer deploy na Vercel:
echo    1. Acesse vercel.com
echo    2. Clique em "New Project"
echo    3. Selecione "verificador-domine"
echo    4. Deploy automático!
echo.
pause 