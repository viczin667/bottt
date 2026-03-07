require('dotenv').config(); // Carrega as variáveis do arquivo .env
const { GatewayIntentBits, Client, Collection, ChannelType } = require("discord.js");
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

const estatisticasKingInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasKing = new estatisticasKingInstance();
module.exports = { EstatisticasKing };
const { sendMessage } = require('./Functions/MsgAutomatics');

// Configurações carregadas do JSON (IDs de canais e Owners)
const config = require("./config.json");

AtivarIntents();

const events = require('./Handler/events');
const slash = require('./Handler/slash');

client.on('ready', () => {
  console.log(colors.green(`[SISTEMA] Bot conectado como ${client.user.tag}`));
  sendMessage(client);
  agendarRepostagem(client);
});

slash.run(client);
events.run(client);

client.slashCommands = new Collection();
client.setMaxListeners(40);

// Tratamento de Erros Global
process.on('unhandledRejection', (reason, promise) => {
  console.log(colors.red(`🚫 Erro Detectado (Rejection):`), reason);
});
process.on('uncaughtException', (error, origin) => {
  console.log(colors.red(`🚫 Erro Detectado (Exception):`), error);
});

// Login do bot usando Variável de Ambiente para Segurança
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  if (err?.message?.includes("intent")) return console.log(colors.red(`[ERRO] Intents inválidas!`));
  if (err?.message?.includes("invalid")) return console.log(colors.red(`[ERRO] Token inválido ou expirado!`));
});

// Gerenciamento de Guildas (Permitir apenas se configurado)
client.on('guildCreate', async (guild) => {
  // Se o bot entrar em um servidor e não for do interesse do Admin, ele sai.
  // Você pode controlar isso via config.json sem mexer aqui.
  if (client.guilds.cache.size > 1) { 
    try {
      await guild.leave();
      console.log(colors.yellow(`[AVISO] Saiu automaticamente da guilda: ${guild.name}`));
    } catch (error) {
      console.error('Erro ao sair da guilda:', error);
    }
  }
});

// Canais de Log
const messageLogChannelId = configuracao.get(`ConfigChannels.mensagens`);
const trafficLogChannelId = configuracao.get(`ConfigChannels.tráfego`);
const profileLogChannelId = configuracao.get(`ConfigChannels.perfil`);

// Eventos de Monitoramento
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

// Gerenciamento de Convites
const { TodosInvites } = require("./Eventos/Bot/Entrada");
client.on('inviteCreate', async () => await TodosInvites(client));
client.on('inviteDelete', async () => await TodosInvites(client));

// Reset Diário de Carrinhos (05:55 AM)
const filePath = path.join(__dirname, './DataBaseJson', 'carrinhos.json');
function resetCarrinhos() {
  fs.writeFile(filePath, JSON.stringify({}), 'utf8', (err) => {
    if (err) return console.error('Erro ao resetar carrinhos:', err);
    console.log(colors.cyan('[DATABASE] Carrinhos zerados com sucesso!'));
  });
}

schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, resetCarrinhos);