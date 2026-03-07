const { ActivityType, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');
const { configuracao, Emojis } = require('../DataBaseJson');

async function restart(client, status) {

    if (configuracao.get('ConfigChannels.systemlogs') == null) return;

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${Emojis.get(`restartbot_emoji`)} — OS Bot Reiniciado`)
        .addFields(
            { name: `${Emojis.get(`_tool_emoji`)} Versão do eOS`, value: `\`2.0.0\``, inline: true },
            { name: `${Emojis.get(`clock_emoji`)} Data`, value: `<t:${Math.ceil(Date.now() / 1000)}:R>`, inline: true },
        )
        .setFooter({ text: `OS Solutions` })
        .setTimestamp()

    const row222 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setURL('https://discord.gg/dreamcria')
                .setLabel('Website')
                .setDisabled(true)
                .setStyle(5),
            new ButtonBuilder()
                .setURL('https://discord.gg/dreamcria')
                .setLabel('Servidor de Suporte')
                .setStyle(5)
        );
        
        try {
            const channel = await client.channels.fetch(configuracao.get('ConfigChannels.systemlogs'));
            await channel.send({ content: ``, components: [row222], embeds: [embed] });   
        } catch (error) {        }
}


module.exports = {
    restart
}
