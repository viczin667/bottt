const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const path = require("path");
const fs = require("fs");
const express = require("express");

// --- 1. MONITORAMENTO (KEEP ALIVE) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({ 
        status: "online", 
        version: "V270", 
        uptime: process.uptime().toFixed(2) + "s" 
    });
});

app.listen(PORT, () => {
    console.log(`📡 [REDE] Porta ${PORT} vinculada com sucesso.`);
});

// --- 2. CONFIGURAÇÃO (FLEXÍVEL) ---
// Função para carregar token sem travar o sistema
const getAuth = () => {
    if (process.env.TOKEN) return process.env.TOKEN;
    const configPath = ["./config.json", "./src/config.json"].find(p => fs.existsSync(p));
    return configPath ? require(configPath).token : null;
};

const TOKEN = getAuth();

// --- 3. CLIENT SETUP ---
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

// Collections para comandos
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// Exportação do client para ser usado nos handlers
module.exports = client;

// --- 4. HANDLERS DINÂMICOS ---
const loadHandlers = () => {
    const categories = ["commands", "events", "slash"];
    
    categories.forEach(handlerName => {
        // Busca inteligente de caminhos (Prioriza pasta src se existir)
        const possiblePaths = [
            path.join(__dirname, "src", "handlers", `${handlerName}.js`),
            path.join(__dirname, "handlers", `${handlerName}.js`)
        ];

        const activePath = possiblePaths.find(p => fs.existsSync(p));

        if (activePath) {
            try {
                const handler = require(activePath);
                if (typeof handler === 'function') {
                    handler(client);
                } else if (handler.run) {
                    handler.run(client);
                }
                console.log(`✅ [${handlerName.toUpperCase()}] Carregado: ${path.basename(activePath)}`);
            } catch (err) {
                console.error(`❌ [ERRO] Falha no handler '${handlerName}':\n`, err);
            }
        } else {
            console.warn(`⚠️ [AVISO] Handler '${handlerName}' não localizado.`);
        }
    });
};

loadHandlers();

// --- 5. SISTEMA ANTI-CRASH (BLINDAGEM TOTAL) ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [ANTI-CRASH] Rejeição não tratada em:', promise, 'razão:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error('🔥 [ANTI-CRASH] Exceção fatal em:', origin, '\nErro:', err);
});

// --- 6. INICIALIZAÇÃO ---
if (!TOKEN) {
    console.error("❌ [ERRO FATAL] Token não configurado! Verifique o Render (Env Vars) ou o config.json.");
    process.exit(1); // Fecha o processo com erro
} else {
    client.login(TOKEN).catch((err) => {
        console.error("❌ [ERRO] Login na API do Discord falhou:");
        console.error(err.message);
    });
}

client.once('ready', () => {
    console.log(`
    ==================================================
    🚀 XENZA V270 - SISTEMA ATIVO
    🤖 Logado como: ${client.user.tag}
    💻 Host: ${process.env.RENDER ? 'Render Cloud' : 'Local/Xeon Server'}
    ==================================================
    `);
});
