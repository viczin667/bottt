require('dotenv').config();
const { GatewayIntentBits, Client, Collection, ChannelType } = require("discord.js");
const express = require('express');
const app = express();
const { AtivarIntents } = require("./Functions/StartIntents");
const { configuracao, carrinhos } = require("./DataBaseJson");
const { handleDeletedMessage, handleUpdatedMessage } = require('./Functions/MsgsLogs');
const { handleVoiceStateUpdate } = require('./Functions/VoiceLogs');
const { handleProfileUpdate } = require('./Functions/ProfileLog');
const { agendarRepostagem } = require('./Functions/repostagem');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const colors = require("colors");

// --- MANTER ONLINE NA RENDER (KEEP-ALIVE) ---
app.get('/', (req, res) => res.send('Xenza Bot Online'));
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(colors.cyan(`[SISTEMA] Porta ${port} aberta.`)));

// --- INICIALIZAÇÃO DO CLIENTE (ORIGINAL) ---
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
});

// Aumentando limite de listeners para evitar o erro do log anterior
client.setMaxListeners(50); 

const estatisticasKingInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasKing = new estatisticasKingInstance();
module.exports = { EstatisticasKing };
const { sendMessage } = require('./Functions/MsgAutomatics');

AtivarIntents();

const config = require("./config.json");
const events = require('./Handler/events');
const slash = require('./Handler/slash');

client.on('ready', () => {
  console.log(colors.green('Bot conectado e pronto!'));
  sendMessage(client);
  agendarRepostagem(client);
});

slash.run(client);
events.run(client);

client.slashCommands = new Collection();

// --- LIDANDO COM ERROS (ORIGINAL) ---
process.on('unhandledRejection', (reason, promise) => {
  console.log(colors.red(`🚫 Erro Detectado:\n\n`), reason, promise);
});
process.on('uncaughtException', (error, origin) => {
  console.log(colors.red(`🚫 Erro Detectado:\n\n`), error, origin);
});
process.on('uncaughtExceptionMonitor', (error, origin) => {
  console.log(colors.red(`🚫 Erro Detectado:\n\n`), error, origin);
});

// --- LOGIN DO BOT (SEGURANÇA ATUALIZADA) ---
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  if (err?.message?.includes("intent")) return console.log(`${colors.red(`[LOG]`)} Intents inválidas!`);
  if (err?.message?.includes("invalid")) return console.log(`${colors.red(`[LOG]`)} Token inválido!`);
});

// --- GERENCIAMENTO DE GUILDAS (ORIGINAL) ---
client.on('guildCreate', async (guild) => {
  if (client.guilds.cache?.size > 1) { 
    try {
      await guild.leave();
      console.log(`Saiu da guilda: ${guild.name}`);
    } catch (error) {
      console.error('Erro ao sair da guilda:', error);
    }
  }
});

// --- ACESSO AOS IDS DE CANAIS (ORIGINAL) ---
const messageLogChannelId = configuracao.get(`ConfigChannels.mensagens`);
const trafficLogChannelId = configuracao.get(`ConfigChannels.tráfego`);
const profileLogChannelId = configuracao.get(`ConfigChannels.perfil`);

if (!messageLogChannelId || messageLogChannelId === "") console.warn('Aviso: ID do canal de logs de mensagens não configurado.');
if (!trafficLogChannelId || trafficLogChannelId === "") console.warn('Aviso: ID do canal de logs de tráfego não configurado.');
if (!profileLogChannelId || profileLogChannelId === "") console.warn('Aviso: ID do canal de logs de perfil não configurado.');

// --- EVENTOS DE MENSAGENS E VOZ (ORIGINAL) ---
client.on('messageDelete', (message) => {
  if (messageLogChannelId) handleDeletedMessage(message, messageLogChannelId, client);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (messageLogChannelId) handleUpdatedMessage(oldMessage, newMessage, messageLogChannelId, client);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (trafficLogChannelId) handleVoiceStateUpdate(oldState, newState, trafficLogChannelId, client);
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (profileLogChannelId) handleProfileUpdate(oldMember, newMember, profileLogChannelId, client);
});

// --- GERENCIAMENTO DE CONVITES (ORIGINAL) ---
const { TodosInvites } = require("./Eventos/Bot/Entrada");

client.on('inviteCreate', async () => {
  await TodosInvites(client);
});

client.on('inviteDelete', async () => {
  await TodosInvites(client);
});

// --- RESET DE CARRINHOS (ORIGINAL) ---
const filePath = path.join(__dirname, './DataBaseJson', 'carrinhos.json');

function resetCarrinhos() {
  const data = {};
  fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever no arquivo:', err);
    } else {
      console.log(colors.yellow('[Reset carrinhos.json] Carrinhos zerados com sucesso!'));
    }
  });
}

// Agendamento original mantido (05:55 AM)
const job = schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, () => {
  resetCarrinhos();
});
schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, resetCarrinhos);
// No final do seu index.js
const token = process.env.TOKEN || process.env.TOKEN;

if (!token) {
    console.error("ERRO: Token não encontrado! Verifique as variáveis no Render.");
} else {
    client.login(token).catch(err => {
        console.error("Erro ao fazer login no Discord:", err);
    });
}
