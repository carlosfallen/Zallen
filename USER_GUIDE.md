# 🎉 Guia de Uso - Plataforma Zapper Clone

## 🚀 Início Rápido

### 1. Instalação

```bash
# Clone o projeto
cd c:\Users\jorge\bot-new

# Instale dependências
npm install

# Configure variáveis de ambiente
# Copie .env.example para .env e preencha as credenciais
```

### 2. Configuração do Banco de Dados

```bash
# Execute o schema SQL no Cloudflare D1
wrangler d1 execute zapper-db --file=server/schema.sql
```

### 3. Iniciar Servidores

```bash
# Terminal 1 - Backend
node server/index.js

# Terminal 2 - Frontend
npm run dev
```

---

## 📱 Como Usar

### Para o Gestor (Admin)

#### 1. Acessar Dashboard Principal
```
http://localhost:5173/dashboard
```

**O que você vê:**
- KPIs em tempo real (vendedores, leads, mensagens, alertas)
- Gráfico de atividade recente
- Top vendedores por performance
- Taxa de conversão

#### 2. Adicionar Vendedor
1. Vá em **Vendedores**
2. Clique em "Adicionar Vendedor"
3. Preencha nome, telefone e email
4. Escaneie QR Code no WhatsApp do vendedor
5. Aguarde conexão (status ficará "Online")

#### 3. Monitorar Conversas
1. Vá em **Monitoramento**
2. Veja todas as mensagens em tempo real
3. Use filtros para buscar vendedor específico
4. Alertas aparecem destacados em vermelho
5. Exporte conversas em CSV

#### 4. Gerenciar Leads
1. Vá em **Leads**
2. Veja todos os leads com temperatura (🔥 Quente, 💧 Morno, ❄️ Frio)
3. Filtre por temperatura, serviço ou busque por nome
4. Clique em ✏️ para editar informações do lead
5. Veja qual vendedor está atendendo cada lead

#### 5. Revisar Alertas
1. Vá em **Alertas**
2. Veja alertas de compliance por severidade
3. Filtre por status (Pendente/Resolvido/Descartado)
4. Clique em "Resolver" ou "Descartar"
5. Exporte relatório de compliance

---

### Para o Vendedor

#### 1. Acessar Dashboard Individual
```
http://localhost:5173/vendor/vendor_1234567890
```
*(O gestor envia esse link para você)*

**O que você vê:**
- Seus leads atribuídos
- Estatísticas pessoais
- Informações detectadas pela IA

#### 2. Atender Lead
1. Veja novo lead na lista
2. Leia informações:
   - 🎯 Intenção do cliente
   - ⚡ Urgência
   - 💰 Orçamento (se mencionado)
   - 📌 Info importante
   - 💡 Próximo passo sugerido
3. Clique em "Abrir WhatsApp"
4. Atenda o cliente no WhatsApp Web

#### 3. Receber Notificações
Quando um lead quente chega, você recebe no seu WhatsApp:
```
🔔 NOVO LEAD PARA VOCÊ!

👤 Cliente: Carlos Mendes
📞 Telefone: +55 11 99999-9999

🎯 Intenção: quer ecommerce completo
📋 Serviço: ecommerce
⚡ Urgência: alta
💰 Orçamento: R$ 5.000

📌 Info Importante: Cliente já tem produtos

💡 Próximo Passo: Apresentar planos

👉 Clique para abrir conversa:
https://wa.me/5511999999999
```

---

## 🤖 Como a IA Funciona

### Fluxo Automático

```
Cliente envia mensagem
        ↓
Bot responde automaticamente
        ↓
IA analisa conversa (a cada 3 mensagens)
        ↓
IA detecta intenção e extrai informações
        ↓
Sistema roteia para vendedor com menor carga
        ↓
Vendedor recebe notificação no WhatsApp
        ↓
Vendedor atende cliente
```

### O que a IA Detecta

- **Intenção**: O que o cliente quer (site, ecommerce, tráfego, etc)
- **Urgência**: Baixa, média ou alta
- **Orçamento**: Se o cliente mencionar valor
- **Serviço**: Tipo de serviço desejado
- **Próximo Passo**: Sugestão do que fazer

### Roteamento Inteligente

- IA **sempre** roteia para vendedor (sem threshold)
- Escolhe vendedor com **menor carga** de trabalho
- Balanceia leads entre equipe
- Notifica via WhatsApp instantaneamente

---

## 🚨 Sistema de Compliance

### Regras Automáticas

A IA detecta automaticamente:

1. **Palavras Proibidas**
   - Descontos não autorizados
   - Promessas irreais
   - Linguagem inadequada

2. **Dados Sensíveis**
   - CPF, cartão de crédito
   - Senhas
   - Informações confidenciais

3. **Linguagem Imprópria**
   - Palavrões
   - Ofensas
   - Linguagem não profissional

4. **Menção a Concorrentes**
   - Falar mal de concorrentes
   - Comparações negativas

