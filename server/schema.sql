-- ==================== VENDORS (Vendedores Monitorados) ====================
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  department TEXT,
  status TEXT DEFAULT 'disconnected', -- online, offline, connecting, disconnected
  last_seen DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1
);

-- ==================== LEADS ====================
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  company TEXT,
  score INTEGER DEFAULT 0, -- Score de qualificação (0-100)
  temperature TEXT DEFAULT 'cold', -- hot, warm, cold
  intent TEXT, -- Intenção detectada pela IA
  assigned_vendor_id TEXT, -- Vendedor atribuído
  routed_at DATETIME, -- Quando foi roteado
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  tags TEXT,
  notes TEXT,
  FOREIGN KEY (assigned_vendor_id) REFERENCES vendors(id)
);

-- ==================== CONVERSATIONS ====================
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  chat_id TEXT NOT NULL UNIQUE,
  chat_type TEXT DEFAULT 'private', -- private, group, channel
  is_bot_active INTEGER DEFAULT 1,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- ==================== MESSAGES ====================
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  message_id TEXT,
  vendor_id TEXT, -- Vendedor que enviou/recebeu a mensagem
  direction TEXT NOT NULL, -- inbound, outbound
  message_text TEXT,
  intent TEXT,
  confidence REAL,
  entities TEXT,
  is_bot_response INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- ==================== ALERTS (Alertas de Compliance) ====================
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id TEXT NOT NULL,
  lead_id INTEGER,
  message_id INTEGER,
  type TEXT NOT NULL, -- forbidden_word, sensitive_data, script_violation, etc.
  severity TEXT DEFAULT 'medium', -- low, medium, high
  title TEXT NOT NULL,
  description TEXT,
  context TEXT, -- JSON com contexto da conversa
  status TEXT DEFAULT 'pending', -- pending, resolved, dismissed
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- ==================== ROUTING LOGS ====================
CREATE TABLE IF NOT EXISTS routing_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  from_vendor_id TEXT,
  to_vendor_id TEXT NOT NULL,
  reason TEXT,
  lead_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (from_vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (to_vendor_id) REFERENCES vendors(id)
);

-- ==================== BOT CONFIG ====================
CREATE TABLE IF NOT EXISTS bot_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== STATISTICS ====================
CREATE TABLE IF NOT EXISTS statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  total_messages INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  bot_responses INTEGER DEFAULT 0,
  avg_response_time REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);

-- ==================== INDEXES ====================

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_vendor ON leads(assigned_vendor_id);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_vendor_id ON messages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_vendor_id ON alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- Routing Logs
CREATE INDEX IF NOT EXISTS idx_routing_lead_id ON routing_logs(lead_id);

-- Statistics
CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(date);

-- ==================== DEFAULT CONFIG ====================

INSERT OR IGNORE INTO bot_config (key, value, description) VALUES
('bot_enabled', 'true', 'Bot está ativo globalmente');

INSERT OR IGNORE INTO bot_config (key, value, description) VALUES
('respond_to_groups', 'false', 'Responder em grupos');

INSERT OR IGNORE INTO bot_config (key, value, description) VALUES
('respond_to_channels', 'false', 'Responder em canais');

INSERT OR IGNORE INTO bot_config (key, value, description) VALUES
('auto_save_leads', 'true', 'Salvar contatos automaticamente como leads');
