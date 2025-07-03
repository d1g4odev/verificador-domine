@echo off
echo 🚀 Fazendo deploy do Verificador Domine...

git add .
git commit -m "Update verificador de numeros"
git push origin main

echo ✅ Deploy enviado para GitHub!
echo 🌐 Vercel vai atualizar automaticamente em alguns segundos
pause 