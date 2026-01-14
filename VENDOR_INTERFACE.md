# 👤 Interface Individual para Vendedores

## 📋 Visão Geral

Cada vendedor tem acesso a um dashboard personalizado onde pode visualizar apenas os leads atribuídos a ele.

---

## 🔗 Acesso

### URL do Vendedor
```
http://localhost:5173/vendor/{vendorId}
```

**Exemplo:**
```
http://localhost:5173/vendor/vendor_1234567890
```

---

## 🎨 Funcionalidades do Dashboard do Vendedor

### 1. Header Personalizado
- Nome do vendedor
- Status de conexão (Online/Offline)
- Botão para voltar ao dashboard principal

### 2. Estatísticas
- **Total de Leads**: Todos os leads atribuídos
- **Leads Hoje**: Leads recebidos hoje
- **Pendentes**: Leads ainda não atendidos
- **Tempo Médio**: Tempo médio de resposta

### 3. Lista de Leads
Cada lead exibe:
- 👤 **Nome do cliente**
- 📞 **Telefone**
- 🎯 **Intenção** (detectada pela IA)
- 📋 **Serviço** (site, ecommerce, etc)
- ⚡ **Urgência** (baixa/média/alta)
- 💰 **Orçamento** (se mencionado)
- 📌 **Info Importante** (resumo da IA)
- 💡 **Próximo Passo** (sugestão da IA)
- 🕐 **Timestamp** (quando foi recebido)

### 4. Botão "Abrir WhatsApp"
- Abre conversa direto no WhatsApp Web
- Link: `https://wa.me/{telefone}`
- Vendedor pode responder imediatamente

---

## 🔔 Notificações em Tempo Real

### Como Funciona

1. **Cliente envia mensagem** → Bot responde
2. **IA analisa conversa** (a cada 3 mensagens)
3. **IA detecta intenção** e extrai informações
4. **Sistema roteia** para vendedor com menor carga
5. **Vendedor recebe notificação** no WhatsApp dele:

```
🔔 NOVO LEAD PARA VOCÊ!

👤 Cliente: Carlos Mendes
📞 Telefone: +55 11 99999-9999

🎯 Intenção: quer ecommerce completo para loja de roupas
📋 Serviço: ecommerce
⚡ Urgência: alta
💰 Orçamento: R$ 5.000

📌 Info Importante: Cliente já tem produtos e quer vender online

💡 Próximo Passo: Apresentar planos de ecommerce e fazer proposta

👉 Clique para abrir conversa:
https://wa.me/5511999999999

Atenda esse lead o mais rápido possível! ⚡
```

6. **Vendedor clica no link** → Abre WhatsApp Web
7. **Vendedor atende o cliente** diretamente

---

## 🎯 Fluxo Completo

```
Cliente → Bot (IA) → Análise → Roteamento → Notificação WhatsApp → Vendedor
```

### Exemplo Prático

**Conversa do Cliente:**
```
Cliente: oi
Bot: Olá! Como posso ajudar?

Cliente: preciso de uma loja virtual
Bot: Legal! Que tipo de produtos você vende?

Cliente: roupas femininas, tenho R$ 5.000 pra investir
Bot: Perfeito! Vou conectar você com um especialista...
```

**IA Detecta:**
- Intenção: "ecommerce para loja de roupas"
- Serviço: ecommerce
- Urgência: média
- Orçamento: R$ 5.000

**Sistema Roteia:**
- Vendedor com menor carga: João Silva
- Envia notificação no WhatsApp do João

**João Recebe:**
- Mensagem com todas as informações
- Link direto para conversa
- Sugestão de próximo passo

**João Atende:**
- Clica no link
- Abre WhatsApp Web
- Continua conversa com contexto completo

---

## 🔐 Segurança e Privacidade

### Isolamento de Dados
- Cada vendedor vê **apenas seus leads**
- Não tem acesso aos leads de outros vendedores
- Não tem acesso ao dashboard principal (gestor)

### Autenticação (Futuro)
- Login com email/senha
- Token JWT para sessões
- Permissões por role (vendedor/gestor)

---

## 📱 Responsividade

O dashboard do vendedor é **totalmente responsivo**:
- ✅ Desktop (tela grande)
- ✅ Tablet (tela média)
- ✅ Mobile (smartphone)

Vendedor pode acessar de qualquer dispositivo!

---

## 🚀 Como Usar

### Para o Gestor

1. Acesse o dashboard principal
2. Vá em **Vendedores**
3. Clique em um vendedor
4. Copie o link do dashboard dele
5. Envie para o vendedor

### Para o Vendedor

1. Receba o link do gestor
2. Acesse: `http://localhost:5173/vendor/seu_id`
3. Visualize seus leads
4. Clique em "Abrir WhatsApp" para atender
5. Receba notificações em tempo real no seu WhatsApp

---

## 🎨 Cores e Urgência

### Badges de Urgência

- 🔴 **Alta**: Vermelho (atender imediatamente)
- 🟡 **Média**: Amarelo (atender em breve)
- 🔵 **Baixa**: Azul (atender quando possível)

---

## 📊 Métricas do Vendedor

### Estatísticas Exibidas

1. **Total de Leads**: Contador geral
2. **Leads Hoje**: Novos leads do dia
3. **Pendentes**: Leads não atendidos
4. **Tempo Médio**: Velocidade de resposta

### Gamificação (Futuro)
- Ranking de vendedores
- Badges por performance
- Metas e recompensas

---

## 🔄 Atualizações em Tempo Real

### WebSocket
- Novos leads aparecem automaticamente
- Sem precisar recarregar a página
- Notificação visual quando chega lead novo

---

## 📝 Resumo

✅ **Dashboard Individual**: Cada vendedor tem sua interface
✅ **Leads Filtrados**: Vê apenas os dele
✅ **Link WhatsApp**: Abre conversa direto
✅ **Informações da IA**: Contexto completo do lead
✅ **Notificações**: Recebe no WhatsApp dele
✅ **Responsivo**: Funciona em qualquer dispositivo

**Resultado**: Vendedor atende mais rápido e com mais contexto! 🚀
