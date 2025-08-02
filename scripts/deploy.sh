#!/bin/bash

# Script de deploy para Railway
echo "🚀 Iniciando deploy do FutBoss para Railway..."

# Verificar se estamos na branch main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Aviso: Você não está na branch main. Branch atual: $BRANCH"
    read -p "Deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deploy cancelado."
        exit 1
    fi
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Há mudanças não commitadas:"
    git status --short
    read -p "Deseja fazer commit antes do deploy? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Digite a mensagem do commit: " commit_message
        git add .
        git commit -m "$commit_message"
    fi
fi

# Build local para verificar se tudo está funcionando
echo "🔨 Fazendo build local para verificação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local. Corrija os erros antes do deploy."
    exit 1
fi

# Push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin $BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer push. Verifique sua conexão e permissões."
    exit 1
fi

echo "✅ Deploy iniciado com sucesso!"
echo "🌐 Verifique o status do deploy no painel do Railway:"
echo "   https://railway.app/dashboard"
echo ""
echo "📊 Após o deploy, verifique:"
echo "   - Health check: https://your-app.railway.app/health"
echo "   - API Health: https://your-app.railway.app/api/health"
echo ""
echo "🎮 FutBoss estará disponível em: https://your-app.railway.app"