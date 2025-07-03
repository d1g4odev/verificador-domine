@echo off
echo 🔧 Corrigindo e enviando vercel.json...
echo.

rem Navegar para a pasta do projeto
cd /d "C:\Users\Rodrigo\Desktop\chatbot domine"

echo 📍 Pasta: %CD%
echo.

rem Configurar safe directory
git config --global --add safe.directory "C:/Users/Rodrigo/Desktop/chatbot domine"

echo 🔄 Sincronizando com GitHub...
git pull origin main --allow-unrelated-histories

echo 📦 Adicionando todos os arquivos...
git add .

echo 💬 Fazendo commit...
git commit -m "Fix vercel.json - configuracao corrigida para deploy"

echo 🌐 Forçando push para GitHub...
git push origin main --force

echo.
echo ✅ Arquivos enviados com sucesso!
echo 🔗 Repositório atualizado: https://github.com/d1g4odev/verificador-domine
echo.
echo 🚀 PRÓXIMO PASSO:
echo    1. Volte na Vercel
echo    2. Atualize a página do projeto
echo    3. Clique Deploy novamente
echo    4. Deve funcionar agora!
echo.
pause 