# 🗄️ Configuração do Cloudflare D1

## 📋 Pré-requisitos

1. Conta no Cloudflare
2. Wrangler CLI instalado
3. Credenciais configuradas no `.env`

---

## 🚀 Passo a Passo

### 1. Instalar Wrangler (se ainda não tiver)

```bash
npm install -g wrangler
```

### 2. Login no Cloudflare

```bash
wrangler login
```

### 3. Criar Banco de Dados D1

```bash
wrangler d1 create zapper-db
```

**Copie o output** que será algo assim:
```
[[d1_databases]]
binding = "DB"
database_name = "zapper-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. Atualizar .env

Adicione as credenciais no arquivo `.env`:

```env
CLOUDFLARE_ACCOUNT_ID=seu_account_id
CLOUDFLARE_DATABASE_ID=database_id_do_passo_3
CLOUDFLARE_API_TOKEN=seu_api_token
```

**Como obter:**
- **Account ID**: Dashboard Cloudflare → Lado direito da página
- **Database ID**: Output do comando acima
- **API Token**: Dashboard Cloudflare → My Profile → API Tokens → Create Token

### 5. Executar Schema no D1

```bash
wrangler d1 execute zapper-db --file=server/schema-d1.sql
```

**Ou via comando remoto:**

```bash
wrangler d1 execute zapper-db --remote --file=server/schema-d1.sql
```

### 6. Verificar Tabelas Criadas

```bash
wrangler d1 execute zapper-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 📊 Tabelas Criadas

O schema cria as seguintes tabelas:

### Core (Multi-Tenant)
- `vendors` - Vendedores/WhatsApp accounts
- `leads` - Leads/Clientes
- `conversations` - Conversas
- `messages` - Mensagens
- `alerts` - Alertas de compliance
- `routing_logs` - Histórico de roteamento

### CRM
- `deals` - Negócios/Vendas
- `appointments` - Agendamentos

### Sistema
- `bot_config` - Configurações
- `statistics` - Estatísticas diárias
- `activity_log` - Log de atividades

---

## 🔄 Comandos Úteis

### Executar Query

```bash
wrangler d1 execute zapper-db --command="SELECT * FROM vendors"
```

### Limpar Tabela

```bash
wrangler d1 execute zapper-db --command="DELETE FROM messages"
```

### Backup

```bash
wrangler d1 export zapper-db --output=backup.sql
```

### Restaurar

```bash
wrangler d1 execute zapper-db --file=backup.sql
```

---

## 🔧 Atualizar Schema

Se precisar adicionar novas colunas ou tabelas:

1. Edite `server/schema-d1.sql`
2. Execute novamente:

```bash
wrangler d1 execute zapper-db --remote --file=server/schema-d1.sql
```

**Nota**: Use `CREATE TABLE IF NOT EXISTS` para evitar erros.

---

## 🌐 Produção vs Desenvolvimento

### Desenvolvimento (Local)
```bash
# Usa SQLite local
node server/init-db.js
node server/index.js
```

### Produção (Cloudflare D1)
```bash
# Usa D1 online
# Configure CLOUDFLARE_* no .env
node server/index.js
```

O código detecta automaticamente se as credenciais do Cloudflare estão configuradas e usa D1, caso contrário usa SQLite local.

---

## ✅ Verificação

Após executar o schema, verifique se tudo está OK:

```bash
# Listar tabelas
wrangler d1 execute zapper-db --command="SELECT name FROM sqlite_master WHERE type='table'"

# Contar registros
wrangler d1 execute zapper-db --command="SELECT COUNT(*) as total FROM bot_config"

# Ver configurações
wrangler d1 execute zapper-db --command="SELECT * FROM bot_config"
```

---

## 🚨 Troubleshooting

### Erro: "Database not found"
- Verifique se o `database_id` no `.env` está correto
- Execute `wrangler d1 list` para ver databases disponíveis

### Erro: "Unauthorized"
- Verifique se o API Token tem permissões de D1
- Refaça login: `wrangler login`

### Erro: "Table already exists"
- Normal se executar schema novamente
- Use `IF NOT EXISTS` nas queries

---

## 📝 Resumo

1. ✅ Instalar Wrangler
2. ✅ Criar banco D1
3. ✅ Configurar `.env`
4. ✅ Executar `schema-d1.sql`
5. ✅ Verificar tabelas
6. ✅ Iniciar servidor

**Pronto!** Seu banco de dados Cloudflare D1 está configurado! 🎉
