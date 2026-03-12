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

// --- INICIALIZAÇÃO DO CLIENTE ---
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

client.setMaxListeners(50); 

const estatisticasKingInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasKing = new estatisticasKingInstance();
module.exports = { EstatisticasKing };
const { sendMessage } = require('./Functions/MsgAutomatics');

AtivarIntents();

const config = require("./config.json");
const events = require('./Handler/events');
const slash = require('./Handler/slash');

// --- EVENTO READY ---
client.on('ready', () => {
  console.log(colors.green(`✅ Bot ${client.user.tag} conectado e pronto!`));
  
  // Inicialização das funções automáticas
  try {
    sendMessage(client);
    agendarRepostagem(client);
  } catch (err) {
    console.error(colors.red("[ERRO] Falha ao iniciar loops automáticos:"), err.message);
  }
});

slash.run(client);
events.run(client);
client.slashCommands = new Collection();

// --- TRATAMENTO DE ERROS (ANTI-CRASH) ---
// Corrigido para ignorar o erro de JSON/HTML que estava derrubando a Xenza
process.on('unhandledRejection', (reason, promise) => {
  if (reason?.message?.includes("Unexpected token '<'")) {
    console.log(colors.yellow(`⚠️ [Xenza Alerta] Uma requisição retornou HTML em vez de JSON. Ignorando para evitar queda.`));
  } else {
    console.log(colors.red(`🚫 Erro Detectado (unhandledRejection):\n`), reason);
  }
});

process.on('uncaughtException', (error, origin) => {
  console.log(colors.red(`🚫 Erro Detectado (uncaughtException):\n`), error);
});

// --- GERENCIAMENTO DE GUILDAS ---
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

// --- CONFIGURAÇÃO DE LOGS ---
const messageLogChannelId = configuracao.get(`ConfigChannels.mensagens`);
const trafficLogChannelId = configuracao.get(`ConfigChannels.tráfego`);
const profileLogChannelId = configuracao.get(`ConfigChannels.perfil`);

if (!messageLogChannelId) console.warn(colors.yellow('Aviso: Canal de mensagens não configurado.'));
if (!trafficLogChannelId) console.warn(colors.yellow('Aviso: Canal de tráfego não configurado.'));
if (!profileLogChannelId) console.warn(colors.yellow('Aviso: Canal de perfil não configurado.'));

// --- EVENTOS DE MENSAGENS E VOZ ---
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

// --- GERENCIAMENTO DE CONVITES ---
const { TodosInvites } = require("./Eventos/Bot/Entrada");
client.on('inviteCreate', async () => await TodosInvites(client));
client.on('inviteDelete', async () => await TodosInvites(client));

// --- RESET DE CARRINHOS (05:55 AM) ---
const filePath = path.join(__dirname, './DataBaseJson', 'carrinhos.json');
function resetCarrinhos() {
  const data = {};
  fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
    if (err) {
      console.error('Erro ao resetar carrinhos.json:', err);
    } else {
      console.log(colors.yellow('[SISTEMA] Carrinhos zerados com sucesso (Agendamento)!'));
    }
  });
}

schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, resetCarrinhos);

// --- LOGIN ÚNICO (ESTRUTURA FINAL) ---
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.error(colors.bgRed(" ERRO: Token não encontrado! Verifique as variáveis de ambiente na Render. "));
} else {
    client.login(TOKEN).catch((err) => {
        if (err?.message?.includes("intent")) {
            console.log(`${colors.red(`[LOG]`)} Intents inválidas! Ative-as no Portal do Desenvolvedor.`);
        } else if (err?.message?.includes("invalid")) {
            console.log(`${colors.red(`[LOG]`)} Token inválido!`);
        } else {
            console.error(colors.red("Erro ao fazer login no Discord:"), err.message);
        }
    });
}
