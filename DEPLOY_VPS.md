# 🚀 Deploy Manual para VPS - Zapper Clone

## 📋 Informações da VPS

- **IP**: 145.223.30.23
- **Usuário**: root
- **Senha**: @Carlos88321499

---

## 🔧 Passo a Passo Manual

### 1. Compactar Projeto Localmente

```powershell
cd c:\Users\jorge\bot-new

# Compactar projeto (excluindo node_modules)
tar -czf zapper-clone.tar.gz `
    --exclude=node_modules `
    --exclude=.git `
    --exclude=dist `
    --exclude=*.log `
    --exclude=database.sqlite `
    --exclude=auth_info_baileys `
    *
```

### 2. Transferir para VPS

```powershell
# Transferir arquivo
scp zapper-clone.tar.gz root@145.223.30.23:/tmp/
```

### 3. Conectar na VPS

```powershell
ssh root@145.223.30.23
```

### 4. Configurar VPS (executar na VPS)

```bash
# Atualizar sistema
apt-get update -y
apt-get upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Instalar Nginx (proxy reverso)
apt-get install -y nginx

# Configurar firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable
```

### 5. Extrair e Configurar Projeto

```bash
# Criar diretório
mkdir -p /root/zapper-clone
cd /root/zapper-clone

# Extrair projeto
tar -xzf /tmp/zapper-clone.tar.gz
rm /tmp/zapper-clone.tar.gz

# Instalar dependências
npm install

# Criar diretórios necessários
mkdir -p auth_info_baileys
mkdir -p logs
```

### 6. Configurar .env

```bash
# Editar .env
nano .env
```

**Cole suas credenciais:**
```env
# Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=seu_account_id
CLOUDFLARE_DATABASE_ID=seu_database_id
CLOUDFLARE_API_TOKEN=seu_api_token

# Gemini AI
GEMINI_API_KEY=AIzaSyCpogP-ZziYOmmMsFoaSLRZt9YOoEH2PN8
GEMINI_MODEL=gemini-2.0-flash-lite

# Server
PORT=3000
NODE_ENV=production
```

**Salvar**: `Ctrl+O`, `Enter`, `Ctrl+X`

### 7. Configurar Banco de Dados

```bash
# Opção 1: Usar Cloudflare D1 (recomendado para produção)
npm install -g wrangler
wrangler login
wrangler d1 execute zapper-db --remote --file=server/schema-d1.sql

# Opção 2: Usar SQLite local (desenvolvimento)
node server/init-db.js
```

### 8. Build do Frontend

```bash
npm run build
```

### 9. Configurar Nginx

```bash
# Criar configuração
nano /etc/nginx/sites-available/zapper
```

**Cole:**
```nginx
server {
    listen 80;
    server_name _;

    # Frontend (arquivos estáticos)
    location / {
        root /root/zapper-clone/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Ativar configuração:**
```bash
ln -sf /etc/nginx/sites-available/zapper /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 10. Iniciar Aplicação

```bash
# Iniciar backend
pm2 start server/index.js --name zapper-backend

# Verificar se está rodando
pm2 list
pm2 logs zapper-backend
```

### 11. Configurar Auto-Start

```bash
# Salvar configuração PM2
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer
```

---

## 📊 Comandos Úteis

### PM2
```bash
pm2 list              # Ver processos
pm2 logs              # Ver logs de todos
pm2 logs zapper-backend  # Ver logs específicos
pm2 monit             # Monitor em tempo real
pm2 restart all       # Reiniciar tudo
pm2 stop all          # Parar tudo
pm2 delete all        # Deletar todos os processos
```

### Nginx
```bash
systemctl status nginx    # Ver status
systemctl restart nginx   # Reiniciar
nginx -t                  # Testar configuração
tail -f /var/log/nginx/error.log  # Ver erros
```

### Sistema
```bash
htop                  # Monitor de recursos
df -h                 # Espaço em disco
free -h               # Memória
netstat -tulpn        # Portas em uso
```

---

## 🌍 Acessar Aplicação

**URL**: http://145.223.30.23

---

## 🔄 Atualizar Projeto

```bash
# Na sua máquina local
cd c:\Users\jorge\bot-new
tar -czf zapper-clone.tar.gz --exclude=node_modules --exclude=.git *
scp zapper-clone.tar.gz root@145.223.30.23:/tmp/

# Na VPS
cd /root/zapper-clone
pm2 stop all
tar -xzf /tmp/zapper-clone.tar.gz
npm install
npm run build
pm2 restart all
```

---

## 🚨 Troubleshooting

### Porta 3000 já em uso
```bash
lsof -i :3000
kill -9 <PID>
```

### Erro de permissão
```bash
chmod +x server/index.js
```

### Logs do backend
```bash
pm2 logs zapper-backend --lines 100
```

### Reiniciar tudo
```bash
pm2 restart all
systemctl restart nginx
```

---

## ✅ Checklist

- [ ] VPS atualizada
- [ ] Node.js instalado
- [ ] PM2 instalado
- [ ] Nginx instalado
- [ ] Projeto transferido
- [ ] Dependências instaladas
- [ ] .env configurado
- [ ] Banco de dados criado
- [ ] Frontend buildado
- [ ] Nginx configurado
- [ ] Backend iniciado
- [ ] Auto-start configurado
- [ ] Aplicação acessível

---

**Pronto!** Seu Zapper Clone está rodando em produção! 🎉
