class RouterEngine {
    constructor(database) {
        this.db = database;
        this.activeRoutings = new Map(); // leadId -> { vendorId, timestamp }
        this.vendorLoad = new Map(); // vendorId -> number of active leads
    }

    /**
     * Roteia um lead para o melhor vendedor disponível
     */
    async routeToVendor(leadId, qualification) {
        try {
            // Busca vendedores disponíveis (online)
            const vendors = await this.getAvailableVendors();

            if (vendors.length === 0) {
                console.log('[RouterEngine] Nenhum vendedor disponível');
                return null;
            }

            // Seleciona vendedor com menor carga
            const selectedVendor = this.selectBestVendor(vendors);

            // Atribui lead ao vendedor
            await this.db.assignLeadToVendor(leadId, selectedVendor.id);

            // Registra roteamento
            await this.db.logRouting(
                leadId,
                null, // from_vendor_id (null = IA)
                selectedVendor.id,
                `Lead quente (score: ${qualification.score}) - ${qualification.reasoning}`,
                qualification.score
            );

            // Atualiza carga do vendedor
            const currentLoad = this.vendorLoad.get(selectedVendor.id) || 0;
            this.vendorLoad.set(selectedVendor.id, currentLoad + 1);

            // Marca como roteado
            this.activeRoutings.set(leadId, {
                vendorId: selectedVendor.id,
                timestamp: Date.now(),
                score: qualification.score
            });

            console.log(`[RouterEngine] Lead ${leadId} roteado para ${selectedVendor.name} (carga: ${currentLoad + 1})`);

            return {
                vendorId: selectedVendor.id,
                vendorName: selectedVendor.name,
                reason: qualification.reasoning
            };

        } catch (error) {
            console.error('[RouterEngine] Erro ao rotear lead:', error);
            return null;
        }
    }

    /**
     * Busca vendedores disponíveis (online)
     */
    async getAvailableVendors() {
        try {
            const result = await this.db.query(
                "SELECT * FROM vendors WHERE status = 'online' AND is_active = 1 ORDER BY last_seen DESC"
            );
            return result.results || [];
        } catch (error) {
            console.error('[RouterEngine] Erro ao buscar vendedores:', error);
            return [];
        }
    }

    /**
     * Seleciona o melhor vendedor baseado em carga de trabalho
     */
    selectBestVendor(vendors) {
        // Calcula carga de cada vendedor
        const vendorsWithLoad = vendors.map(vendor => ({
            ...vendor,
            load: this.vendorLoad.get(vendor.id) || 0
        }));

        // Ordena por menor carga
        vendorsWithLoad.sort((a, b) => a.load - b.load);

        // Retorna vendedor com menor carga
        return vendorsWithLoad[0];
    }

    /**
     * Verifica se um lead já está roteado
     */
    isRouted(leadId) {
        return this.activeRoutings.has(leadId);
    }

    /**
     * Remove roteamento (quando lead é fechado ou perdido)
     */
    async unroute(leadId) {
        const routing = this.activeRoutings.get(leadId);
        if (routing) {
            // Diminui carga do vendedor
            const currentLoad = this.vendorLoad.get(routing.vendorId) || 0;
            this.vendorLoad.set(routing.vendorId, Math.max(0, currentLoad - 1));

            this.activeRoutings.delete(leadId);
            console.log(`[RouterEngine] Lead ${leadId} desroteado`);
        }
    }

    /**
     * Retorna estatísticas de roteamento
     */
    getStats() {
        const stats = {
            totalRouted: this.activeRoutings.size,
            vendorLoads: {}
        };

        for (const [vendorId, load] of this.vendorLoad.entries()) {
            stats.vendorLoads[vendorId] = load;
        }

        return stats;
    }

    /**
   * Notifica vendedor sobre novo lead via WhatsApp
   * Envia mensagem com link para abrir conversa direto no WhatsApp
   */
    async notifyVendor(sessionManager, vendorId, leadData, qualification) {
        try {
            // Busca sessão do vendedor
            const session = sessionManager.getSession(vendorId);
            if (!session || !session.sock) {
                console.log(`[RouterEngine] Vendedor ${vendorId} não tem sessão ativa`);
                return;
            }

            // Formata número do lead (remove caracteres especiais)
            const leadPhone = leadData.phone.replace(/\D/g, '');

            // Cria link do WhatsApp
            const whatsappLink = `https://wa.me/${leadPhone}`;

            // Monta mensagem para o vendedor
            const message = `🔔 *NOVO LEAD PARA VOCÊ!*

👤 *Cliente:* ${leadData.name || 'Não informado'}
📞 *Telefone:* ${leadData.phone}

🎯 *Intenção:* ${qualification.intent}
📋 *Serviço:* ${qualification.service}
⚡ *Urgência:* ${qualification.urgency}
${qualification.budget ? `💰 *Orçamento:* ${qualification.budget}` : ''}

📌 *Info Importante:* ${qualification.keyInfo}

💡 *Próximo Passo:* ${qualification.nextStep}

👉 *Clique para abrir conversa:*
${whatsappLink}

_Atenda esse lead o mais rápido possível!_ ⚡`;

            // Envia mensagem para o vendedor
            await session.sock.sendMessage(
                `${vendorId.replace('vendor_', '')}@s.whatsapp.net`, // JID do vendedor
                { text: message }
            );

            console.log(`[RouterEngine] ✅ Vendedor ${vendorId} notificado via WhatsApp`);

        } catch (error) {
            console.error('[RouterEngine] Erro ao notificar vendedor:', error);
        }
    }

    /**
     * Limpa roteamentos antigos (leads inativos por mais de 24h)
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas

        for (const [leadId, routing] of this.activeRoutings.entries()) {
            if (now - routing.timestamp > maxAge) {
                this.unroute(leadId);
            }
        }
    }
}

export default RouterEngine;
