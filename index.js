const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } = require("discord.js");
const config = require("./config.json");
const { produtos, configuracao, Emojis } = require("./DataBaseJson"); // Puxando suas bases originais
const { QuickDB } = require("quick.db");
const db = new QuickDB();

// --- INICIALIZAÇÃO DO CLIENT (CONFIGURAÇÃO ORIGINAL) ---
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

// Exportação essencial para que as Functions consigam ler o Client
module.exports = client;

// --- COLEÇÕES ORIGINAIS ---
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// --- CARREGAMENTO DOS HANDLERS (O CORAÇÃO DO BOT) ---
// Certifique-se de que as pastas 'commands' e 'events' estão na raiz ou dentro da 'src'
["commands", "events", "slash"].forEach(handler => {
    try {
        require(`./handlers/${handler}`)(client);
    } catch (err) {
        console.log(`❌ Erro ao carregar handler: ${handler} | Erro: ${err.message}`);
    }
});

// --- SISTEMA ANTI-CRASH (FUNDAMENTAL PARA O RENDER) ---
// Isso impede que o bot caia se houver um erro de API ou de Database
process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️ Erro Detectado (unhandledRejection):', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log('🔥 Erro Crítico (uncaughtException):', err);
});

// --- LOGIN COM STATUS ---
client.login(config.token).then(() => {
    console.log(`
    --------------------------------------------------
    🚀 XENZA - SISTEMA INICIALIZADO COM SUCESSO
    🤖 Bot: ${client.user.tag}
    📅 Data: ${new Date().toLocaleString('pt-BR')}
    --------------------------------------------------
    `);
}).catch((err) => {
    console.error("❌ Falha ao iniciar o bot. Verifique o Token no config.json.");
});
