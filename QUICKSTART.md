# 🚀 Guia Rápido de Início - Zapper Clone

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configure o Cloudflare D1

```bash
# 1. Acesse: https://dash.cloudflare.com
# 2. Vá em: Workers & Pages → D1
# 3. Clique em: Create database
# 4. Nome: zapper-monitor
# 5. Copie o Database ID
```

### 2️⃣ Execute o Schema SQL

```bash
# No Console do D1, copie e cole o conteúdo de:
server/schema.sql
```

### 3️⃣ Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais:
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
CLOUDFLARE_DATABASE_ID=seu_database_id_aqui
CLOUDFLARE_API_TOKEN=seu_api_token_aqui
```

**Como obter as credenciais:**

- **Account ID**: Dashboard → Workers & Pages (canto direito)
- **Database ID**: D1 → Seu banco → Copiar ID
- **API Token**: My Profile → API Tokens → Create Token
  - Template: "Edit Cloudflare Workers"
  - Ou custom com: Account → D1 → Edit

### 4️⃣ Inicie os Servidores

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend  
npm run dev
```

### 5️⃣ Acesse o Dashboard

Abra no navegador: **http://localhost:5173**

---

## 📱 Adicionar Primeiro Vendedor

1. Clique em **Vendedores** no menu lateral
2. Clique no botão **+ Adicionar Vendedor**
3. Digite o nome do vendedor (ex: "João Silva")
4. Clique em **Gerar QR Code**
5. No celular do vendedor:
   - Abra o WhatsApp
   - Vá em **Configurações** → **Aparelhos conectados**
   - Toque em **Conectar um aparelho**
   - Escaneie o QR Code exibido na tela
6. Aguarde a confirmação "Conectado com sucesso!"

✅ Pronto! O vendedor está conectado e sendo monitorado.

---

## 🎯 Testando o Sistema

### Teste 1: Enviar Mensagem Normal

1. No celular do vendedor, envie uma mensagem para qualquer contato
2. Vá em **Monitoramento** no dashboard
3. Você verá a mensagem aparecer em tempo real

### Teste 2: Gerar Alerta de Compliance

1. No celular do vendedor, envie uma mensagem com desconto:
   ```
   Posso fazer por R$ 2000, mas não conte para ninguém
   ```
2. Vá em **Alertas** no dashboard
3. Você verá um alerta vermelho de "Desconto não autorizado"

### Teste 3: Visualizar Leads

1. Vá em **Leads** no dashboard
2. Você verá todos os contatos que interagiram
3. Cada lead tem um score e temperatura

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Frontend (Vite)
npm run server       # Backend (Express + Socket.io)

# Produção
npm run build        # Build do frontend
npm run preview      # Preview do build

# Utilitários
npm install          # Instalar dependências
```

---

## 📊 Estrutura de Pastas

```
bot-new/
├── server/          # Backend
├── src/             # Frontend
├── auth/            # Sessões Baileys (auto-gerado)
├── .env             # Suas credenciais
└── README.md        # Documentação completa
```

---

## ⚠️ Troubleshooting Rápido

### Erro: "Database query failed"
- ✅ Verifique se executou o `schema.sql` no D1
- ✅ Confirme as credenciais no `.env`

### Erro: "QR Code não aparece"
- ✅ Verifique se o backend está rodando (`npm run server`)
- ✅ Confirme que a porta 3000 está livre

### Erro: "WebSocket não conecta"
- ✅ Confirme que o backend está na porta 3000
- ✅ Verifique o console do navegador (F12)

---

## 📚 Próximos Passos

1. ✅ Adicione mais vendedores
2. ✅ Configure regras de compliance customizadas
3. ✅ Monitore as conversas em tempo real
4. ✅ Gerencie alertas e leads

---

## 🎉 Pronto!

Seu sistema Zapper Clone está funcionando! 🚀

Para mais detalhes, consulte o [README.md](file:///c:/Users/jorge/bot-new/README.md) completo.
