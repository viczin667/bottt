const Discord = require("discord.js");

const { getPermissions } = require("../../Functions/PermissionsCache");
const { Emojis, configuracao } = require("../../DataBaseJson/index");
const { TestarQRCode } = require("../../Functions/QRCode");
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'interactionCreate',
  async run(interaction, client) {
    if (interaction.type == Discord.InteractionType.ModalSubmit) {
      if (interaction.customId === 'qrcode-colors') {
        const corprincipal = interaction.fields.getTextInputValue('corprincipal');
        const corlateral = interaction.fields.getTextInputValue('corlateral');
        const tipo = interaction.fields.getTextInputValue('tipo').toLowerCase();
        let test = /^#[0-9A-F]{6}$/i

        if (!test.test(corprincipal) || !test.test(corlateral)) {
          return interaction.reply({ content: `${Emojis.get(`warn_emoji`)} Formato de cor inválido.`, ephemeral: true });
        }

        if (tipo != 'radial' && tipo != 'linear') {
          return interaction.reply({ content: `${Emojis.get(`warn_emoji`)} Tipo de gradiente inválido. (Radial ou Linear)`, ephemeral: true });
        }

        configuracao.set(`QRCode.principal`, corprincipal);
        configuracao.set(`QRCode.lateral`, corlateral);
        configuracao.set(`QRCode.gradient`, tipo);

        const embedprincipal = new EmbedBuilder()
          .setColor(corprincipal)
          .setDescription(`${Emojis.get(`confirmed_emoji`)} Cor principal alterada.`)

        const embedlateral = new EmbedBuilder()
          .setColor(corlateral)
          .setDescription(`${Emojis.get(`confirmed_emoji`)} Cor lateral alterada.`)

        const embedtipo = new EmbedBuilder()
          .setColor(corprincipal)
          .setDescription(`${Emojis.get(`confirmed_emoji`)} Tipo de gradiente alterado.`)

        await interaction.reply({ embeds: [embedtipo, embedprincipal, embedlateral], ephemeral: true });
      }
    }
    if (interaction.isButton()) {
      if (interaction.customId == 'qrcode-colors') {
        let principal = configuracao.get(`QRCode.principal`) || '#328dbc';
        let lateral = configuracao.get(`QRCode.lateral`) || '#000203';
        let gradient = configuracao.get(`QRCode.gradient`) || 'radial';

        const modal = new ModalBuilder()
          .setTitle(`Editando Cores do QRCode`)
          .setCustomId('qrcode-colors')

        const corprincipal = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('corprincipal')
            .setLabel('COR PRINCIPAL')
            .setValue(`${principal}`)
            .setStyle(1)
            .setRequired(true)
        )

        const corlateral = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('corlateral')
            .setLabel('COR LATERAL')
            .setValue(`${lateral}`)
            .setStyle(1)
            .setRequired(true)
        )

        const tipo = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('tipo')
            .setLabel('TIPO DE GRADIENTE')
            .setPlaceholder('radial ou linear')
            .setMaxLength(6)
            .setValue(`${gradient}`)
            .setStyle(1)
            .setRequired(true)
        )

        modal.addComponents(corprincipal, corlateral, tipo);
        await interaction.showModal(modal);
      }
      if (interaction.customId == 'qrcode-teste') {
        TestarQRCode(interaction, client);
      }
      if (interaction.customId == 'qrcode-button') {
        await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Aguarde...`, ephemeral: true });

        const umMinutoEmMilissegundos = 1 * 60 * 1000;
        const timeStamp = Date.now() + umMinutoEmMilissegundos;

        await interaction.editReply({
          content: `Por favor, envie o arquivo da imagem (PNG ou JPEG). Expira <t:${Math.ceil(timeStamp / 1000)}:R>.`,
          ephemeral: true,
        });

        const attachmentCollector = interaction.channel.createMessageCollector({
          filter: (m) => m.author.id === interaction.user.id,
          time: 120000,
        });

        attachmentCollector.on('collect', async (m) => {
          try {
            if (m.attachments.size > 0) {
              const attachment = m.attachments.first();
              if (attachment.name.endsWith('.png')) {
                const axios = require('axios');
                const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });

                const filePath = await saveAttachmentToFile(response.data);
                await interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} QRCode trocado com sucesso!`, ephemeral: true });
              } else {
                await interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} O arquivo precisa ser \`.png\``, ephemeral: true });
              }
            } else {
              await interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} Isso não é uma imagem!`, ephemeral: true });
            }

            m.delete();
            attachmentCollector.stop();
          } catch (error) {
            console.log(error);
            await interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} Erro ao trocar o QRCode.`, ephemeral: true });
            m.delete();
          }
        });

        attachmentCollector.on('end', async () => {
          if (!attachmentCollector.collected.size) {
            interaction.editReply({ content: `${Emojis.get(`warn_emoji`)} Tempo esgotado. ;)`, ephemeral: true }).catch();
          }
        });
      }
    }
  }
};

async function saveAttachmentToFile(buffer) {
  const path = require('path');
  const fs = require('fs').promises;
  const directoryName = 'Lib';
  const directoryPath = path.resolve(__dirname, '..', '..', directoryName);

  await fs.mkdir(directoryPath, { recursive: true });

  const filePath = path.join(directoryPath, 'aaaaa.png');
  await fs.writeFile(filePath, Buffer.from(buffer));
  return filePath;
}