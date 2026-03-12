require('dotenv').config();
const { GatewayIntentBits, Client, Collection, Partials } = require("discord.js");
const express = require('express');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const colors = require("colors");

// --- INICIALIZAÇÃO DO EXPRESS (PRIORIDADE RENDER) ---
const app = express();
app.get('/', (req, res) => res.send('Xenza Bot Online'));
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(colors.cyan(`[SISTEMA] Porta ${port} aberta. Keep-alive pronto.`));
});

// --- CLIENTE COM PARTIALS (EVITA ERROS EM MSGS ANTIGAS) ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

client.setMaxListeners(100); // Aumentado levemente para suportar múltiplos handlers

// --- EXPORTAÇÃO DE INSTÂNCIAS ---
const estatisticasKingInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasKing = new estatisticasKingInstance();
module.exports = { client, EstatisticasKing }; // Exportando client para outras funções se necessário

// --- IMPORTAÇÃO DE FUNÇÕES E HANDLERS ---
const { AtivarIntents } = require("./Functions/StartIntents");
const { configuracao } = require("./DataBaseJson");
const { handleDeletedMessage, handleUpdatedMessage } = require('./Functions/MsgsLogs');
const { handleVoiceStateUpdate } = require('./Functions/VoiceLogs');
const { handleProfileUpdate } = require('./Functions/ProfileLog');
const { agendarRepostagem } = require('./Functions/repostagem');
const { sendMessage } = require('./Functions/MsgAutomatics');
const { TodosInvites } = require("./Eventos/Bot/Entrada");

const events = require('./Handler/events');
const slash = require('./Handler/slash');

// Inicialização de intents extras
AtivarIntents();

client.slashCommands = new Collection();

// --- INICIALIZAÇÃO DE HANDLERS ---
try {
    slash.run(client);
    events.run(client);
} catch (err) {
    console.error(colors.red("[ERRO] Falha ao carregar Handlers:"), err);
}

// --- EVENTO READY ---
client.on('ready', async () => {
    console.log(colors.green(`✅ Bot ${client.user.tag} conectado e pronto!`));
    
    // Atualiza invites no cache inicial
    try { await TodosInvites(client); } catch(e) {}

    // Inicialização das funções automáticas com delay para evitar sobrecarga
    setTimeout(() => {
        try {
            sendMessage(client);
            agendarRepostagem(client);
            console.log(colors.magenta("[SISTEMA] Funções automáticas iniciadas."));
        } catch (err) {
            console.error(colors.red("[ERRO] Falha nos loops automáticos:"), err.message);
        }
    }, 5000);
});

// --- TRATAMENTO DE ERROS GLOBAL (ANTI-CRASH 2.0) ---
process.on('unhandledRejection', (reason) => {
    const msg = reason?.message || "";
    if (msg.includes("Unexpected token '<'") || msg.includes("502") || msg.includes("504")) {
        return console.log(colors.yellow(`⚠️ [Xenza Alerta] Erro de conexão/API (HTML). Ignorado.`));
    }
    console.log(colors.red(`🚫 Erro Rejeitado:\n`), reason);
});

process.on('uncaughtException', (error) => {
    console.log(colors.red(`🚫 Erro Crítico (uncaughtException):\n`), error);
});

// --- GERENCIAMENTO DE GUILDAS (LIMITADOR) ---
client.on('guildCreate', async (guild) => {
    if (client.guilds.cache.size > 1) { 
        console.log(colors.red(`[AVISO] Tentativa de entrada em nova guilda: ${guild.name}. Saindo...`));
        try { await guild.leave(); } catch (e) { console.error('Erro ao sair:', e); }
    }
});

// --- SISTEMA DE LOGS ---
const getLogChannel = (type) => configuracao.get(`ConfigChannels.${type}`);

client.on('messageDelete', (message) => {
    const id = getLogChannel('mensagens');
    if (id) handleDeletedMessage(message, id, client);
});

client.on('messageUpdate', (oldM, newM) => {
    const id = getLogChannel('mensagens');
    if (id) handleUpdatedMessage(oldM, newM, id, client);
});

client.on('voiceStateUpdate', (oldS, newS) => {
    const id = getLogChannel('tráfego');
    if (id) handleVoiceStateUpdate(oldS, newS, id, client);
});

client.on('guildMemberUpdate', (oldM, newM) => {
    const id = getLogChannel('perfil');
    if (id) handleProfileUpdate(oldM, newM, id, client);
});

// --- EVENTOS DE INVITES ---
client.on('inviteCreate', () => TodosInvites(client));
client.on('inviteDelete', () => TodosInvites(client));

// --- RESET DE CARRINHOS (OTIMIZADO) ---
const cartPath = path.join(__dirname, 'DataBaseJson', 'carrinhos.json');
const resetCarrinhos = () => {
    fs.writeFileSync(cartPath, JSON.stringify({}, null, 2));
    console.log(colors.yellow('[SISTEMA] Banco de carrinhos resetado com sucesso!'));
};

schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, resetCarrinhos);

// --- LOGIN ---
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error(colors.bgRed(" ERRO: Variável TOKEN não configurada! "));
} else {
    client.login(TOKEN).catch(err => {
        console.error(colors.red("❌ Falha no login:"), err.message);
    });
}
