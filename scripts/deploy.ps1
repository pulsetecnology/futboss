# Script de deploy para Railway (PowerShell)
Write-Host "🚀 Iniciando deploy do FutBoss para Railway..." -ForegroundColor Green

# Verificar se estamos na branch main
$branch = git branch --show-current
if ($branch -ne "main") {
    Write-Host "⚠️  Aviso: Você não está na branch main. Branch atual: $branch" -ForegroundColor Yellow
    $continue = Read-Host "Deseja continuar? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deploy cancelado." -ForegroundColor Red
        exit 1
    }
}

# Verificar se há mudanças não commitadas
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Há mudanças não commitadas:" -ForegroundColor Yellow
    git status --short
    $commit = Read-Host "Deseja fazer commit antes do deploy? (y/N)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $commitMessage = Read-Host "Digite a mensagem do commit"
        git add .
        git commit -m $commitMessage
    }
}

# Build local para verificação
Write-Host "🔨 Fazendo build local para verificação..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build local. Corrija os erros antes do deploy." -ForegroundColor Red
    exit 1
}

# Push para o repositório
Write-Host "📤 Fazendo push para o repositório..." -ForegroundColor Blue
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push. Verifique sua conexão e permissões." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deploy iniciado com sucesso!" -ForegroundColor Green
Write-Host "🌐 Verifique o status do deploy no painel do Railway:" -ForegroundColor Cyan
Write-Host "   https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Após o deploy, verifique:" -ForegroundColor Yellow
Write-Host "   - Health check: https://your-app.railway.app/health" -ForegroundColor Yellow
Write-Host "   - API Health: https://your-app.railway.app/api/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎮 FutBoss estará disponível em: https://your-app.railway.app" -ForegroundColor Magenta