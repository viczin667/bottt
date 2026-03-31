require('dotenv').config();
const { GatewayIntentBits, Client, Collection, Partials } = require("discord.js");
const express = require('express');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const colors = require("colors");
const axios = require('axios'); // Necessário para o auto-ping

// --- INICIALIZAÇÃO DO EXPRESS (AJUSTADO PARA RENDER) ---
const app = express();
const port = process.env.PORT || 10000; // Render usa a 10000 por padrão

app.get('/', (req, res) => {
    res.status(200).send('Xenza System Online');
});

app.listen(port, '0.0.0.0', () => {
    console.log(colors.cyan(`[SISTEMA] Porta ${port} aberta. Keep-alive pronto.`));
});

// --- CLIENTE COM INTENTS COMPLETAS E PARTIALS ---
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
        GatewayIntentBits.GuildPresences, // Adicionado para rastrear status
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User, 
        Partials.GuildMember,
        Partials.DirectMessages // Adicionado para garantir logs de DM
    ]
});

client.setMaxListeners(0); // Remove o limite para evitar avisos de memory leak em bots grandes

// --- EXPORTAÇÃO DE INSTÂNCIAS ---
const estatisticasKingInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasKing = new estatisticasKingInstance();
module.exports = { client, EstatisticasKing };

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

    // Inicialização das funções automáticas
    setTimeout(() => {
        try {
            sendMessage(client);
            agendarRepostagem(client);
            console.log(colors.magenta("[SISTEMA] Funções automáticas iniciadas."));
        } catch (err) {
            console.error(colors.red("[ERRO] Falha nos loops automáticos:"), err.message);
        }
    }, 5000);

    // AUTO-PING PARA EVITAR SLEEP DO RENDER
    setInterval(async () => {
        try {
            const url = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
            if (process.env.RENDER_EXTERNAL_HOSTNAME) {
                await axios.get(url);
                console.log(colors.gray(`[KEEP-ALIVE] Ping enviado para manter o bot acordado.`));
            }
        } catch (e) {
            // Silencioso para não poluir o log
        }
    }, 280000); // A cada 4.6 minutos
});

// --- TRATAMENTO DE ERROS GLOBAL (ANTI-CRASH 3.0) ---
process.on('unhandledRejection', (reason) => {
    const msg = reason?.message || "";
    if (msg.includes("Unexpected token '<'") || msg.includes("502") || msg.includes("504") || msg.includes("429")) {
        return console.log(colors.yellow(`⚠️ [Xenza Alerta] API Discord instável ou IP Bloqueado (429/HTML). Ignorado.`));
    }
    console.log(colors.red(`🚫 Erro Rejeitado:\n`), reason);
});

process.on('uncaughtException', (error) => {
    if (error.message.includes("ECONNRESET")) return; // Ignora quedas de rede comuns
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
    if (fs.existsSync(cartPath)) {
        fs.writeFileSync(cartPath, JSON.stringify({}, null, 2));
        console.log(colors.yellow('[SISTEMA] Banco de carrinhos resetado com sucesso!'));
    }
};

schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, resetCarrinhos);

// --- LOGIN ---
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error(colors.bgRed(" ERRO: Variável TOKEN não configurada no Render! "));
} else {
    client.login(TOKEN).catch(err => {
        if (err.message.includes("Used disallowed intents")) {
            console.error(colors.red("❌ ERRO: Você precisa ativar 'GUILD_MEMBERS' e 'MESSAGE_CONTENT' no Discord Developer Portal!"));
        } else {
            console.error(colors.red("❌ Falha no login:"), err.message);
        }
    });
}
