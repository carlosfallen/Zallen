# 🛡️ Zapper Clone - Plataforma de Monitoramento WhatsApp

Sistema completo de monitoramento multi-tenant para WhatsApp corporativo, similar ao Zapper.

## 🎯 Funcionalidades

### ✅ Monitoramento em Tempo Real
- Visualize todas as conversas de múltiplos vendedores em um único dashboard
- Feed de mensagens em tempo real via WebSocket
- Filtros por vendedor, período e busca de conteúdo

### 🛡️ Compliance e Auditoria
- Detecção automática de palavras proibidas
- Alertas de dados sensíveis (CPF, cartões, senhas)
- Análise de linguagem imprópria
- Menção à concorrência
- Sistema de severidade (Low/Medium/High)

### 👥 Gestão de Vendedores
- Múltiplas conexões WhatsApp simultâneas (uma por vendedor)
- QR Code individual para cada vendedor
- Status em tempo real (Online/Offline/Connecting)
- Métricas por vendedor (mensagens, conversão, compliance score)

### 🎯 Qualificação de Leads
- Score automático de leads (0-100)
- Temperatura (Hot/Warm/Cold)
- Histórico completo de interações
- Atribuição automática a vendedores

### 📊 Dashboard e Analytics
- Métricas em tempo real
- Top vendedores por performance
- Taxa de conversão
- Alertas pendentes

### 🤖 IA e Roteamento Inteligente
- **LeadQualifier**: Análise automática de conversas com Google Gemini
- **Scoring**: Classificação de leads (0-100) baseado em contexto
- **Temperatura**: Hot/Warm/Cold para priorização
- **Roteamento Automático**: Leads quentes (score >= 70) vão direto para vendedores
- **Balanceamento**: Distribuição inteligente baseada em carga de trabalho
- **Notificações**: Vendedores recebem alertas em tempo real via WebSocket

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- Conta Cloudflare (para D1 Database)
- API Key do Google Gemini (opcional, para IA avançada)

### 1. Clone e Instale Dependências

```bash
cd bot-new
npm install
```

### 2. Configure Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_API_TOKEN=your_api_token

# Gemini AI (opcional)
GEMINI_API_KEY=your_gemini_key

# Server
PORT=3000
NODE_ENV=development
```

### 3. Inicialize o Banco de Dados

Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com) e:

1. Vá em **Workers & Pages** → **D1**
2. Clique em **Create database**
3. Nome: `zapper-monitor`
4. Copie o **Database ID**
5. Vá em **Console** e execute o conteúdo de `server/schema.sql`

### 4. Inicie o Servidor

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

Acesse: **http://localhost:5173**

## 📁 Estrutura do Projeto

```
bot-new/
├── server/                    # Backend
│   ├── index.js              # Servidor principal (Express + Socket.io)
│   ├── session-manager.js    # Gerenciador de múltiplas sessões Baileys
│   ├── database.js           # Cliente Cloudflare D1
│   ├── compliance-engine.js  # Motor de compliance
│   └── schema.sql            # Schema do banco de dados
├── src/                      # Frontend (React + Vite)
│   ├── pages/               # Páginas
│   │   ├── Dashboard.tsx
│   │   ├── Monitoring.tsx
│   │   ├── Vendors.tsx
│   │   ├── Leads.tsx
│   │   └── Alerts.tsx
│   ├── components/          # Componentes
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── QRCodeModal.tsx
│   ├── App.tsx
│   └── index.css
├── auth/                    # Sessões Baileys (gerado automaticamente)
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Como Usar

### Adicionar um Vendedor

1. Acesse **Vendedores** no menu lateral
2. Clique em **Adicionar Vendedor**
3. Digite o nome do vendedor
4. Clique em **Gerar QR Code**
5. No celular do vendedor:
   - Abra o WhatsApp
   - Vá em **Configurações** → **Aparelhos conectados**
   - Toque em **Conectar um aparelho**
   - Escaneie o QR Code
6. Aguarde a confirmação de conexão

### Monitorar Conversas

1. Acesse **Monitoramento** no menu lateral
2. Visualize todas as mensagens em tempo real
3. Use os filtros para buscar por vendedor ou conteúdo
4. Mensagens com alertas aparecem destacadas em vermelho

### Gerenciar Alertas

1. Acesse **Alertas** no menu lateral
2. Veja todos os alertas de compliance
3. Filtre por severidade ou status
4. Clique em **Resolver** ou **Descartar** para gerenciar

### Visualizar Leads

1. Acesse **Leads** no menu lateral
2. Veja todos os leads com scoring automático
3. Filtre por temperatura (Hot/Warm/Cold)
4. Clique em um lead para ver histórico completo

## 🔒 Cloudflare D1 - Obter Credenciais

### Account ID
1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Workers & Pages**
3. Copie o **Account ID** no canto direito

### Database ID
1. Vá em **D1** no menu lateral
2. Clique no seu banco de dados
3. Copie o **Database ID**

### API Token
1. Vá em **My Profile** → **API Tokens**
2. Clique em **Create Token**
3. Use o template **Edit Cloudflare Workers**
4. Ou crie um custom token com permissões:
   - **Account** → **D1** → **Edit**
5. Copie o token gerado

## 🎨 Personalização

### Adicionar Regras de Compliance

Edite `server/compliance-engine.js`:

```javascript
{
  id: 'my_custom_rule',
  type: 'custom_violation',
  severity: 'high',
  patterns: [
    /palavra\s+proibida/gi,
  ],
  title: 'Minha Regra Customizada',
  description: (match) => `Violação detectada: "${match}"`,
}
```

### Customizar Cores

Edite `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#25D366', // Sua cor primária
  },
}
```

## 📊 API REST

### Endpoints Disponíveis

```
GET  /api/health           # Health check
GET  /api/vendors          # Listar vendedores
POST /api/vendors          # Criar vendedor
DELETE /api/vendors/:id    # Deletar vendedor
GET  /api/leads            # Listar leads
GET  /api/messages         # Listar mensagens
GET  /api/alerts           # Listar alertas
PATCH /api/alerts/:id      # Atualizar alerta
GET  /api/stats            # Estatísticas do dashboard
```

### WebSocket Events

```javascript
// Cliente → Servidor
socket.on('connect', () => {})
socket.on('disconnect', () => {})

// Servidor → Cliente
socket.on('qr-{vendorId}', (data) => {})      // QR Code gerado
socket.on('status-{vendorId}', (data) => {})  // Status da conexão
socket.on('new-message', (data) => {})        // Nova mensagem
socket.on('new-alert', (data) => {})          // Novo alerta
socket.on('vendor-update', (data) => {})      // Atualização de vendedor
```

## 🐛 Troubleshooting

### Vendedor não conecta
- Verifique se o QR Code foi escaneado corretamente
- Confirme que o WhatsApp está atualizado
- Tente gerar um novo QR Code

### Banco de dados não salva
- Verifique as credenciais do Cloudflare no `.env`
- Confirme que o schema foi executado no D1
- Verifique permissões do API Token

### WebSocket não conecta
- Confirme que o backend está rodando na porta 3000
- Verifique se não há firewall bloqueando
- Teste com `curl http://localhost:3000/api/health`

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para monitoramento profissional de WhatsApp

---

**🚀 Pronto para começar? Execute `npm run server` e `npm run dev`!**
