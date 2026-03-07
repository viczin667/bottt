const { EmbedBuilder } = require('discord.js');
const { configuracao, Emojis } = require("../DataBaseJson");

const voiceJoinTimestamps = new Map();

async function handleVoiceStateUpdate(oldState, newState, logChannelId, client) {
    try {
        if (!logChannelId || logChannelId === "null") return;
        const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
        if (!logChannel) return;

        const member = newState.member;
        const userAvatar = member.user.avatarURL({ dynamic: true, size: 512 });
        const usernameWithTag = `${member.user.tag}`;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setAuthor({ name: usernameWithTag, iconURL: userAvatar })
            .setTimestamp();

        const newChannel = newState.channel ? `<#${newState.channel.id}>` : "Nenhum canal";
        const oldChannel = oldState.channel ? `<#${oldState.channel.id}>` : "Nenhum canal";

        if (!oldState.channelId && newState.channelId) {
            voiceJoinTimestamps.set(member.id, Date.now());
            embed.setDescription(`🎧 ${Emojis.get(`_right_emoji`)} **Entrou** no canal ${newChannel}`) // ${Emojis.get(`_right_emoji`)}
                .setColor(0x77B255);
        } else if (oldState.channelId && !newState.channelId) {
            const joinTime = voiceJoinTimestamps.get(member.id) || Date.now();
            const duration = Date.now() - joinTime;
            const durationMinutes = Math.floor(duration / 60000);
            voiceJoinTimestamps.delete(member.id);

            embed.setDescription(`🎧 ${Emojis.get(`_left_emoji`)} **Saiu** do canal ${oldChannel} 🕒 **${durationMinutes} min**`) // ${Emojis.get(`_left_emoji`)}
                .setColor(0xDD2E44);
        } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const joinTime = voiceJoinTimestamps.get(member.id) || Date.now();
            const duration = Date.now() - joinTime;
            const durationMinutes = Math.floor(duration / 60000);
            voiceJoinTimestamps.set(member.id, Date.now());

            embed.setDescription(`**Mudou** ${Emojis.get(`loading_emoji`)} de ${oldChannel} para ${newChannel} 🕒 **${durationMinutes} min**`) // ${Emojis.get(`loading_emoji`)}
                .setColor(0xFFAA00);
        } else {
            return;
        }

        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Erro ao lidar com a atualização de estado de voz: ${error}`);
    }
}

module.exports = { handleVoiceStateUpdate };
