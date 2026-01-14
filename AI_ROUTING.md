# 🤖 Sistema de IA e Roteamento - Documentação

## 📋 Visão Geral

O sistema implementa **qualificação automática de leads** e **roteamento inteligente** usando Google Gemini AI.

---

## 🧠 Como Funciona

### 1. Fluxo de Mensagens

```
Cliente envia mensagem
        ↓
SessionManager captura
        ↓
Salva no banco de dados
        ↓
┌─────────────────────────────┐
│  ANÁLISE AUTOMÁTICA         │
├─────────────────────────────┤
│ 1. ComplianceEngine         │ → Detecta violações
│ 2. LeadQualifier (Gemini)  │ → Qualifica lead
│ 3. RouterEngine             │ → Roteia se quente
└─────────────────────────────┘
        ↓
Notifica vendedor via WebSocket
```

---

## 🎯 LeadQualifier (IA)

### Quando Qualifica?
- **A cada 3 mensagens** do cliente
- Analisa todo o histórico da conversa
- Usa Gemini para entender contexto

### O que Analisa?
```javascript
{
  "score": 0-100,           // Probabilidade de conversão
  "temperature": "hot|warm|cold",
  "intent": "site|ecommerce|tráfego|etc",
  "urgency": "low|medium|high",
  "budget": "R$ X ou null",
  "shouldRoute": true|false,  // Se deve rotear para vendedor
  "reasoning": "Por que esse score",
  "nextAction": "Sugestão de próxima ação"
}
```

### Critérios de Qualificação

**Lead Quente (70-100):**
- ✅ Pergunta sobre preços específicos
- ✅ Menciona urgência ("preciso hoje", "essa semana")
- ✅ Já tem orçamento definido
- ✅ Faz perguntas técnicas detalhadas
- ✅ Menciona concorrentes
- ✅ Pede proposta formal

**Lead Morno (31-69):**
- 🟡 Interesse moderado
- 🟡 Faz perguntas genéricas
- 🟡 Ainda pesquisando opções
- 🟡 Sem urgência clara

**Lead Frio (0-30):**
- 🔵 "Só estou olhando"
- 🔵 Respostas monossilábicas
- 🔵 Não responde perguntas
- 🔵 Sem contexto ou especificação

---

## 🔀 RouterEngine (Roteamento)

### Quando Roteia?
- **Automaticamente** quando `score >= 70`
- Apenas se o lead ainda não foi roteado

### Como Escolhe o Vendedor?
1. Busca vendedores **online** (status = 'online')
2. Calcula **carga de trabalho** de cada um
3. Seleciona vendedor com **menor carga**
4. Atribui lead ao vendedor
5. Registra no histórico

### Exemplo de Roteamento

```javascript
// Lead com score 85 (quente)
{
  leadId: 123,
  score: 85,
  temperature: "hot",
  intent: "ecommerce completo",
  urgency: "high"
}

// Sistema roteia automaticamente
RouterEngine.routeToVendor(123, qualification)
  ↓
Seleciona: João Silva (carga: 2 leads)
  ↓
Notifica João via WebSocket
  ↓
João recebe notificação no dashboard
```

---

## 📊 Eventos WebSocket

### `lead-updated`
Emitido quando lead é qualificado:
```javascript
{
  leadId: 123,
  score: 85,
  temperature: "hot",
  intent: "ecommerce",
  urgency: "high"
}
```

### `lead-routed`
Emitido quando lead é roteado:
```javascript
{
  leadId: 123,
  vendorId: "vendor_123",
  vendorName: "João Silva",
  score: 85,
  reason: "Lead quente com alta urgência"
}
```

### `new-lead-{vendorId}`
Notificação para vendedor específico:
```javascript
{
  leadId: 123,
  leadName: "Carlos Mendes",
  leadPhone: "5511999999999",
  score: 85,
  temperature: "hot",
  intent: "ecommerce completo",
  urgency: "high",
  reasoning: "Cliente quer fechar hoje",
  timestamp: "2026-01-14T14:00:00Z"
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Gemini AI
GEMINI_API_KEY=AIzaSyCpogP-ZziYOmmMsFoaSLRZt9YOoEH2PN8
GEMINI_MODEL=gemini-2.0-flash-lite

# Qualificação
QUALIFICATION_INTERVAL=3  # Qualifica a cada X mensagens
ROUTING_THRESHOLD=70      # Score mínimo para rotear
```

### Ajustar Critérios

**Mudar threshold de roteamento:**
```javascript
// Em lead-qualifier.js
if (qualification.score >= 70) {  // Mude aqui
  qualification.shouldRoute = true;
}
```

**Mudar frequência de qualificação:**
```javascript
// Em server/index.js
if (messages.length % 3 === 0) {  // Mude aqui (3 = a cada 3 mensagens)
  const qualification = await leadQualifier.qualify(lead.id, messages);
}
```

---

## 📈 Monitoramento

### Logs do Sistema

```bash
[AI] Qualificando lead 123...
[AI] Lead 123: 85/100 (hot) - ecommerce completo
[AI] 🔥 Lead quente roteado para João Silva
[RouterEngine] Lead 123 roteado para João Silva (carga: 3)
[RouterEngine] Vendedor vendor_123 notificado sobre lead 123
```

### Estatísticas de Roteamento

```javascript
// GET /api/routing/stats
{
  totalRouted: 15,
  vendorLoads: {
    "vendor_1": 5,
    "vendor_2": 3,
    "vendor_3": 7
  }
}
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Lead Frio → Morno → Quente

```
Mensagem 1 (Cliente): "oi"
→ Score: 10 (cold) - Saudação genérica

Mensagem 2 (Cliente): "quanto custa um site?"
→ Score: 35 (warm) - Interesse em preço

Mensagem 3 (Cliente): "preciso de um ecommerce completo, quanto custa?"
→ Score: 55 (warm) - Especificou serviço

Mensagem 4 (Cliente): "tenho R$ 5.000, quero fechar hoje"
→ Score: 90 (hot) 🔥 - ROTEADO AUTOMATICAMENTE!
```

### Exemplo 2: Balanceamento de Carga

```
Vendedores:
- João Silva: 2 leads ativos
- Maria Santos: 5 leads ativos
- Pedro Costa: 1 lead ativo

Novo lead quente chega:
→ Sistema escolhe Pedro Costa (menor carga)
→ Pedro recebe notificação
→ Carga de Pedro: 1 → 2
```

---

## 🚀 Próximas Melhorias

- [ ] **Especialização**: Rotear por tipo de serviço (site → vendedor especialista em sites)
- [ ] **Horário**: Considerar horário de trabalho do vendedor
- [ ] **Performance**: Rotear para vendedor com melhor taxa de conversão
- [ ] **Re-roteamento**: Transferir lead se vendedor não responder em X minutos
- [ ] **IA Conversacional**: Bot responde automaticamente leads frios/mornos

---

## 📝 Resumo

✅ **LeadQualifier**: Analisa conversas e atribui score 0-100
✅ **RouterEngine**: Distribui leads quentes entre vendedores
✅ **Automático**: Qualifica a cada 3 mensagens, roteia se score >= 70
✅ **Inteligente**: Balanceia carga entre vendedores
✅ **Em Tempo Real**: Notificações via WebSocket

**Resultado**: Vendedores focam apenas em leads quentes, IA cuida dos frios! 🎯
