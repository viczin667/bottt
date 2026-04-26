const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const path = require("path");
const fs = require("fs");
const express = require("express");

// --- 1. MINI SERVIDOR PARA O RENDER (MANTIDO) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("🚀 Xenza V270 está online e operando.");
});

app.listen(PORT, () => {
    console.log(`📡 [REDE] Servidor de monitoramento aberto na porta ${PORT}`);
});

// --- 2. GESTÃO DE CONFIGURAÇÃO (BLINDADA) ---
let config = {};
try {
    // Mantida a lógica de busca original (raiz ou src)
    const configPath = fs.existsSync("./config.json") ? "./config.json" : "./src/config.json";
    if (fs.existsSync(configPath)) {
        config = require(configPath);
    }
} catch (e) {
    console.log("⚠️ [SISTEMA] Erro ao ler config.json, usando Environment Variables.");
}

const TOKEN = process.env.TOKEN || config.token;

// --- 3. DATABASES E DEPENDÊNCIAS (TODAS MANTIDAS) ---
// Importando exatamente como no seu código original
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

// --- 4. EXPORTAÇÃO (MANTIDA ANTES DOS HANDLERS) ---
module.exports = client;

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// --- 5. CARREGAMENTO DOS HANDLERS (OTIMIZADO MAS INTEGRAL) ---
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
                // Executa conforme a sua lógica original de exportação
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

// --- 6. SISTEMA ANTI-CRASH (ESSENCIAL) ---
process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️ [ANTI-CRASH] Rejeição detectada:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log('🔥 [ANTI-CRASH] Exceção fatal detectada:', err);
});

// --- 7. INICIALIZAÇÃO ---
if (!TOKEN) {
    console.error("❌ [ERRO] Token não localizado! Configure no Render ou no config.json.");
} else {
    client.login(TOKEN).then(() => {
        console.log(`
        --------------------------------------------------
        🚀 XENZA V270 - SISTEMA INICIALIZADO
        🤖 Bot: ${client.user.tag}
        🛠️ Ambiente: ${process.env.RENDER ? 'Render (Linux)' : 'Local (Xeon)'}
        --------------------------------------------------
        `);
    }).catch((err) => {
        console.error("❌ [ERRO] Falha no login:");
        console.error(err.message);
    });
}
