# 🚀 Script de Inicialização do Banco de Dados

## ⚠️ IMPORTANTE: Execute este script ANTES de iniciar o servidor

Este script cria as tabelas necessárias no banco de dados local SQLite.

## Como executar:

```bash
# No terminal, execute:
node server/init-db.js
```

Isso criará um arquivo `database.sqlite` na pasta `server/` com todas as tabelas necessárias.

## Tabelas criadas:

- vendors (vendedores)
- leads (leads/clientes)
- conversations (conversas)
- messages (mensagens)
- alerts (alertas de compliance)
- routing_logs (histórico de roteamento)

## Após executar:

1. Inicie o backend: `node server/index.js`
2. Inicie o frontend: `npm run dev`
3. Acesse: http://localhost:5173

---

**Nota**: Este projeto usa SQLite local para desenvolvimento. Para produção, use Cloudflare D1.
