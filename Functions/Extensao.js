const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");
const { JsonDatabase } = require("wio.db");

async function extensaoselect(interaction, client) {
  await interaction.deferUpdate();
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("lojadeextensao")
        .setLabel('Loja')
        .setStyle(1)
        .setDisabled(false)
    )
  await interaction.editReply({ content: ``, components: [row2], embeds: [], ephemeral: true, files: [] });
}

async function extensaoloja(interaction, client) {
  await interaction.deferUpdate();
  const select = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`extensaoapenasparaogeradorkkkk`)
      .setPlaceholder(`Clique aqui para selecionar`)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`Impulso Plugin`)
          .setValue(`impulsopluginsd`)
          .setDescription(`Venda Impulsos de forma Automática!`)
          .setEmoji(`1238300628225228961`)
      )
  )
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`voltar1`)
        .setLabel(`Voltar`)
        .setEmoji(`1238413255886639104`)
        .setStyle(2)
        .setDisabled(false)
    );
  await interaction.editReply({ content: ``, components: [select, row3], embeds: [], ephemeral: true, files: [] });
}

async function configurargeradorpainelconfig(interaction, client) {
  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc': configuracao.get('Cores.Principal')}`)
    .setTitle(`Painel do seu Gerador rOS`)
    .setDescription(`# Painel de configuração do seu Bot de gerador
> - Este Painel é dedicado a configuração do seu Gerador
> - Configure seu gerador com os botões abaixo !`)
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
    )
    .setTimestamp()

    const row2 = new ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
        .setCustomId("sistemagerador")
        .setLabel(`Configurar Gerador`)
        .setStyle(1),
    new ButtonBuilder()
        .setCustomId("sistemaowner")
        .setLabel(`Configuração Owner`)
        .setStyle(3)
    )

  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`voltar1`)
        .setLabel(`Voltar`)
        .setStyle(2)
        .setDisabled(false)
    )

  await interaction.update({ 
    content: ``, 
    components: [row2, row3], 
    embeds: [embed], 
    ephemeral: true, 
    files: [] 
  });
}



module.exports = {
  extensaoselect,
  extensaoloja,
  configurargeradorpainelconfig
};