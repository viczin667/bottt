const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const path = require("path");
const fs = require("fs");
const colors = require("colors");

// --- 1. CARREGAMENTO DO CONFIG (BLINDADO) ---
let config;
try {
    // Tenta carregar da raiz ou da pasta src
    const configPath = fs.existsSync("./config.json") ? "./config.json" : "./src/config.json";
    config = require(configPath);
} catch (e) {
    console.log(colors.yellow("⚠️ config.json não encontrado. Usando Variáveis de Ambiente (Process.env)."));
    config = { token: process.env.TOKEN }; 
}

// --- 2. IMPORTAÇÃO DAS DATABASES ORIGINAIS ---
// Ajuste os nomes dos arquivos se houver diferença de maiúsculas/minúsculas
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

// Exportação imediata para evitar erro de 'Module Not Found' em outros arquivos
module.exports = client;

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// --- 3. CARREGAMENTO DOS HANDLERS (SISTEMA RASTREADOR) ---
const handlersToLoad = ["commands", "events", "slash"];

handlersToLoad.forEach(handlerName => {
    // Tenta localizar a pasta 'handlers' na raiz ou dentro de 'src'
    const possiblePaths = [
        path.join(__dirname, "handlers", `${handlerName}.js`),
        path.join(__dirname, "src", "handlers", `${handlerName}.js`)
    ];

    let loaded = false;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            try {
                const handler = require(p);
                // Executa o handler passando o client
                if (typeof handler === 'function') {
                    handler(client);
                } else if (handler.run && typeof handler.run === 'function') {
                    handler.run(client);
                }
                
                console.log(colors.green(`✅ [HANDLER] ${handlerName.toUpperCase()} carregado com sucesso.`));
                loaded = true;
                break; 
            } catch (err) {
                console.log(colors.red(`❌ [ERRO] Falha no arquivo ${handlerName}: ${err.message}`));
            }
        }
    }

    if (!loaded) {
        console.log(colors.red(`⚠️ [AVISO] O handler '${handlerName}' não foi encontrado.`));
    }
});

// --- 4. PROTEÇÃO ANTI-CRASH (BLINDAGEM CONTRA QUEDAS) ---
process.on('unhandledRejection', (reason, promise) => {
    console.log(colors.red('⚠️ Erro Rejeitado (unhandledRejection):'), reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log(colors.red('🔥 Erro Crítico (uncaughtException):'), err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(colors.red('🛡️ Monitor de Exceção:'), err);
});

// --- 5. LOGIN E STATUS ---
if (!config.token || config.token === "") {
    console.error(colors.bgRed("❌ ERRO FATAL: TOKEN NÃO CONFIGURADO! Verifique o config.json ou o Render."));
} else {
    client.login(config.token).then(() => {
        console.log(colors.cyan(`
        ╔══════════════════════════════════════════════════╗
        ║        XENZA - SISTEMA OPERACIONAL          ║
        ║        STATUS: ONLINE E PROTEGIDO                ║
        ║        BOT: ${client.user.tag.padEnd(28)} ║
        ╚══════════════════════════════════════════════════╝
        `));
    }).catch((err) => {
        console.error(colors.red("❌ Falha no login: Token inválido ou Intent de MessageContent desativada no Portal Developer."));
    });
}
