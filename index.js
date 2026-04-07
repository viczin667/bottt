const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const path = require("path");
const fs = require("fs");

// --- 1. GESTÃO DE CONFIGURAÇÃO (TOKEN) ---
// Se o token não está no config.json, ele DEVE estar no process.env.TOKEN do Render
let config = {};
try {
    config = require("./config.json");
} catch (e) {
    console.log("⚠️ [SISTEMA] config.json ausente, lendo variáveis de ambiente.");
}

const TOKEN = process.env.TOKEN || config.token;

// --- 2. DATABASES E DEPENDÊNCIAS ---
// Certifique-se de que o arquivo se chama exatamente 'DataBaseJson.js' (Linux é case-sensitive)
const { produtos, configuracao, Emojis } = require("./DataBaseJson"); 
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ],
});

// --- 3. EXPORTAÇÃO CRUCIAL ---
// Exportamos o client ANTES de carregar os handlers para evitar Circular Dependency
module.exports = client;

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// --- 4. CARREGAMENTO DOS HANDLERS (LOGICA BLINDADA) ---
["commands", "events", "slash"].forEach(handlerName => {
    const searchPaths = [
        path.join(__dirname, "handlers", `${handlerName}.js`),
        path.join(__dirname, "src", "handlers", `${handlerName}.js`)
    ];

    let loaded = false;
    for (const p of searchPaths) {
        if (fs.existsSync(p)) {
            try {
                const handler = require(p);
                // Executa o handler (seja exportado como função direta ou objeto com .run)
                if (typeof handler === 'function') {
                    handler(client);
                } else if (handler.run && typeof handler.run === 'function') {
                    handler.run(client);
                }
                
                console.log(`✅ [HANDLER] ${handlerName} carregado de: ${p}`);
                loaded = true;
                break; 
            } catch (err) {
                console.log(`❌ [ERRO] Falha interna no handler '${handlerName}': ${err.message}`);
                console.error(err.stack);
            }
        }
    }

    if (!loaded) {
        console.log(`⚠️ [AVISO] O handler '${handlerName}' não foi encontrado.`);
    }
});

// --- 5. SISTEMA ANTI-CRASH (ESSENCIAL PARA O RENDER) ---
process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️ [ANTI-CRASH] Rejeição não tratada:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log('🔥 [ANTI-CRASH] Exceção fatal:', err);
});

// --- 6. INICIALIZAÇÃO ---
if (!TOKEN) {
    console.error("❌ [ERRO] Token não localizado! Configure no Render (Environment Variables).");
} else {
    client.login(TOKEN).then(() => {
        console.log(`
        --------------------------------------------------
        🚀 XENZA - SISTEMA INICIALIZADO
        🤖 Bot: ${client.user.tag}
        🛠️ Modo: Produção (Render/Linux)
        --------------------------------------------------
        `);
    }).catch((err) => {
        console.error("❌ [ERRO] Falha no login da API:");
        console.error(err.message);
    });
}
