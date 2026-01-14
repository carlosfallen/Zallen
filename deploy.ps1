# =============================================
# SCRIPT DE DEPLOY - ZAPPER CLONE (PowerShell)
# VPS: 145.223.30.23
# =============================================

Write-Host "🚀 Iniciando deploy do Zapper Clone..." -ForegroundColor Green

# Configurações
$VPS_IP = "145.223.30.23"
$VPS_USER = "root"
$VPS_PASSWORD = "@Carlos88321499"
$PROJECT_DIR = "c:\Users\jorge\bot-new"
$REMOTE_DIR = "/root/zapper-clone"

# Criar arquivo temporário com arquivos a incluir
$includeFiles = @(
    "server/*",
    "src/*",
    "public/*",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    ".env.example",
    "README.md",
    "QUICKSTART.md",
    "USER_GUIDE.md",
    "CLOUDFLARE_D1_SETUP.md"
)

Write-Host "📦 Compactando projeto..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR

# Criar arquivo tar.gz (requer tar no Windows 10+)
tar -czf zapper-clone.tar.gz `
    --exclude=node_modules `
    --exclude=.git `
    --exclude=dist `
    --exclude=*.log `
    --exclude=database.sqlite `
    --exclude=auth_info_baileys `
    --exclude=.gemini `
    *

Write-Host "📤 Transferindo para VPS..." -ForegroundColor Yellow

# Usar SCP para transferir (requer OpenSSH no Windows)
scp -o StrictHostKeyChecking=no zapper-clone.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/

Write-Host "🔧 Configurando VPS..." -ForegroundColor Yellow

# Conectar via SSH e executar comandos
$sshCommands = @"
# Atualizar sistema
echo '📦 Atualizando sistema...'
apt-get update -y
apt-get upgrade -y

# Instalar Node.js 20.x
echo '📦 Instalando Node.js...'
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar PM2
echo '📦 Instalando PM2...'
npm install -g pm2

# Instalar Nginx
echo '📦 Instalando Nginx...'
apt-get install -y nginx

# Criar diretório do projeto
echo '📁 Criando diretório...'
rm -rf /root/zapper-clone
mkdir -p /root/zapper-clone
cd /root/zapper-clone

# Extrair projeto
echo '📦 Extraindo projeto...'
tar -xzf /tmp/zapper-clone.tar.gz -C /root/zapper-clone
rm /tmp/zapper-clone.tar.gz

# Instalar dependências
echo '📦 Instalando dependências...'
npm install

# Criar diretórios necessários
mkdir -p auth_info_baileys
mkdir -p logs

# Configurar firewall
echo '🔒 Configurando firewall...'
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

# Configurar Nginx como proxy reverso
echo '🌐 Configurando Nginx...'
cat > /etc/nginx/sites-available/zapper << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/zapper /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo '✅ Configuração da VPS concluída!'
"@

ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} $sshCommands

# Limpar arquivo local
Remove-Item zapper-clone.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Conecte-se à VPS: ssh root@145.223.30.23"
Write-Host "2. Configure o .env: cd /root/zapper-clone && nano .env"
Write-Host "3. Execute o banco: node server/init-db.js"
Write-Host "4. Build frontend: npm run build"
Write-Host "5. Inicie backend: pm2 start server/index.js --name zapper-backend"
Write-Host "6. Inicie frontend: pm2 start npm --name zapper-frontend -- run preview"
Write-Host ""
Write-Host "📊 Comandos úteis:" -ForegroundColor Yellow
Write-Host "   pm2 list          - Ver processos"
Write-Host "   pm2 logs          - Ver logs"
Write-Host "   pm2 monit         - Monitorar"
Write-Host "   pm2 restart all   - Reiniciar tudo"
Write-Host "   pm2 save          - Salvar configuração"
Write-Host "   pm2 startup       - Auto-start no boot"
Write-Host ""
Write-Host "🌍 Acesse: http://145.223.30.23" -ForegroundColor Green
