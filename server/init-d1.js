import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌐 Inicializando Cloudflare D1...\n');

// Validar credenciais
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !databaseId || !apiToken) {
    console.error('❌ Erro: Credenciais do Cloudflare não configuradas!');
    console.error('   Configure CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID e CLOUDFLARE_API_TOKEN no .env\n');
    process.exit(1);
}

const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;

// Função para executar query no D1
async function executeQuery(sql, params = []) {
    try {
        const response = await fetch(`${baseUrl}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql, params }),
        });

        const data = await response.json();

        if (!data.success) {
            const errorMsg = data.errors?.[0]?.message || 'Unknown error';
            throw new Error(errorMsg);
        }

        return data.result[0];
    } catch (error) {
        throw error;
    }
}

// Lê schema SQL
console.log('📄 Lendo schema-d1.sql...');
const schema = readFileSync(join(__dirname, 'schema-d1.sql'), 'utf-8');

// Divide em statements individuais (separados por ponto e vírgula)
const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📊 Encontrados ${statements.length} statements SQL\n`);

// Executa cada statement
let created = 0;
let skipped = 0;
let errors = 0;

for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Mostra progresso
    const progress = Math.round(((i + 1) / statements.length) * 100);
    process.stdout.write(`\r⏳ Executando... ${progress}% (${i + 1}/${statements.length})`);

    try {
        await executeQuery(statement);
        created++;
    } catch (error) {
        if (error.message.includes('already exists')) {
            skipped++;
        } else {
            errors++;
            console.error(`\n❌ Erro no statement ${i + 1}:`, error.message);
        }
    }
}

console.log('\n');
console.log('✅ Inicialização concluída!');
console.log(`   📊 ${created} statements executados com sucesso`);
if (skipped > 0) {
    console.log(`   ⏭️  ${skipped} statements ignorados (já existiam)`);
}
if (errors > 0) {
    console.log(`   ❌ ${errors} erros encontrados`);
}

// Verifica tabelas criadas
console.log('\n📋 Verificando tabelas criadas...');
try {
    const result = await executeQuery("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tables = result.results || [];

    console.log(`\n✅ ${tables.length} tabelas encontradas:`);
    tables.forEach(t => console.log(`   - ${t.name}`));

    console.log('\n🎉 Cloudflare D1 inicializado com sucesso!');
    console.log('   Agora você pode iniciar o servidor:\n');
    console.log('   npm run server\n');
} catch (error) {
    console.error('\n❌ Erro ao verificar tabelas:', error.message);
    process.exit(1);
}
