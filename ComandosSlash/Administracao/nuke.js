const {
  Client,
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');
const { configuracao } = require('../../DataBaseJson/index.js');

module.exports = {
  name: 'nuke',
  description: 'Nuke a channel',
  options: [
    {
      name: 'channel',
      description: 'The channel to nuke',
      type: ApplicationCommandOptionType.Channel,
      required: false,
      channelTypes: [ChannelType.GuildText],
    },
  ],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async(client, interaction) => {

    const perm = await getPermissions(client.user.id);
    if (perm === null || !perm.includes(interaction.user.id)) {
        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Faltam permissões.`, ephemeral: true });
    }

    try {
      const channelOption = interaction.options.getChannel('channel') || interaction.channel;

      if (!channelOption || !channelOption.isTextBased()) {
        return interaction.reply({ content: 'Você deve selecionar um canal de texto para ser nukado.', ephemeral: true });
      }

      const newChannel = await channelOption.clone();
      
      if (configuracao.get(`AutomaticSettings.SistemaNukar.canais`)?.includes(channelOption.id)) {
        let canais = configuracao.get(`AutomaticSettings.SistemaNukar.canais`);
        let index = canais.indexOf(channelOption.id);
        canais[index] = newChannel.id;
        configuracao.set(`AutomaticSettings.SistemaNukar.canais`, canais);
      }

      await channelOption.delete();

      await interaction.reply({ content: `Canal foi nukado com sucesso!`, ephemeral: true });

      await newChannel.send({ content: `Nuked by \`${interaction.user.username}\`` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Ocorreu um erro ao processar o comando.', ephemeral: true });
    }
  },
};