import { GoogleGenerativeAI } from '@google/generative-ai';

class LeadQualifier {
    constructor(database) {
        this.db = database;
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite'
        });
        this.conversationCache = new Map();
    }

    /**
   * Qualifica um lead baseado no histórico de mensagens
   * Foco: detectar intenção e coletar informações para o vendedor
   */
    async qualify(leadId, messages) {
        try {
            // Busca informações do lead
            const lead = await this.db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
            if (!lead.results || lead.results.length === 0) {
                return { intent: 'unknown', info: {}, shouldRoute: true };
            }

            const leadData = lead.results[0];

            // Monta histórico de conversa
            const conversationHistory = messages
                .map(m => `${m.direction === 'inbound' ? 'Cliente' : 'Bot'}: ${m.message_text}`)
                .join('\n');

            // Prompt simplificado para detecção de intenção
            const prompt = `Você é um assistente que analisa conversas de WhatsApp para ajudar vendedores.

Analise a conversa abaixo e extraia informações úteis:

CONVERSA:
${conversationHistory}

INFORMAÇÕES DO LEAD:
- Nome: ${leadData.name || 'Não informado'}
- Telefone: ${leadData.phone}

Identifique:
1. **Intenção Principal**: O que o cliente quer (site, ecommerce, landing page, tráfego pago, redes sociais, etc)
2. **Urgência**: Tem prazo? Quer fechar rápido?
3. **Orçamento**: Mencionou valor disponível?
4. **Detalhes Importantes**: Qualquer informação relevante para o vendedor

Responda APENAS em JSON válido:
{
  "intent": "descrição clara da intenção (ex: 'quer ecommerce completo para loja de roupas')",
  "service": "site|ecommerce|landing|traffic|social_media|other",
  "urgency": "baixa|média|alta",
  "budget": "valor mencionado ou null",
  "keyInfo": "resumo de 1 linha com info mais importante",
  "nextStep": "sugestão do que vendedor deve fazer"
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from AI');
            }

            const qualification = JSON.parse(jsonMatch[0]);

            // Atualiza lead no banco (apenas intenção)
            await this.db.query(
                'UPDATE leads SET intent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [qualification.intent, leadId]
            );

            console.log(`[LeadQualifier] Lead ${leadId}: ${qualification.intent}`);

            return {
                ...qualification,
                shouldRoute: true // SEMPRE roteia para vendedor
            };

        } catch (error) {
            console.error('[LeadQualifier] Erro ao qualificar lead:', error);
            return {
                intent: 'Conversa em andamento',
                service: 'other',
                urgency: 'média',
                budget: null,
                keyInfo: 'Verificar conversa completa',
                nextStep: 'Iniciar atendimento',
                shouldRoute: true
            };
        }
    }

    /**
     * Analisa uma mensagem individual para detectar intenção
     */
    async analyzeIntent(text) {
        try {
            const prompt = `Analise a mensagem do cliente e identifique a intenção principal.

MENSAGEM: "${text}"

Responda em JSON:
{
  "intent": "greeting|pricing|service_inquiry|objection|closing|other",
  "service": "site|ecommerce|landing|traffic|social_media|other|null",
  "urgency": "low|medium|high",
  "sentiment": "positive|neutral|negative"
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const jsonText = response.text();

            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error('[LeadQualifier] Erro ao analisar intenção:', error);
            return null;
        }
    }

    /**
     * Sugere próxima mensagem para o vendedor
     */
    async suggestResponse(leadId, conversationHistory) {
        try {
            const prompt = `Você é um consultor de vendas. Baseado na conversa abaixo, sugira a melhor próxima mensagem para o vendedor enviar.

CONVERSA:
${conversationHistory}

A mensagem deve:
- Ser natural e humanizada
- Avançar a venda
- Fazer uma pergunta estratégica
- Ser curta (1-2 frases)

Responda APENAS a mensagem sugerida, sem explicações.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text().trim();

        } catch (error) {
            console.error('[LeadQualifier] Erro ao sugerir resposta:', error);
            return null;
        }
    }
}

export default LeadQualifier;
