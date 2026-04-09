const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const path = require("path");
const fs = require("fs");
const express = require("express"); // Adicionado para manter o bot vivo no Render

// --- 1. MINI SERVIDOR PARA O RENDER (PORT BINDING) ---
// Isso impede o erro de "Port scan timeout" e "Timed Out"
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("🚀 Xenza V270 está online e operando.");
});

app.listen(PORT, () => {
    console.log(`📡 [REDE] Servidor de monitoramento aberto na porta ${PORT}`);
});

// --- 2. GESTÃO DE CONFIGURAÇÃO (TOKEN) ---
let config = {};
try {
    // Busca o config na raiz ou na src
    const configPath = fs.existsSync("./config.json") ? "./config.json" : "./src/config.json";
    config = require(configPath);
} catch (e) {
    console.log("⚠️ [SISTEMA] config.json não encontrado, usando Environment Variables.");
}

// Prioridade para o Render (Environment Variables), depois config.json
const TOKEN = process.env.TOKEN || config.token;

// --- 3. DATABASES E DEPENDÊNCIAS ---
// Certifique-se de que os nomes dos arquivos estão idênticos (Linux diferencia maiúsculas)
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

// --- 4. EXPORTAÇÃO CRUCIAL ---
// Exportamos ANTES dos handlers para que eles possam importar o client se necessário
module.exports = client;

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

// --- 5. CARREGAMENTO DOS HANDLERS (LOGICA BLINDADA) ---
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
                // Executa o handler conforme a exportação do arquivo
                if (typeof handler === 'function') {
                    handler(client);
                } else if (handler.run && typeof handler.run === 'function') {
                    handler.run(client);
                }
                
                console.log(`✅ [HANDLER] ${handlerName} carregado com sucesso.`);
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

// --- 6. SISTEMA ANTI-CRASH (ESSENCIAL PARA O RENDER) ---
process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️ [ANTI-CRASH] Rejeição detectada:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log('🔥 [ANTI-CRASH] Exceção fatal detectada:', err);
});

// --- 7. INICIALIZAÇÃO ---
if (!TOKEN || TOKEN === "") {
    console.error("❌ [ERRO] Token não localizado! Configure 'TOKEN' nas Environment Variables do Render.");
} else {
    client.login(TOKEN).then(() => {
        console.log(`
        --------------------------------------------------
        🚀 XENZA V270 - SISTEMA INICIALIZADO
        🤖 Bot: ${client.user.tag}
        🛠️ Ambiente: Render (Linux)
        --------------------------------------------------
        `);
    }).catch((err) => {
        console.error("❌ [ERRO] Falha no login da API do Discord:");
        console.error(err.message);
    });
}
