-- =============================================
-- SCHEMA COMPLETO - ZAPPER CLONE (Cloudflare D1)
-- Multi-Tenant WhatsApp Monitoring Platform
-- =============================================

-- VENDORS (VENDEDORES/MULTI-TENANT)
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  whatsapp_number TEXT UNIQUE,
  status TEXT DEFAULT 'offline',
  is_active INTEGER DEFAULT 1,
  session_data TEXT,
  qr_code TEXT,
  total_messages INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  performance_score REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT DEFAULT CURRENT_TIMESTAMP
);

-- LEADS (CRM)
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  company TEXT,
  segment TEXT,
  source TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'new',
  temperature TEXT DEFAULT 'cold',
  score INTEGER DEFAULT 0,
  intent TEXT,
  service TEXT,
  urgency TEXT,
  budget TEXT,
  assigned_vendor_id TEXT,
  assigned_vendor_name TEXT,
  notes TEXT,
  tags TEXT,
  custom_fields TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_interaction TEXT DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (assigned_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT NOT NULL,
  lead_id INTEGER,
  chat_id TEXT NOT NULL,
  chat_type TEXT DEFAULT 'private',
  chat_name TEXT,
  is_bot_active INTEGER DEFAULT 1,
  is_blocked INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'inicio',
  subject TEXT,
  plan TEXT,
  unread_count INTEGER DEFAULT 0,
  last_message TEXT,
  last_message_at TEXT DEFAULT CURRENT_TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, chat_id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT NOT NULL,
  conversation_id INTEGER NOT NULL,
  message_id TEXT,
  direction TEXT NOT NULL,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  intent TEXT,
  confidence REAL,
  method TEXT,
  entities TEXT,
  is_bot_response INTEGER DEFAULT 0,
  is_read INTEGER DEFAULT 0,
  has_alert INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- ALERTS (COMPLIANCE)
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT NOT NULL,
  lead_id INTEGER,
  message_id TEXT,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  context TEXT,
  status TEXT DEFAULT 'pending',
  resolved_by TEXT,
  resolved_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- ROUTING_LOGS (HISTÓRICO DE ROTEAMENTO)
CREATE TABLE IF NOT EXISTS routing_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  from_vendor_id TEXT,
  to_vendor_id TEXT NOT NULL,
  reason TEXT,
  score INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (from_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  FOREIGN KEY (to_vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- DEALS (NEGÓCIOS)
CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT NOT NULL,
  lead_id INTEGER,
  chat_id TEXT NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'open',
  stage TEXT DEFAULT 'prospecting',
  product TEXT,
  plan TEXT,
  value REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  final_value REAL DEFAULT 0,
  payment_method TEXT,
  installments INTEGER,
  contract_url TEXT,
  payment_url TEXT,
  expected_close_date TEXT,
  closed_at TEXT,
  won INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- APPOINTMENTS (AGENDA)
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT NOT NULL,
  lead_id INTEGER,
  chat_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_at TEXT NOT NULL,
  end_at TEXT,
  duration_min INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled',
  type TEXT DEFAULT 'call',
  location TEXT,
  meet_link TEXT,
  reminder_sent INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- BOT_CONFIG (CONFIGURAÇÕES)
CREATE TABLE IF NOT EXISTS bot_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string',
  category TEXT DEFAULT 'general',
  label TEXT,
  description TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- STATISTICS (ESTATÍSTICAS DIÁRIAS)
CREATE TABLE IF NOT EXISTS statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT,
  date TEXT NOT NULL,
  total_messages INTEGER DEFAULT 0,
  incoming_messages INTEGER DEFAULT 0,
  outgoing_messages INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  bot_responses INTEGER DEFAULT 0,
  human_responses INTEGER DEFAULT 0,
  deals_created INTEGER DEFAULT 0,
  deals_won INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  avg_response_time REAL DEFAULT 0,
  alerts_generated INTEGER DEFAULT 0,
  leads_routed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, date),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- ACTIVITY_LOG (LOG DE ATIVIDADES)
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- =============================================
-- INDEXES PARA PERFORMANCE
-- =============================================

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_whatsapp ON vendors(whatsapp_number);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_vendor ON leads(assigned_vendor_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_vendor ON conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_chat ON conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stage ON conversations(stage);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_vendor ON messages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_vendor ON alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

-- Routing Logs
CREATE INDEX IF NOT EXISTS idx_routing_lead ON routing_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_routing_vendor ON routing_logs(to_vendor_id);
CREATE INDEX IF NOT EXISTS idx_routing_created ON routing_logs(created_at);

-- Deals
CREATE INDEX IF NOT EXISTS idx_deals_vendor ON deals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_chat ON deals(chat_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_vendor ON appointments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Statistics
CREATE INDEX IF NOT EXISTS idx_statistics_vendor ON statistics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(date);

-- Activity Log
CREATE INDEX IF NOT EXISTS idx_activity_vendor ON activity_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);

-- =============================================
-- CONFIGURAÇÕES PADRÃO
-- =============================================

INSERT OR IGNORE INTO bot_config (key, value, type, category, label, description) VALUES
-- Geral
('bot_enabled', 'true', 'boolean', 'general', 'Bot Ativo', 'Ativa ou desativa o bot globalmente'),
('platform_name', 'Zapper Clone', 'string', 'general', 'Nome da Plataforma', 'Nome exibido no sistema'),

-- IA e Qualificação
('gemini_enabled', 'true', 'boolean', 'ai', 'Gemini Ativo', 'Usa IA para qualificação de leads'),
('gemini_model', 'gemini-2.0-flash-lite', 'string', 'ai', 'Modelo Gemini', 'Modelo de IA utilizado'),
('qualification_interval', '3', 'number', 'ai', 'Intervalo de Qualificação', 'Qualifica a cada X mensagens'),
('auto_route_leads', 'true', 'boolean', 'ai', 'Roteamento Automático', 'Roteia leads automaticamente'),

-- Compliance
('compliance_enabled', 'true', 'boolean', 'compliance', 'Compliance Ativo', 'Monitora violações de compliance'),
('alert_forbidden_words', 'true', 'boolean', 'compliance', 'Alertar Palavras Proibidas', 'Detecta palavras proibidas'),
('alert_sensitive_data', 'true', 'boolean', 'compliance', 'Alertar Dados Sensíveis', 'Detecta CPF, cartão, etc'),
('alert_unprofessional', 'true', 'boolean', 'compliance', 'Alertar Linguagem Imprópria', 'Detecta palavrões'),

-- Notificações
('notify_new_lead', 'true', 'boolean', 'notifications', 'Notificar Novo Lead', 'Avisa vendedor de novo lead'),
('notify_hot_lead', 'true', 'boolean', 'notifications', 'Notificar Lead Quente', 'Avisa lead com alta urgência'),
('notify_via_whatsapp', 'true', 'boolean', 'notifications', 'Notificar via WhatsApp', 'Envia notificação no WhatsApp do vendedor'),

-- Roteamento
('routing_strategy', 'load_balance', 'string', 'routing', 'Estratégia de Roteamento', 'load_balance, round_robin, random'),
('max_leads_per_vendor', '50', 'number', 'routing', 'Máximo de Leads por Vendedor', 'Limite de leads ativos'),

-- Comportamento
('typing_simulation', 'true', 'boolean', 'behavior', 'Simular Digitação', 'Mostra "digitando..." antes de enviar'),
('min_response_delay', '1500', 'number', 'behavior', 'Delay Mínimo', 'Tempo mínimo antes de responder (ms)'),
('max_response_delay', '4000', 'number', 'behavior', 'Delay Máximo', 'Tempo máximo antes de responder (ms)');