### Quando Alerta é Gerado

1. Vendedor envia mensagem com violação
2. Sistema detecta automaticamente
3. Alerta aparece no dashboard do gestor
4. Gestor pode resolver ou descartar
5. Histórico fica registrado

---

## 📊 Métricas e Relatórios

### Dashboard Principal

- **Total de Vendedores**: Quantos estão cadastrados
- **Vendedores Online**: Quantos estão conectados
- **Total de Leads**: Todos os leads
- **Leads Quentes**: Leads com alta urgência
- **Alertas Pendentes**: Violações não resolvidas
- **Taxa de Conversão**: % de leads convertidos

### Por Vendedor

- Total de leads atribuídos
- Leads atendidos hoje
- Leads pendentes
- Tempo médio de resposta

### Exportações

- **Mensagens**: CSV com todas as conversas
- **Leads**: CSV com todos os leads
- **Alertas**: CSV com relatório de compliance

---

## 🔔 Notificações em Tempo Real

### Via WebSocket

- Novas mensagens aparecem instantaneamente
- Alertas surgem em tempo real
- Leads atualizados automaticamente
- Status de vendedores atualizado

### Via WhatsApp

- Vendedor recebe notificação quando lead é atribuído
- Mensagem contém link direto para conversa
- Informações completas do lead
- Sugestão de próximo passo

---

## 🎨 Interface

### Cores e Badges

- 🔥 **Vermelho**: Quente, Alta prioridade, Crítico
- 💧 **Amarelo**: Morno, Média prioridade, Atenção
- ❄️ **Azul**: Frio, Baixa prioridade, Informação
- ✅ **Verde**: Resolvido, Sucesso, Online
- ❌ **Cinza**: Descartado, Offline, Inativo

### Ações Rápidas

- ✏️ Editar
- 👁️ Visualizar
- ✅ Resolver
- ❌ Descartar
- 📥 Exportar

---

## 🔧 Solução de Problemas

### Vendedor não conecta

1. Verifique se escaneou QR Code
2. Aguarde até 30 segundos
3. Recarregue a página
4. Se persistir, delete e adicione novamente

### Mensagens não aparecem

1. Verifique conexão WebSocket (🟢 Conectado)
2. Recarregue a página
3. Verifique se backend está rodando

### IA não qualifica leads

1. Verifique se `GEMINI_API_KEY` está configurada
2. Veja logs do backend
3. Aguarde pelo menos 3 mensagens do cliente

### Alertas não aparecem

1. Verifique se ComplianceEngine está ativo
2. Veja logs do backend
3. Teste enviando mensagem com palavra proibida

---

## 📝 Resumo de Comandos

```bash
# Iniciar backend
node server/index.js

# Iniciar frontend
npm run dev

# Ver logs
# (logs aparecem no terminal do backend)

# Parar servidores
# Ctrl+C em cada terminal
```

---

## 🎯 Casos de Uso

### Caso 1: Novo Lead Chega

1. Cliente envia "oi"
2. Bot responde "Olá! Como posso ajudar?"
3. Cliente: "preciso de um ecommerce"
4. Bot: "Legal! Que tipo de produtos?"
5. Cliente: "roupas, tenho R$ 5.000"
6. **IA detecta**: ecommerce, urgência média, R$ 5.000
7. **Sistema roteia** para João Silva (menor carga)
8. **João recebe** notificação no WhatsApp
9. **João clica** no link e atende

### Caso 2: Vendedor Viola Compliance

1. Vendedor: "Posso fazer por R$ 2.000, mas não conte para ninguém"
2. **Sistema detecta**: desconto não autorizado
3. **Alerta criado** automaticamente
4. **Gestor vê** no dashboard de Alertas
5. **Gestor resolve** ou descarta
6. **Histórico** fica registrado

### Caso 3: Gestor Monitora Equipe

1. Gestor acessa Dashboard
2. Vê 3 vendedores online
3. 15 leads ativos (5 quentes, 7 mornos, 3 frios)
4. 2 alertas pendentes
5. Clica em Monitoramento
6. Vê conversas em tempo real
7. Exporta relatório do dia

---

## ✅ Checklist Diário

**Para o Gestor:**
- [ ] Verificar vendedores online
- [ ] Revisar alertas pendentes
- [ ] Monitorar leads quentes
- [ ] Exportar relatório do dia
- [ ] Verificar taxa de conversão

**Para o Vendedor:**
- [ ] Acessar dashboard individual
- [ ] Verificar novos leads
- [ ] Atender leads pendentes
- [ ] Responder notificações WhatsApp
- [ ] Atualizar status dos leads

---

## 🚀 Pronto para Usar!

A plataforma está 100% funcional. Qualquer dúvida, consulte a documentação completa em:
- `README.md` - Documentação técnica
- `AI_ROUTING.md` - Sistema de IA
- `VENDOR_INTERFACE.md` - Interface de vendedores
