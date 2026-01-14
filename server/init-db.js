import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🗄️  Inicializando banco de dados SQLite...\n');

// Cria banco de dados
const db = new Database(join(__dirname, 'database.sqlite'));

// Lê schema SQL
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

// Divide em statements individuais
const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

// Executa cada statement
let created = 0;
for (const statement of statements) {
    try {
        db.exec(statement);
        created++;
    } catch (error) {
        if (!error.message.includes('already exists')) {
            console.error('❌ Erro ao executar statement:', error.message);
        }
    }
}

console.log(`✅ Banco de dados criado com sucesso!`);
console.log(`📊 ${created} tabelas/índices criados\n`);

// Verifica tabelas criadas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Tabelas criadas:');
tables.forEach(t => console.log(`   - ${t.name}`));

console.log('\n🎉 Pronto! Agora você pode iniciar o servidor:\n');
console.log('   node server/index.js\n');

db.close();
