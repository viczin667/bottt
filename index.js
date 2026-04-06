const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const path = require("path");
const fs = require("fs");

// --- TENTATIVA DE LER CONFIG ---
let config;
try {
    config = require("./config.json");
} catch (e) {
    console.log("⚠️ Arquivo config.json não encontrado na raiz, tentando caminhos alternativos...");
    // Tenta ler das variáveis de ambiente do Render se o config.json falhar
    config = { token: process.env.TOKEN }; 
}

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

module.exports = client;

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// --- CARREGAMENTO DOS HANDLERS (SISTEMA DE BUSCA AUTOMÁTICA) ---
["commands", "events", "slash"].forEach(handlerName => {
    // Lista de caminhos possíveis onde seus arquivos podem estar
    const possiblePaths = [
        path.join(__dirname, "handlers", `${handlerName}.js`),
        path.join(__dirname, "src", "handlers", `${handlerName}.js`)
    ];

    let loaded = false;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            try {
                require(p)(client);
                console.log(`✅ Handler carregado: ${handlerName} (Local: ${p})`);
                loaded = true;
                break; 
            } catch (err) {
                console.log(`❌ Erro interno no arquivo ${handlerName}: ${err.message}`);
            }
        }
    }

    if (!loaded) {
        console.log(`⚠️ Aviso: Handler '${handlerName}' não encontrado em nenhum dos caminhos padrão.`);
    }
});

// --- SISTEMA ANTI-CRASH ---
process.on('unhandledRejection', (reason) => {
    console.log('⚠️ Erro Detectado (Rejeição):', reason);
});

process.on('uncaughtException', (err) => {
    console.log('🔥 Erro Crítico (Exceção):', err);
});

// --- LOGIN ---
if (!config.token || config.token === "") {
    console.error("❌ ERRO: O Token do bot não foi configurado!");
} else {
    client.login(config.token).then(() => {
        console.log(`
        --------------------------------------------------
        🚀 XENZA - SISTEMA INICIALIZADO COM SUCESSO
        🤖 Bot: ${client.user.tag}
        --------------------------------------------------
        `);
    }).catch((err) => {
        console.error("❌ Falha no login: Token inválido ou bloqueado pela Discord API.");
    });
}
