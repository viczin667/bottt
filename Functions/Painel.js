const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const startTime = Date.now();
const maxMemory = 100;
const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
const memoryUsagePercentage = (usedMemory / maxMemory) * 100;
const roundedPercentage = Math.min(100, Math.round(memoryUsagePercentage));

async function Painel(interaction, client) {

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId("painelconfigvendas").setLabel('Loja').setEmoji('1237160031347146812').setStyle(1),
      new ButtonBuilder().setCustomId("painelconfigticket").setLabel('Ticket').setEmoji('1236447625675407463').setStyle(1),
      new ButtonBuilder().setCustomId("painelconfigbv").setLabel('Boas Vindas').setEmoji('1178066050076643458').setStyle(1),
      new ButtonBuilder().setCustomId("actionsautomations").setLabel('Ações Automáticas').setEmoji('1237896873298104400').setStyle(2)
    );

  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId("painelpersonalizar").setLabel('Personalização').setEmoji('1178066208835252266').setStyle(1),
      new ButtonBuilder().setCustomId("rendimento").setLabel('Rendimento').setEmoji('1178086986360307732').setStyle(3),
      new ButtonBuilder().setCustomId("gerenciarconfigs").setLabel('Definições').setEmoji('1178066377014255828').setStyle(2)
    );

  const row4 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId("protecaoBot").setLabel('Proteção').setEmoji('1256776521239232532').setStyle(1)
    );

  await interaction.editReply({ 
    content: 'https://imgur.com/My4fEV7.gif', // Link direto para o GIF
    components: [row2, row3, row4] 
  });
}



async function Gerenciar2(interaction, client) {

  const ggg = produtos.valueArray();

  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
    .setTitle(`Painel de Administração`)
    .setDescription(`Senhor(a) **${interaction.user.username}**, escolha o que deseja fazer.`)
    .addFields(
      { name: `**Total de produtos fornecidos**`, value: `${ggg.length}` },
      { name: `**Moeda Padrão**`, value: `${configuracao.get("pagamentos.moeda") === "BRL" ? "\`BRL\` - \`pt_BR\`" : "\`USD\` - \`es_CO\`"}` }
    )
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null }
    )
    .setTimestamp()


  if (configuracao.get(`Instrucoes.mensagem`)) {
    let instruções = configuracao.get(`Instrucoes`)
    embed.addFields({ name: `Instruções ao Cliente`, value: `-# Mensagem Após a Entrega\n${instruções.mensagem}\n-# Nome do Botão:\n${instruções.nomebotao}\n-# Link do Botão:\n${instruções.linkbotao}` })
  }



  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("criarrrr")
        .setLabel('Criar')
        .setEmoji(`1178067873894236311`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("gerenciarotemae")
        .setLabel('Gerenciar')
        .setEmoji(`1178067945855910078`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("gerenciarposicao")
        .setLabel('Posições')
        .setEmoji(`1178086608004722689`)
        .setStyle(1)
    )

  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("marca-qrcode")
        .setLabel("Marca")
        .setEmoji(`1238298715869937685`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId(`altMoeda`)
        .setLabel(`Moeda`)
        .setEmoji(`1246953442283618334`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId(`extensoes`)
        .setLabel(`Extensões`)
        .setEmoji(`1293757911306338376`)
        .setDisabled(false)
        .setStyle(1),
    )

  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("definirinstrucoes")
      .setLabel(`Definir instruções`)
      .setEmoji(Emojis.get(`_mail_emoji`))
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId("definirduvidas") // botaoduvidas
      .setLabel(`Botão de Dúvidas`)
      .setEmoji(Emojis.get(`_staff_emoji`))
      .setStyle(2),
  )
  const botoesvoltar = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltar00")
      .setLabel('Voltar')
      .setEmoji(`1238413255886639104`)
      .setStyle(2),
  )



  await interaction.editReply({ embeds: [embed], components: [row2, row3, row4, botoesvoltar], content: `` })
}

async function definirduvidas(interaction, client) {

  let infoduvidas = configuracao.get(`BotaoDuvidas`) // 

  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
    .setTitle(`Botão de Dúvidas`)
    .setDescription(`Senhor(a) **${interaction.user.username}**, configure o botão de dúvidas.`)
    .addFields(
      { name: `Nome do Botão`, value: `\`${infoduvidas?.nomebotao ? infoduvidas.nomebotao : `Não Defindo`}\``, inline: true },
      { name: `Emoji do Botão`, value: `${infoduvidas?.emoji ? infoduvidas.emoji : `\`Sem Emoji\``}`, inline: true },
      { name: `Link do Botão`, value: `${infoduvidas?.linkbotao ? infoduvidas.linkbotao : `\`Não Defindo\``}`, inline: true },
    )
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null }
    )
    .setTimestamp()

  const botao = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ativarbotaoduvidas')
      .setLabel(`${infoduvidas?.status ? `Botão Ativado` : `Botão Desativado`} `)
      .setEmoji(Emojis.get(`_transfer_emoji`))
      .setStyle(infoduvidas?.status ? 3 : 4),
    new ButtonBuilder()
      .setCustomId('botaoduvidas')
      .setLabel('Definir botão de dúvidas')
      .setEmoji(Emojis.get(`_staff_emoji`))
      .setStyle(2),
  )

  const botao2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltar3")
      .setLabel('Voltar')
      .setEmoji(`1238413255886639104`)
      .setStyle(2),
  )

  await interaction.update({ embeds: [embed], components: [botao, botao2], content: `` })
}

function getGreeting() {
  const now = new Date();
  const brtHours = (now.getUTCHours() - 3 + 24) % 24; // Ajuste de UTC para BRT

  if (brtHours >= 18 || brtHours < 4) {
    return 'Boa noite';
  } else if (brtHours >= 12) {
    return 'Boa tarde';
  } else {
    return 'Bom dia';
  }
}


module.exports = {
  Painel,
  Gerenciar2,
  definirduvidas
}
