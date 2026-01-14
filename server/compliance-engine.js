class ComplianceEngine {
    constructor(database) {
        this.db = database;
        this.rules = this.getDefaultRules();
    }

    /**
     * Regras padrão de compliance
     */
    getDefaultRules() {
        return [
            {
                id: 'forbidden_words',
                type: 'forbidden_word',
                severity: 'high',
                patterns: [
                    /desconto\s+(?:de\s+)?(\d+)%/gi,
                    /(?:por|fazer)\s+(?:apenas\s+)?r?\$?\s*(\d+)/gi,
                    /não\s+conte\s+para\s+ninguém/gi,
                    /entre\s+nós/gi,
                    /segredo/gi,
                ],
                title: 'Desconto não autorizado detectado',
                description: (match) => `Vendedor ofereceu desconto sem aprovação: "${match}"`,
            },
            {
                id: 'sensitive_data',
                type: 'sensitive_data',
                severity: 'medium',
                patterns: [
                    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
                    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Cartão de crédito
                    /\bsenha\s*[:=]\s*\S+/gi,
                ],
                title: 'Dados sensíveis compartilhados',
                description: (match) => `Dados sensíveis detectados na conversa: "${match}"`,
            },
            {
                id: 'competitor_mention',
                type: 'competitor_mention',
                severity: 'low',
                patterns: [
                    /concorrente/gi,
                    /empresa\s+x/gi,
                    /eles\s+cobram/gi,
                ],
                title: 'Menção à concorrência',
                description: (match) => `Vendedor mencionou concorrência: "${match}"`,
            },
            {
                id: 'unprofessional_language',
                type: 'unprofessional_language',
                severity: 'medium',
                patterns: [
                    /\b(?:merda|porra|caralho|pqp)\b/gi,
                    /\b(?:fdp|vsf)\b/gi,
                ],
                title: 'Linguagem imprópria',
                description: (match) => `Linguagem não profissional detectada: "${match}"`,
            },
        ];
    }

    /**
     * Analisa uma mensagem e retorna violações
     */
    async analyze(text, vendorId) {
        const violations = [];

        for (const rule of this.rules) {
            for (const pattern of rule.patterns) {
                const matches = text.match(pattern);

                if (matches) {
                    for (const match of matches) {
                        violations.push({
                            type: rule.type,
                            severity: rule.severity,
                            title: rule.title,
                            description: typeof rule.description === 'function'
                                ? rule.description(match)
                                : rule.description,
                            match,
                        });
                    }
                }
            }
        }

        return violations;
    }

    /**
     * Adiciona uma regra customizada
     */
    addRule(rule) {
        this.rules.push(rule);
    }

    /**
     * Remove uma regra
     */
    removeRule(ruleId) {
        this.rules = this.rules.filter(r => r.id !== ruleId);
    }
}

export default ComplianceEngine;
