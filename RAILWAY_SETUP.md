# 🚀 Configuração de Variáveis de Ambiente - Railway

## 📋 Variáveis OBRIGATÓRIAS

### 1. **NODE_ENV** (Obrigatória)
```
NODE_ENV=production
```
**Por que:** Define o ambiente como produção, ativa otimizações e desativa logs de debug.

### 2. **JWT_SECRET** (Obrigatória)
```
JWT_SECRET=p/jrAooP2xULuu2Fx9reVMVuTzxz+HYjGUmOxlAXfNbII33SnXVeKKjPHQlXWTEoIMRIktHgMRvjXRU6ri/iiQ==
```
**Por que:** Chave para assinar e verificar tokens JWT de autenticação.

### 3. **DATABASE_URL** (Automática)
```
DATABASE_URL=postgresql://postgres:password@host:port/database
```
**Por que:** O Railway configura automaticamente quando você conecta um banco PostgreSQL.
**⚠️ NÃO CONFIGURE MANUALMENTE** - O Railway faz isso automaticamente.

## 📋 Variáveis RECOMENDADAS

### 4. **PORT** (Opcional - Railway define automaticamente)
```
PORT=3001
```
**Por que:** O Railway define automaticamente, mas você pode especificar se quiser.

### 5. **JWT_EXPIRES_IN** (Recomendada)
```
JWT_EXPIRES_IN=7d
```
**Por que:** Define por quanto tempo o token JWT permanece válido (7 dias).

### 6. **CORS_ORIGIN** (Recomendada)
```
CORS_ORIGIN=https://seu-app-name.railway.app
```
**Por que:** Permite requisições do seu domínio Railway. Substitua `seu-app-name` pelo nome real do seu app.

## 📋 Variáveis OPCIONAIS (Para otimização)

### 7. **RATE_LIMIT_WINDOW_MS** (Opcional)
```
RATE_LIMIT_WINDOW_MS=900000
```
**Por que:** Janela de tempo para rate limiting (15 minutos = 900000ms).

### 8. **RATE_LIMIT_MAX_REQUESTS** (Opcional)
```
RATE_LIMIT_MAX_REQUESTS=100
```
**Por que:** Máximo de requisições por IP na janela de tempo.

## 🔮 Variáveis FUTURAS (Para implementar depois)

### 9. **SOFASCORE_API_KEY** (Futura)
```
SOFASCORE_API_KEY=sua_chave_api_aqui
```
**Por que:** Para integração com API do SofaScore (será implementado nas próximas tarefas).

### 10. **SOFASCORE_BASE_URL** (Futura)
```
SOFASCORE_BASE_URL=https://api.sofascore.com/api/v1
```
**Por que:** URL base da API do SofaScore.

---

## 🎯 RESUMO: O QUE CONFIGURAR AGORA

### ✅ Configure ESTAS variáveis no Railway:

1. **NODE_ENV** = `production`
2. **JWT_SECRET** = `p/jrAooP2xULuu2Fx9reVMVuTzxz+HYjGUmOxlAXfNbII33SnXVeKKjPHQlXWTEoIMRIktHgMRvjXRU6ri/iiQ==`
3. **JWT_EXPIRES_IN** = `7d`
4. **CORS_ORIGIN** = `https://seu-app-name.railway.app` (substitua pelo seu domínio)

### 🔄 O Railway configura automaticamente:
- **DATABASE_URL** (quando você conecta o PostgreSQL)
- **PORT** (Railway define a porta automaticamente)

---

## 📝 Como Configurar no Railway:

1. **Acesse:** https://railway.app/dashboard
2. **Selecione** seu projeto FutBoss
3. **Clique** na aba "Variables"
4. **Adicione** cada variável clicando em "New Variable"
5. **Cole** o nome e valor exatos de cada variável
6. **Salve** e aguarde o redeploy automático

---

## 🚨 IMPORTANTE:

- ✅ **DATABASE_URL**: NÃO configure manualmente - Railway faz automaticamente
- ✅ **JWT_SECRET**: Use a chave gerada pelo nosso script (nunca compartilhe)
- ✅ **CORS_ORIGIN**: Substitua pelo seu domínio Railway real
- ✅ **NODE_ENV**: Sempre `production` no Railway

---

## 🔍 Como descobrir seu domínio Railway:

1. No painel do Railway, vá em "Settings"
2. Procure por "Domains" 
3. Seu domínio será algo como: `https://futboss-production-xxxx.railway.app`
4. Use esse domínio na variável `CORS_ORIGIN`