#!/bin/bash

# =============================================
# SCRIPT DE DEPLOY - ZAPPER CLONE
# VPS: 145.223.30.23
# =============================================

echo "🚀 Iniciando deploy do Zapper Clone..."

# Configurações
VPS_IP="145.223.30.23"
VPS_USER="root"
PROJECT_NAME="zapper-clone"
REMOTE_DIR="/root/$PROJECT_NAME"

echo "📦 Compactando projeto..."
cd "c:\Users\jorge\bot-new"

# Criar arquivo .tar.gz excluindo node_modules e arquivos desnecessários
tar -czf zapper-clone.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=*.log \
  --exclude=database.sqlite \
  --exclude=auth_info_baileys \
  .

echo "📤 Transferindo para VPS..."
scp -o StrictHostKeyChecking=no zapper-clone.tar.gz $VPS_USER@$VPS_IP:/tmp/

echo "🔧 Configurando VPS..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt-get update -y
apt-get upgrade -y

# Instalar Node.js 20.x
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar PM2 para gerenciar processos
echo "📦 Instalando PM2..."
npm install -g pm2

# Criar diretório do projeto
echo "📁 Criando diretório..."
mkdir -p /root/zapper-clone
cd /root/zapper-clone

# Extrair projeto
echo "📦 Extraindo projeto..."
tar -xzf /tmp/zapper-clone.tar.gz -C /root/zapper-clone
rm /tmp/zapper-clone.tar.gz

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Configurar firewall
echo "🔒 Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 5173/tcp
ufw --force enable

# Criar diretório para sessões Baileys
mkdir -p auth_info_baileys

echo "✅ Configuração da VPS concluída!"

ENDSSH

echo "✅ Deploy concluído!"
echo ""
echo "🌐 Próximos passos:"
echo "1. Conecte-se à VPS: ssh root@145.223.30.23"
echo "2. Configure o .env com suas credenciais"
echo "3. Execute o banco de dados: node server/init-db.js"
echo "4. Inicie o backend: pm2 start server/index.js --name zapper-backend"
echo "5. Inicie o frontend: pm2 start 'npm run dev' --name zapper-frontend"
echo ""
echo "📊 Monitorar: pm2 monit"
echo "📋 Logs: pm2 logs"
echo "🔄 Restart: pm2 restart all"
